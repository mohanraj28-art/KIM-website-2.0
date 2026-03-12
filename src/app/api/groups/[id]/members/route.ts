import { NextRequest } from 'next/server'
import { withAuth, successResponse, errorResponse } from '@/lib/api-helpers'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const manageMemberSchema = z.object({
    userId: z.string(),
})

// POST /api/groups/[id]/members - add user to group
export const POST = withAuth(async (req: NextRequest, ctx) => {
    const { id: groupId } = ctx.params
    try {
        const body = await req.json()
        const { userId } = manageMemberSchema.parse(body)

        // Verify group
        const group = await prisma.group.findFirst({
            where: { id: groupId, accountId: ctx.accountId }
        })
        if (!group) return errorResponse('Group not found', 404)

        // Verify user belongs to same account
        const user = await prisma.user.findFirst({
            where: { id: userId, accountId: ctx.accountId }
        })
        if (!user) return errorResponse('User not found', 404)

        const member = await prisma.groupMember.upsert({
            where: {
                groupId_userId: { groupId, userId }
            },
            create: {
                groupId,
                userId
            },
            update: {}
        })

        await prisma.auditLog.create({
            data: {
                action: 'group.member_added',
                result: 'SUCCESS',
                resourceId: groupId,
                accountId: ctx.accountId,
                userId: ctx.userId,
                metadata: { addedUserId: userId }
            }
        })

        return successResponse(member)
    } catch (error: any) {
        return errorResponse(error.message || 'Failed to add member')
    }
})

// DELETE /api/groups/[id]/members - remove user from group
// Usage: DELETE /api/groups/[id]/members?userId=...
export const DELETE = withAuth(async (req: NextRequest, ctx) => {
    const { id: groupId } = ctx.params
    const { searchParams } = req.nextUrl
    const userId = searchParams.get('userId')

    if (!userId) return errorResponse('userId is required')

    // Verify group
    const group = await prisma.group.findFirst({
        where: { id: groupId, accountId: ctx.accountId }
    })
    if (!group) return errorResponse('Group not found', 404)

    const deleted = await prisma.groupMember.deleteMany({
        where: {
            groupId,
            userId
        }
    })

    if (deleted.count === 0) return errorResponse('Member relationship not found', 404)

    await prisma.auditLog.create({
        data: {
            action: 'group.member_removed',
            result: 'SUCCESS',
            resourceId: groupId,
            accountId: ctx.accountId,
            userId: ctx.userId,
            metadata: { removedUserId: userId }
        }
    })

    return successResponse({ removed: true })
})
