const { PrismaClient } = require('../src/generated/client');
const prisma = new PrismaClient();

async function main() {
    const groupCount = await prisma.group.count();
    const groups = await prisma.group.findMany({
        select: { name: true, accountId: true }
    });

    console.log(`Total Groups: ${groupCount}`);
    const byAccount = {};
    groups.forEach(g => {
        byAccount[g.accountId] = (byAccount[g.accountId] || 0) + 1;
        console.log(`- ${g.name} (${g.accountId})`);
    });
    console.log('Groups by Account:', byAccount);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
