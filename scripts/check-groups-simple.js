const { PrismaClient } = require('../src/generated/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const groups = await prisma.group.findMany();
        console.log('--- All Groups ---');
        groups.forEach(g => console.log(`Group: ${g.name}, Account: ${g.accountId}, ID: ${g.id}`));
    } catch (e) {
        console.error('Error fetching groups:', e);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
