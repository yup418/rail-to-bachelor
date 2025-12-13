import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Get current logged in user
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return NextResponse.json({
                mathRadar: [],
                englishRadar: [],
                stats: {
                    accuracy: 0,
                    todayCount: 0,
                    weakestTag: "待登录"
                }
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: currentUser.id }
        });
        if (!user) {
            return NextResponse.json(
                { error: "用户不存在" },
                { status: 404 }
            );
        }

        // 1. Radar Chart Data: Mastery per Category
        // We aggregate streak by tag
        // Since prisma doesn't support complex group by on relations easily in one go, we can do some application level aggregation or use raw query.
        // For simplicity: Fetch all progress and aggregate.
        const allProgress = await prisma.questionProgress.findMany({
            where: { userId: user.id },
            include: {
                question: {
                    include: { tags: true }
                }
            }
        });

        // Initialize categories with baseline
        const mathCategories: Record<string, { total: number, score: number }> = {
            '函数与极限': { total: 0, score: 0 },
            '导数与微分': { total: 0, score: 0 },
            '一元函数积分': { total: 0, score: 0 },
        };

        const englishCategories: Record<string, { total: number, score: number }> = {
            '词汇与语法': { total: 0, score: 0 },
            '虚拟语气': { total: 0, score: 0 },
            '定语从句': { total: 0, score: 0 },
            '阅读理解': { total: 0, score: 0 },
        };

        allProgress.forEach(p => {
            p.question.tags.forEach(tag => {
                // Determine target map based on tag category or fallback to name
                let targetMap = null;

                // Prioritize explicit category if seeded
                if (tag.category === 'MATH') targetMap = mathCategories;
                else if (tag.category === 'ENGLISH') targetMap = englishCategories;
                else {
                    // Fallback heuristics
                    if (['函数', '极限', '导数', '微分', '积分'].some(k => tag.name.includes(k))) targetMap = mathCategories;
                    else targetMap = englishCategories;
                }

                if (targetMap) {
                    // Find matching key or use tag name if it exists in map, or 'Misc'
                    // For simplicity, we try to match the exact tag name or a partial key
                    let matchedKey = Object.keys(targetMap).find(k => tag.name.includes(k) || k.includes(tag.name));

                    // If tag name is exactly one of our keys (e.g. from seed), use it
                    if (targetMap[tag.name]) matchedKey = tag.name;

                    if (matchedKey && targetMap[matchedKey]) {
                        targetMap[matchedKey].total += 1;
                        targetMap[matchedKey].score += Math.min(p.streak, 5);
                    }
                }
            });
        });

        const mathRadar = Object.keys(mathCategories).map(key => ({
            subject: key,
            A: mathCategories[key].total === 0 ? 30 : Math.round((mathCategories[key].score / (mathCategories[key].total * 5)) * 100) + 30,
            fullMark: 100
        }));

        const englishRadar = Object.keys(englishCategories).map(key => ({
            subject: key,
            A: englishCategories[key].total === 0 ? 30 : Math.round((englishCategories[key].score / (englishCategories[key].total * 5)) * 100) + 30,
            fullMark: 100
        }));

        // 2. Summary Statistics
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const studyRecords = await prisma.studyRecord.findMany({
            where: { userId: user.id }
        });

        const correctCount = studyRecords.filter(r => r.isCorrect).length;
        const totalRecords = studyRecords.length;
        const accuracy = totalRecords > 0 ? Math.round((correctCount / totalRecords) * 100) : 0;

        const todayCount = studyRecords.filter(r => new Date(r.createdAt) >= today).length;

        // Find weakest tag based on QuestionProgress (average streak)
        // We reuse allProgress fetched above
        const tagStats: Record<string, { totalStreak: number, count: number }> = {};
        allProgress.forEach(p => {
            // simplified: take the first tag for now, or average across tags
            // Ideally we aggregate per tag across all questions
            p.question.tags.forEach(tag => {
                if (!tagStats[tag.name]) {
                    tagStats[tag.name] = { totalStreak: 0, count: 0 };
                }
                tagStats[tag.name].totalStreak += p.streak;
                tagStats[tag.name].count += 1;
            });
        });

        let weakestTag = '暂无数据';
        let minAvgStreak = Infinity;

        Object.entries(tagStats).forEach(([tagName, stat]) => {
            const avg = stat.totalStreak / stat.count;
            if (avg < minAvgStreak) {
                minAvgStreak = avg;
                weakestTag = tagName;
            }
        });

        // If no progress at all
        if (Object.keys(tagStats).length === 0) weakestTag = '待开启';

        return NextResponse.json({
            mathRadar,
            englishRadar,
            stats: {
                accuracy,
                todayCount,
                weakestTag
            }
        });

    } catch (error) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
