import { NextRequest } from 'next/server'
import { withAuth, successResponse, errorResponse } from '@/lib/api-helpers'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const updateGroupSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
})

// GET /api/groups/[id] - get single group details
export const GET = withAuth(async (req: NextRequest, ctx) => {
    const { id } = ctx.params

    const group = await prisma.group.findFirst({
        where: { id, accountId: ctx.accountId },
        include: {
            members: {
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                            displayName: true,
                        }
                    }
                }
            },
            roles: {
                include: {
                    role: {
                        include: {
                            permissions: {
                                include: {
                                    permission: true
                                }
                            }
                        }
                    }
                }
            }
        }
    })

    if (!group) return errorResponse('Group not found', 404)

    const formatted = {
        id: group.id,
        name: group.name,
        description: group.description,
        members: group.members.map(m => m.user),
        roles: group.roles.map((r: any) => ({
            id: r.role.id,
            name: r.role.name,
            key: r.role.key,
            permissions: r.role.permissions.map((p: any) => p.permission.key)
        })),
        createdAt: group.createdAt
    }

    return successResponse(formatted)
})

// PATCH /api/groups/[id] - update group
export const PATCH = withAuth(async (req: NextRequest, ctx) => {
    const { id } = ctx.params
    try {
        const body = await req.json()
        const data = updateGroupSchema.parse(body)

        const group = await prisma.group.findFirst({
            where: { id, accountId: ctx.accountId }
        })

        if (!group) return errorResponse('Group not found', 404)

        const updated = await prisma.group.update({
            where: { id },
            data
        })

        await prisma.auditLog.create({
            data: {
                action: 'group.updated',
                result: 'SUCCESS',
                resourceId: id,
                accountId: ctx.accountId,
                userId: ctx.userId,
                metadata: { prev: group, next: updated }
            }
        })

        return successResponse(updated)
    } catch (error: any) {
        return errorResponse(error.message || 'Failed to update group')
    }
})

// DELETE /api/groups/[id] - delete group
export const DELETE = withAuth(async (req: NextRequest, ctx) => {
    const { id } = ctx.params

    const group = await prisma.group.findFirst({
        where: { id, accountId: ctx.accountId }
    })

    if (!group) return errorResponse('Group not found', 404)

    await prisma.group.delete({
        where: { id }
    })

    await prisma.auditLog.create({
        data: {
            action: 'group.deleted',
            result: 'SUCCESS',
            resourceId: id,
            accountId: ctx.accountId,
            userId: ctx.userId,
            metadata: { groupName: group.name }
        }
    })

    return successResponse({ deleted: true })
})
