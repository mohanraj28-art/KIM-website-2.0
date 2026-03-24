import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth/jwt'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
    const payload = await getUserFromRequest(req)

    if (!payload) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: payload.sub },
            include: {
                mfaSettings: {
                    where: { verified: true },
                    select: { type: true, primary: true }
                },
                tenantMembers: {
                    include: {
                        tenant: true,
                        role: { include: { permissions: { include: { permission: true } } } }
                    }
                },
                groupMembers: {
                    include: {
                        group: {
                            include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } }
                        }
                    }
                }
            }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const mfaEnabled = user.mfaSettings.length > 0
        const primaryMember = user.tenantMembers[0]

        // Aggregate User Permissions
        const permissionSet = new Set<string>();

        // 1. permissions from Tenant Roles
        for (const tm of user.tenantMembers) {
            if (tm.role) {
                for (const rp of tm.role.permissions) {
                    permissionSet.add(rp.permission.key);
                }
            }
        }

        // 2. permissions from Group Roles
        for (const gm of user.groupMembers) {
            for (const gr of gm.group.roles) {
                if (gr.role) {
                    for (const rp of gr.role.permissions) {
                        permissionSet.add(rp.permission.key);
                    }
                }
            }
        }

        // Fallback for primary owners
        const account = await prisma.account.findUnique({
            where: { id: payload.tid },
            include: { users: { orderBy: { createdAt: 'asc' }, take: 1 } }
        });
        const isOwner = account?.users[0]?.id === payload.sub;
        if (isOwner) {
            // Implicitly indicate wildcard or super access
            permissionSet.add('*');
        }

        return NextResponse.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    displayName: user.displayName,
                    avatarUrl: user.avatarUrl,
                    emailVerified: user.emailVerified,
                    createdAt: user.createdAt,
                    lastSignInAt: user.lastSignInAt,
                    mfaEnabled,
                    permissions: Array.from(permissionSet)
                },
                tenant: primaryMember ? {
                    id: primaryMember.tenant.id,
                    name: primaryMember.tenant.name,
                    slug: primaryMember.tenant.slug,
                    logoUrl: primaryMember.tenant.logoUrl,
                    role: primaryMember.role?.key || 'member',
                } : null,
            },
        })
    } catch (error) {
        console.error('[Me API Error]:', error)
        return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
    }
}
