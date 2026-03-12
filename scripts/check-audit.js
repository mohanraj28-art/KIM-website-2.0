const { PrismaClient } = require('../src/generated/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- RECENT GROUP AUDIT LOGS ---');
    const logs = await prisma.auditLog.findMany({
        where: { action: { contains: 'group' } },
        orderBy: { createdAt: 'desc' },
        take: 20
    });

    logs.forEach(l => {
        console.log(`[${l.createdAt.toISOString()}] ${l.action} - Result: ${l.result} - ResourceID: ${l.resourceId}`);
        if (l.metadata) console.log(`   Metadata: ${JSON.stringify(l.metadata)}`);
    });
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
