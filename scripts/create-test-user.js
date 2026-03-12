const { PrismaClient } = require('../src/generated/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    const email = 'test@test.com';
    const password = 'password';
    const accountId = 'default';
    const hash = await bcrypt.hash(password, 12);

    // Upsert account
    await prisma.account.upsert({
        where: { id: accountId },
        create: { id: accountId, name: 'Default', slug: accountId },
        update: {}
    });

    // Create user
    const user = await prisma.user.upsert({
        where: { accountId_email: { accountId, email } },
        create: {
            email,
            accountId,
            emailVerified: true,
        },
        update: { emailVerified: true }
    });

    // Create/update password
    await prisma.password.deleteMany({ where: { userId: user.id } });
    await prisma.password.create({
        data: {
            userId: user.id,
            hash: hash
        }
    });

    console.log('Test user created/updated:');
    console.log('Email:', email);
    console.log('Password:', password);
}

main().catch(console.error).finally(() => prisma.$disconnect());
