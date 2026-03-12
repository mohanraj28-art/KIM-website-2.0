const { PrismaClient } = require('../src/generated/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    const email = 'mohanrajdhoni71@gmail.com';
    const user = await prisma.user.findFirst({
        where: { email },
        include: { passwords: true }
    });

    if (!user) {
        console.log('USER_NOT_FOUND');
    } else {
        console.log('USER_FOUND');
        console.log('DB_EMAIL:"' + user.email + '"');
        console.log('EMAIL_LENGTH:', user.email.length);
        console.log('ACCOUNT_ID:"' + user.accountId + '"');
        console.log('ACCOUNT_ID_LENGTH:', user.accountId.length);
        console.log('BANNED:', user.banned);
        console.log('LOCKED:', user.locked);
        if (user.passwords.length === 0) {
            console.log('NO_PASSWORD_HASH');
        } else {
            console.log('HASH_EXISTS');
            const password = 'Password123!';
            const isValid = await bcrypt.compare(password, user.passwords[0].hash);
            console.log('PASSWORD_VALID:', isValid);
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
