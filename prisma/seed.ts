import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create Manager
    const maha = await prisma.user.upsert({
        where: { email: 'mhemdan@talabat.com' },
        update: {},
        create: {
            email: 'mhemdan@talabat.com',
            name: 'Maha Samman',
            role: 'MANAGER',
        },
    });

    // Create Team Members
    const faris = await prisma.user.upsert({
        where: { email: 'fares.elbarbary.p72_tpeg.ext@talabat.com' },
        update: {},
        create: {
            email: 'fares.elbarbary.p72_tpeg.ext@talabat.com',
            name: 'Faris',
            role: 'MEMBER',
        },
    });

    const mansour = await prisma.user.upsert({
        where: { email: 'mansour.essam@talabat.com' },
        update: {},
        create: {
            email: 'mansour.essam@talabat.com',
            name: 'Mansour',
            role: 'MEMBER',
        },
    });

    const doaa = await prisma.user.upsert({
        where: { email: 'doaa.m.2@talabat.com' },
        update: {},
        create: {
            email: 'doaa.m.2@talabat.com',
            name: 'Doaa',
            role: 'MEMBER',
        },
    });

    const marim = await prisma.user.upsert({
        where: { email: 'melbasyouny@talabat.com' },
        update: {},
        create: {
            email: 'melbasyouny@talabat.com',
            name: 'Marim',
            role: 'MEMBER',
        },
    });

    const nourhan = await prisma.user.upsert({
        where: { email: 'nourhan.agam@talabat.com' },
        update: {},
        create: {
            email: 'nourhan.agam@talabat.com',
            name: 'Nourhan',
            role: 'MEMBER',
        },
    });

    const ghofran = await prisma.user.upsert({
        where: { email: 'ghofran.elareeny@talabat.com' },
        update: {},
        create: {
            email: 'ghofran.elareeny@talabat.com',
            name: 'Ghofran',
            role: 'MEMBER',
        },
    });

    console.log('✅ Users created');

    // Clear existing data
    await prisma.activityLog.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();

    // Create sample tasks with realistic assignments
    const task1 = await prisma.task.create({
        data: {
            title: 'Review Q4 Marketing Campaign',
            description: 'Review and approve the Q4 marketing campaign materials before launch',
            priority: 'HIGH',
            status: 'IN_PROGRESS',
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
            creatorId: maha.id,
            assigneeId: faris.id,
        },
    });

    const task2 = await prisma.task.create({
        data: {
            title: 'Update Customer Support Scripts',
            description: 'Update the customer support scripts with new product information',
            priority: 'MEDIUM',
            status: 'NEW',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            creatorId: maha.id,
            assigneeId: mansour.id,
        },
    });

    const task3 = await prisma.task.create({
        data: {
            title: 'Prepare Team Meeting Presentation',
            description: 'Create slides for next week team meeting on Q1 goals',
            priority: 'URGENT',
            status: 'UNDER_REVIEW',
            dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
            creatorId: maha.id,
            assigneeId: faris.id,
        },
    });

    const task4 = await prisma.task.create({
        data: {
            title: 'Analyze Customer Feedback Data',
            description: 'Review and summarize customer feedback from last month',
            priority: 'MEDIUM',
            status: 'NEW',
            dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
            creatorId: maha.id,
            assigneeId: doaa.id,
        },
    });

    const task5 = await prisma.task.create({
        data: {
            title: 'Social Media Content Calendar',
            description: 'Create content calendar for next month social media posts',
            priority: 'HIGH',
            status: 'IN_PROGRESS',
            dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days
            creatorId: maha.id,
            assigneeId: marim.id,
        },
    });

    const task6 = await prisma.task.create({
        data: {
            title: 'Develop Training Material',
            description: 'Create training materials for new team members',
            priority: 'MEDIUM',
            status: 'NEW',
            dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days
            creatorId: maha.id,
            assigneeId: nourhan.id,
        },
    });

    const task7 = await prisma.task.create({
        data: {
            title: 'Quality Assurance Review',
            description: 'Conduct QA review of recent process changes',
            priority: 'HIGH',
            status: 'NEW',
            dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days
            creatorId: maha.id,
            assigneeId: ghofran.id,
        },
    });

    console.log('✅ Tasks created');

    // Create sample projects
    const project1 = await prisma.project.create({
        data: {
            title: 'Q1 2025 Marketing Campaign',
            description: 'Launch comprehensive marketing campaign for Q1 including social media, email, and content strategy',
            priority: 'HIGH',
            status: 'ACTIVE',
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            creatorId: maha.id,
            assignees: {
                connect: [{ id: faris.id }, { id: marim.id }, { id: doaa.id }]
            }
        },
    });

    const project2 = await prisma.project.create({
        data: {
            title: 'Customer Support Excellence Initiative',
            description: 'Improve customer support processes, training, and scripts',
            priority: 'MEDIUM',
            status: 'ACTIVE',
            dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
            creatorId: maha.id,
            assignees: {
                connect: [{ id: mansour.id }, { id: nourhan.id }]
            }
        },
    });

    const project3 = await prisma.project.create({
        data: {
            title: 'Team Development & Training',
            description: 'Create comprehensive training materials and onboarding processes',
            priority: 'MEDIUM',
            status: 'ACTIVE',
            dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days
            creatorId: maha.id,
            assignees: {
                connect: [{ id: ghofran.id }, { id: nourhan.id }]
            }
        },
    });

    console.log('✅ Projects created');

    // Link some tasks to projects
    await prisma.task.update({
        where: { id: task1.id },
        data: { projectId: project1.id }
    });

    await prisma.task.update({
        where: { id: task5.id },
        data: { projectId: project1.id }
    });

    await prisma.task.update({
        where: { id: task2.id },
        data: { projectId: project2.id }
    });

    await prisma.task.update({
        where: { id: task6.id },
        data: { projectId: project3.id }
    });

    // Add activity logs with new entityType and entityId fields
    await prisma.activityLog.create({
        data: {
            taskId: task1.id,
            userId: maha.id,
            action: 'created',
            entityType: 'TASK',
            entityId: task1.id,
        },
    });

    await prisma.activityLog.create({
        data: {
            taskId: task1.id,
            userId: faris.id,
            action: 'status_changed',
            entityType: 'TASK',
            entityId: task1.id,
            field: 'status',
            oldValue: 'NEW',
            newValue: 'IN_PROGRESS',
        },
    });

    await prisma.activityLog.create({
        data: {
            taskId: task3.id,
            userId: maha.id,
            action: 'created',
            entityType: 'TASK',
            entityId: task3.id,
        },
    });

    await prisma.activityLog.create({
        data: {
            taskId: task3.id,
            userId: faris.id,
            action: 'status_changed',
            entityType: 'TASK',
            entityId: task3.id,
            field: 'status',
            oldValue: 'NEW',
            newValue: 'IN_PROGRESS',
        },
    });

    await prisma.activityLog.create({
        data: {
            taskId: task3.id,
            userId: faris.id,
            action: 'status_changed',
            entityType: 'TASK',
            entityId: task3.id,
            field: 'status',
            oldValue: 'IN_PROGRESS',
            newValue: 'UNDER_REVIEW',
        },
    });

    // Add project activity logs
    await prisma.activityLog.create({
        data: {
            projectId: project1.id,
            userId: maha.id,
            action: 'created',
            entityType: 'PROJECT',
            entityId: project1.id,
        },
    });

    await prisma.activityLog.create({
        data: {
            projectId: project2.id,
            userId: maha.id,
            action: 'created',
            entityType: 'PROJECT',
            entityId: project2.id,
        },
    });

    console.log('✅ Database seeded successfully!');
    console.log('');
    console.log('👤 Manager:');
    console.log('   Maha Samman - mhemdan@talabat.com');
    console.log('');
    console.log('👥 Team Members:');
    console.log('   Faris - fares.elbarbary.p72_tpeg.ext@talabat.com');
    console.log('   Mansour - mansour.essam@talabat.com');
    console.log('   Doaa - doaa.m.2@talabat.com');
    console.log('   Marim - melbasyouny@talabat.com');
    console.log('   Nourhan - nourhan.agam@talabat.com');
    console.log('   Ghofran - ghofran.elareeny@talabat.com');
    console.log('');
    console.log('📋 Tasks created: 7');
    console.log('🎯 Projects created: 3');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
