// 导入数据到 Railway PostgreSQL
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

// 使用 Railway 公网连接
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: 'postgresql://postgres:ORUjeqxlsddJjJJONYMLgMGFQkswghPt@turntable.proxy.rlwy.net:29340/railway'
        }
    }
});

async function importToRailway() {
    try {
        console.log('📥 开始导入数据到 Railway...\n');

        // 读取备份文件
        const backup = JSON.parse(fs.readFileSync('supabase-backup.json', 'utf8'));
        console.log(`📄 读取备份文件 (导出时间: ${backup.exportDate})\n`);

        // 1. 导入用户
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
                    createdAt: new Date(user.createdAt),
                    updatedAt: new Date(user.updatedAt)
                }
            });
        }
        console.log(`   ✅ 导入 ${backup.users.length} 个用户\n`);

        // 2. 导入标签
        console.log('2️⃣ 导入标签...');
        for (const tag of backup.tags) {
            await prisma.tag.upsert({
                where: { id: tag.id },
                update: {},
                create: {
                    id: tag.id,
                    name: tag.name,
                    category: tag.category || 'MATH'  // 默认为 MATH
                }
            });
        }
        console.log(`   ✅ 导入 ${backup.tags.length} 个标签\n`);

        // 3. 导入试卷和题目
        console.log('3️⃣ 导入试卷和题目...');
        for (const paper of backup.papers) {
            // 创建试卷
            const createdAt = new Date(paper.createdAt);

            await prisma.examPaper.upsert({
                where: { id: paper.id },
                update: {},
                create: {
                    id: paper.id,
                    title: paper.title,
                    year: paper.year,
                    subject: paper.subject,
                    paperType: paper.paperType,
                    createdAt: isNaN(createdAt.getTime()) ? new Date() : createdAt
                }
            });

            // 创建题目
            for (const question of paper.questions) {
                await prisma.question.upsert({
                    where: { id: question.id },
                    update: {},
                    create: {
                        id: question.id,
                        content: question.content,
                        type: question.type,
                        options: question.options,
                        answer: question.answer,
                        explanation: question.explanation,
                        difficulty: question.difficulty,
                        paperId: paper.id,
                        tags: {
                            connect: question.tags.map(t => ({ id: t.id }))
                        }
                    }
                });
            }
        }
        console.log(`   ✅ 导入 ${backup.papers.length} 个试卷\n`);

        // 4. 导入答题记录
        console.log('4️⃣ 导入答题记录...');
        for (const record of backup.examRecords) {
            await prisma.examRecord.upsert({
                where: { id: record.id },
                update: {},
                create: {
                    id: record.id,
                    answers: record.answers,
                    score: record.score,
                    totalQuestions: record.totalQuestions,
                    timeSpent: record.timeSpent,
                    completedAt: new Date(record.completedAt),
                    userId: record.userId,
                    paperId: record.paperId,
                    createdAt: new Date(record.createdAt)
                }
            });
        }
        console.log(`   ✅ 导入 ${backup.examRecords.length} 条答题记录\n`);

        // 5. 导入学习记录
        console.log('5️⃣ 导入学习记录...');
        for (const record of backup.studyRecords) {
            await prisma.studyRecord.upsert({
                where: { id: record.id },
                update: {},
                create: {
                    id: record.id,
                    isCorrect: record.isCorrect,
                    userAnswer: record.userAnswer,
                    duration: record.duration,
                    userId: record.userId,
                    questionId: record.questionId,
                    createdAt: new Date(record.createdAt)
                }
            });
        }
        console.log(`   ✅ 导入 ${backup.studyRecords.length} 条学习记录\n`);

        console.log('✅ 数据导入完成！');
        console.log('\n📊 导入统计:');
        console.log(`   - 用户: ${backup.users.length}`);
        console.log(`   - 试卷: ${backup.papers.length}`);
        console.log(`   - 标签: ${backup.tags.length}`);
        console.log(`   - 答题记录: ${backup.examRecords.length}`);
        console.log(`   - 学习记录: ${backup.studyRecords.length}`);

    } catch (error) {
        console.error('❌ 导入失败:', error);
        console.error(error.stack);
    } finally {
        await prisma.$disconnect();
    }
}

importToRailway();
