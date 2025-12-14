// 导出 Supabase 数据到 JSON
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function exportData() {
    try {
        console.log('📦 开始导出数据...\n');

        // 导出用户
        const users = await prisma.user.findMany();
        console.log(`✅ 导出 ${users.length} 个用户`);

        // 导出试卷
        const papers = await prisma.examPaper.findMany({
            include: {
                questions: {
                    include: {
                        tags: true
                    }
                }
            }
        });
        console.log(`✅ 导出 ${papers.length} 个试卷`);

        // 导出标签
        const tags = await prisma.tag.findMany();
        console.log(`✅ 导出 ${tags.length} 个标签`);

        // 导出答题记录
        const examRecords = await prisma.examRecord.findMany();
        console.log(`✅ 导出 ${examRecords.length} 条答题记录`);

        // 导出学习记录
        const studyRecords = await prisma.studyRecord.findMany();
        console.log(`✅ 导出 ${studyRecords.length} 条学习记录`);

        // 保存到文件
        const backup = {
            exportDate: new Date().toISOString(),
            users,
            papers,
            tags,
            examRecords,
            studyRecords
        };

        fs.writeFileSync('supabase-backup.json', JSON.stringify(backup, null, 2));

        console.log('\n✅ 数据导出成功！');
        console.log('📄 文件保存在: supabase-backup.json');
        console.log(`📊 总计: ${users.length} 用户, ${papers.length} 试卷, ${examRecords.length} 答题记录`);

    } catch (error) {
        console.error('❌ 导出失败:', error);
    } finally {
        await prisma.$disconnect();
    }
}

exportData();
