const { PrismaClient } = require('../src/generated/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    const email = 'mohanrajdhoni71@gmail.com';
    const password = 'Password123!';
    const hash = await bcrypt.hash(password, 12);

    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
        console.log('User not found');
        return;
    }

    // Delete old passwords and add new one
    await prisma.password.deleteMany({ where: { userId: user.id } });
    await prisma.password.create({
        data: {
            userId: user.id,
            hash: hash
        }
    });

    console.log('Password reset successfully to: Password123!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
