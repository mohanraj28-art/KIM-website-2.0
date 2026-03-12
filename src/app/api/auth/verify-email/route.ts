import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
    const token = req.nextUrl.searchParams.get('token')
    if (!token) {
        return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    try {
        const verificationToken = await prisma.verificationToken.findUnique({
            where: { token }
        })

        if (!verificationToken || verificationToken.type !== 'EMAIL_VERIFICATION') {
            return NextResponse.json({ error: 'Invalid verification token' }, { status: 400 })
        }

        if (verificationToken.expiresAt < new Date()) {
            return NextResponse.json({ error: 'Token has expired' }, { status: 400 })
        }

        if (verificationToken.usedAt) {
            return NextResponse.json({ error: 'Token has already been used' }, { status: 400 })
        }

        // Verify the user
        await prisma.$transaction([
            prisma.user.update({
                where: { id: verificationToken.userId! },
                data: {
                    emailVerified: true,
                    emailVerifiedAt: new Date(),
                }
            }),
            prisma.verificationToken.update({
                where: { id: verificationToken.id },
                data: { usedAt: new Date() }
            })
        ])

        return NextResponse.json({ success: true, message: 'Email verified successfully' })
    } catch (error) {
        console.error('[Verify Email API Error]:', error)
        return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
    }
}
