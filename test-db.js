// 测试数据库连接
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
    try {
        console.log('🔍 正在测试数据库连接...');

        // 尝试简单查询
        await prisma.$queryRaw`SELECT 1`;

        console.log('✅ 数据库连接成功！');

        // 尝试查询用户表
        const userCount = await prisma.user.count();
        console.log(`📊 用户数量: ${userCount}`);

    } catch (error) {
        console.error('❌ 数据库连接失败:');
        console.error('错误类型:', error.constructor.name);
        console.error('错误信息:', error.message);

        if (error.message.includes("Can't reach database")) {
            console.log('\n💡 建议:');
            console.log('1. 检查 Supabase Dashboard，数据库可能已暂停');
            console.log('2. 点击 "Resume" 按钮唤醒数据库');
            console.log('3. 等待 1-2 分钟后重试');
        }
    } finally {
        await prisma.$disconnect();
    }
}

testConnection();
