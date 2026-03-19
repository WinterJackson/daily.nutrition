import { execSync } from 'child_process';

const SCRIPTS = [
    'create-admin.ts',      // 1. Critical: Bootstraps the Super Admin, Site Settings, and generic Service
    'seed-users.ts',        // 2. Demo data: Creates support users
    'seed-services.ts',     // 3. Demo data: Real-world mock services
    'seed-blog.ts',         // 4. Demo data: Mock blog posts and categories
    'seed-bookings.ts',     // 5. Demo data: Mock bookings (depends on services)
    'seed-inquiries.ts',    // 6. Demo data: Mock inquiries (depends on users for assignment)
    'seed-testimonials.ts', // 7. Demo data: Mock testimonials (depends on services)
];

async function runAllSeeds() {
    console.log("🚀 Starting Master Database Seed Protocol...\n");

    for (const script of SCRIPTS) {
        console.log(`\n================================`);
        console.log(`⏳ Executing: ${script}`);
        console.log(`================================`);

        try {
            // Using npx tsx natively on the script path
            execSync(`npx tsx scripts/${script}`, { stdio: 'inherit' });
            console.log(`✅ Success: ${script}`);

            // Give the Vercel Postgres connection pool 3 seconds to aggressively clean up 
            // the dropped TCP sockets before hammering it with a new Node process.
            console.log(`⏳ Cooling down DB connection pool...`);
            execSync('sleep 3');
        } catch (error) {
            console.error(`\n❌ FAILED to execute ${script}`);
            console.error(error);
            console.log(`\n⚠️ ABORTING MASTER SEED SEQUENCE due to failure in ${script}.`);
            process.exit(1);
        }
    }

    console.log("\n🎉 ALL MOCK DATA AND ADMIN CREDENTIALS SEEDED SUCCESSFULLY!");
}

runAllSeeds().catch(console.error);
