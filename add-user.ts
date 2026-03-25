
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log('Adding emergency access user...');

    // Add the gmail user just in case
    await prisma.user.upsert({
        where: { email: 'farisashraf78@gmail.com' },
        update: {},
        create: {
            email: 'farisashraf78@gmail.com',
            name: 'Faris (Admin)',
            role: 'MANAGER',
        },
    });

    // Also add a generic test user
    await prisma.user.upsert({
        where: { email: 'admin@talabat.com' },
        update: {},
        create: {
            email: 'admin@talabat.com',
            name: 'Test Admin',
            role: 'MANAGER',
        },
    });

    console.log('✅ Added users: farisashraf78@gmail.com and admin@talabat.com');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
