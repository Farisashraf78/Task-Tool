import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany();
    console.log("Users in DB:");
    users.forEach(u => console.log(`- ${u.name} (Role: ${u.role}, ID: ${u.id})`));

    const maha = users.find(u => u.name.toLowerCase().includes("maha"));
    const faris = users.find(u => u.name.toLowerCase().includes("faris"));
    const other = users.find(u => !u.name.toLowerCase().includes("maha") && !u.name.toLowerCase().includes("faris"));

    console.log("\nTesting logic simulation...");

    if (maha) {
        console.log(`Maha (${maha.name}) can create task: ${maha.name.toLowerCase().includes("maha")}`);
    }
    if (faris) {
        console.log(`Faris (${faris.name}) can create task: ${faris.name.toLowerCase().includes("maha")}`);
        console.log(`Faris (${faris.name}) can update any status: ${faris.name.toLowerCase().includes("faris")}`);
    }
    if (other) {
        console.log(`Other (${other.name}) can create task: ${other.name.toLowerCase().includes("maha")}`);
        console.log(`Other (${other.name}) can update any status (as non-manager/assignee): ${other.name.toLowerCase().includes("faris")}`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
