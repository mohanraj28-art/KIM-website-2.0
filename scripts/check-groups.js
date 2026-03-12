const { PrismaClient } = require('../src/generated/client');
const prisma = new PrismaClient();

async function main() {
    const groups = await prisma.group.findMany({
        include: {
            _count: {
                select: { members: true, roles: true }
            }
        }
    });

    console.log('--- All Groups in Database ---');
    if (groups.length === 0) {
        console.log('No groups found.');
    } else {
        console.log(JSON.stringify(groups.map(g => ({
            id: g.id,
            name: g.name,
            accountId: g.accountId,
            memberCount: g._count.members,
            roleCount: g._count.roles
        })), null, 2));
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
