import { NextRequest } from 'next/server'
import { withAuth, successResponse, errorResponse } from '@/lib/api-helpers'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const assignRoleSchema = z.object({
    groupId: z.string(),
    roleId: z.string(),
})

// POST /api/groups/roles - assign a role to a group
export const POST = withAuth(async (req: NextRequest, ctx) => {
    try {
        const body = await req.json()
        const { groupId, roleId } = assignRoleSchema.parse(body)

        // Verify group exists and belongs to account
        const group = await prisma.group.findFirst({
            where: { id: groupId, accountId: ctx.accountId }
        })

        if (!group) return errorResponse('Group not found', 404)

        // Verify role exists and belongs to account (or is system)
        const role = await prisma.role.findFirst({
            where: {
                id: roleId,
                OR: [
                    { accountId: ctx.accountId },
                    { isSystem: true }
                ]
            }
        })

        if (!role) return errorResponse('Role not found', 404)

        // Create the assignment
        const assignment = await prisma.groupRole.upsert({
            where: {
                groupId_roleId: { groupId, roleId }
            },
            create: {
                groupId,
                roleId,
                accountId: ctx.accountId
            },
            update: {}
        })

        // Audit log
        await prisma.auditLog.create({
            data: {
                action: 'group.role_assigned',
                result: 'SUCCESS',
                resourceId: groupId,
                accountId: ctx.accountId,
                userId: ctx.userId,
                metadata: { roleId, roleName: role.name }
            }
        })

        return successResponse(assignment)
    } catch (error: any) {
        return errorResponse(error.message || 'Failed to assign role')
    }
})

// DELETE /api/groups/roles - remove a role from a group
export const DELETE = withAuth(async (req: NextRequest, ctx) => {
    try {
        const { searchParams } = req.nextUrl
        const groupId = searchParams.get('groupId')
        const roleId = searchParams.get('roleId')

        if (!groupId || !roleId) return errorResponse('Missing groupId or roleId')

        const deleted = await prisma.groupRole.deleteMany({
            where: {
                groupId,
                roleId,
                accountId: ctx.accountId
            }
        })

        if (deleted.count === 0) return errorResponse('Assignment not found', 404)

        // Audit log
        await prisma.auditLog.create({
            data: {
                action: 'group.role_removed',
                result: 'SUCCESS',
                resourceId: groupId,
                accountId: ctx.accountId,
                userId: ctx.userId,
                metadata: { roleId }
            }
        })

        return successResponse({ deleted: true })
    } catch (error: any) {
        return errorResponse(error.message || 'Failed to remove role')
    }
})
