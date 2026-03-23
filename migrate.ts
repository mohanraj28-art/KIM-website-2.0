import { PrismaClient } from './src/generated/client/index.js'

const local = new PrismaClient({
    datasources: {
        db: { url: "postgresql://postgres:MR%40mech2003@localhost:5432/KIM?schema=public" }
    }
})

const remote = new PrismaClient({
    datasources: {
        db: { url: "postgresql://postgres:Mech%402026SQL@db.udzqclmxnmojsdpmuewn.supabase.co:5432/postgres" }
    }
})

async function main() {
    console.log("🚀 Starting data migration from localhost to Supabase...");

    const tables = [
        'account',
        'user',
        'tenant',
        'group',
        'role',
        'permission',
        'apiKey',
        'webhook',
        'emailTemplate',
        'password',
        'socialAccount',
        'mfaSetting',
        'verificationToken',
        'device',
        'passkey',
        'session',
        'notification',
        'tenantMember',
        'groupMember',
        'rolePermission',
        'groupRole',
        'auditLog'
    ]

    for (const table of tables) {
        try {
            console.log(`\n⏳ Extracting data for: ${table}`)
            // @ts-ignore
            const records = await local[table].findMany();
            console.log(`✅ Found ${records.length} records. Uploading...`)

            if (records.length > 0) {
                // @ts-ignore
                await remote[table].createMany({
                    data: records,
                    skipDuplicates: true
                });
                console.log(`🔥 Successfully migrated ${records.length} records into ${table}.`)
            }
        } catch (err: any) {
            console.error(`❌ Error migrating ${table}:`, err.message)
        }
    }
    console.log("\n🎉 ALL DONE!");
}

main()
    .catch(console.error)
    .finally(async () => {
        await local.$disconnect()
        await remote.$disconnect()
    });
