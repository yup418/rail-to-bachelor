import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
    try {
        // 先检查是否已存在
        const existing = await prisma.user.findFirst({
            where: { username: 'admin' }
        });

        if (existing) {
            console.log('⚠️  admin 用户已存在，正在更新密码...');

            // 更新密码
            const hashedPassword = await bcrypt.hash('admin123', 10);
            const updated = await prisma.user.update({
                where: { id: existing.id },
                data: {
                    password: hashedPassword,
                    role: 'ADMIN',
                },
            });

            console.log('✅ admin 密码已更新！');
            console.log('用户名: admin');
            console.log('密码: admin123');
            console.log('角色:', updated.role);
        } else {
            // 创建新用户
            const hashedPassword = await bcrypt.hash('admin123', 10);

            const user = await prisma.user.create({
                data: {
                    username: 'admin',
                    password: hashedPassword,
                    role: 'ADMIN',
                },
            });

            console.log('✅ admin 用户创建成功！');
            console.log('用户名: admin');
            console.log('密码: admin123');
            console.log('角色:', user.role);
            console.log('ID:', user.id);
        }
    } catch (e: any) {
        console.error('操作失败:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();
