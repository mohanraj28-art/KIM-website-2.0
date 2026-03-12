const { PrismaClient } = require('../src/generated/client');
const prisma = new PrismaClient();

async function main() {
    // List of permissions to ensure exist and assign to all roles
    const permissionsToAssign = [
        { key: 'users:create', name: 'Create User', category: 'Users' },
        { key: 'users:view', name: 'View Users', category: 'Users' },
        { key: 'roles:assign', name: 'Assign Roles', category: 'Roles' },
        { key: 'groups:manage', name: 'Manage Groups', category: 'Groups' },
        { key: 'audit:view', name: 'View Audit Logs', category: 'Audit' },
    ];

    console.log('--- Ensuring Permissions Exist ---');
    const dbPermissions = [];
    for (const p of permissionsToAssign) {
        const dbPerm = await prisma.permission.upsert({
            where: { key: p.key },
            update: { name: p.name, category: p.category },
            create: { key: p.key, name: p.name, category: p.category },
        });
        dbPermissions.push(dbPerm);
        console.log(`Verified permission: ${p.key}`);
    }

    console.log('\n--- Assigning to All Roles ---');
    const roles = await prisma.role.findMany();
    console.log(`Found ${roles.length} roles.`);

    for (const role of roles) {
        console.log(`Processing role: ${role.name} (${role.key})`);

        for (const perm of dbPermissions) {
            await prisma.rolePermission.upsert({
                where: {
                    roleId_permissionId: {
                        roleId: role.id,
                        permissionId: perm.id,
                    }
                },
                update: {},
                create: {
                    roleId: role.id,
                    permissionId: perm.id,
                }
            });
            console.log(`  Linked ${perm.key} to ${role.name}`);
        }
    }

    console.log('\nDone!');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
