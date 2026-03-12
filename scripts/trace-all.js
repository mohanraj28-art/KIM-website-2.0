const { PrismaClient } = require('../src/generated/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- USERS ---');
    const users = await prisma.user.findMany({ select: { email: true, accountId: true } });
    users.forEach(u => console.log(`User: ${u.email}, Account: ${u.accountId}`));

    console.log('\n--- ACCOUNTS ---');
    const accounts = await prisma.account.findMany();
    accounts.forEach(a => console.log(`Account ID: ${a.id}, Name: ${a.name}, Slug: ${a.slug}`));

    console.log('\n--- GROUPS ---');
    const groups = await prisma.group.findMany();
    groups.forEach(g => console.log(`Group: ${g.name}, Account: ${g.accountId}, ID: ${g.id}`));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
