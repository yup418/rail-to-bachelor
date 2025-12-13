import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createUser() {
    try {
        const hashedPassword = await bcrypt.hash('yuxin', 10);

        const user = await prisma.user.create({
            data: {
                username: 'yuxin',
                password: hashedPassword,
                role: 'USER',
            },
        });

        console.log('✅ 用户创建成功！');
        console.log('用户名:', user.username);
        console.log('角色:', user.role);
        console.log('ID:', user.id);
    } catch (e: any) {
        if (e.code === 'P2002') {
            console.log('❌ 用户名已存在');
        } else {
            console.error('创建失败:', e.message);
        }
    } finally {
        await prisma.$disconnect();
    }
}

createUser();
