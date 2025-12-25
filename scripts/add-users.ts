
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Connecting to database...');

    // 1. Create Admin
    // Username is not unique, so we can't upsert by it. We check uniqueness manually or use email if unique.
    // Assuming email IS unique in schema.

    const adminEmail = 'admin@example.com';
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

    if (!existingAdmin) {
        await prisma.user.create({
            data: {
                username: 'admin',
                password: 'admin',
                role: 'ADMIN',
                email: adminEmail,
            }
        });
        console.log('✅ Administrator created: admin');
    } else {
        console.log('ℹ️ Administrator already exists.');
    }

    // 2. Create User yuxin
    const userEmail = 'yuxin@example.com';
    const existingUser = await prisma.user.findUnique({ where: { email: userEmail } });

    if (!existingUser) {
        await prisma.user.create({
            data: {
                username: 'yuxin',
                password: 'yuxin',
                role: 'USER',
                email: userEmail,
            }
        });
        console.log('✅ User yuxin created: yuxin');
    } else {
        console.log('ℹ️ User yuxin already exists.');
    }

    // Optional: Update username if it doesn't match login (since username is not unique constraint)
    // For this quick script, creation is enough.
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
