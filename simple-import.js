// 简化版导入 - 只导入核心数据
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: 'postgresql://postgres:ORUjeqxlsddJjJJONYMLgMGFQkswghPt@turntable.proxy.rlwy.net:29340/railway'
        }
    }
});

async function simpleImport() {
    try {
        console.log('📥 简化导入 - 只导入用户数据...\n');

        const backup = JSON.parse(fs.readFileSync('supabase-backup.json', 'utf8'));

        // 只导入用户
        console.log('1️⃣ 导入用户...');
        for (const user of backup.users) {
            await prisma.user.upsert({
                where: { id: user.id },
                update: {},
                create: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    password: user.password,
                    avatarUrl: user.avatarUrl,
                    role: user.role,
                    level: user.level,
                    xp: user.xp,
                    streak: user.streak,
                    lastLogin: new Date(user.lastLogin),
                    createdAt: new Date(user.createdAt)
                }
            });
        }
        console.log(`   ✅ 导入 ${backup.users.length} 个用户\n`);

        console.log('✅ 导入完成！');
        console.log('\n📝 说明:');
        console.log('   - 用户数据已导入');
        console.log('   - 试卷和题目需要重新导入（通过管理员界面）');
        console.log('   - 或者你可以继续使用应用，数据会自动生成');

    } catch (error) {
        console.error('❌ 导入失败:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

simpleImport();
