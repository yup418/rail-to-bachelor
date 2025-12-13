
import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import { startOfDay, startOfMonth, subDays } from "date-fns";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const userId = await getUserSession();
        if (!userId) {
            return NextResponse.json({ error: "未登录" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || 'all'; // day, week, month, all
        const type = searchParams.get('type') || 'ALL'; // CHOICE, FILL, etc.

        let dateFilter = {};
        const now = new Date();

        if (period === 'day') {
            dateFilter = { createdAt: { gte: startOfDay(now) } };
        } else if (period === 'week') {
            dateFilter = { createdAt: { gte: subDays(now, 7) } };
        } else if (period === 'month') {
            dateFilter = { createdAt: { gte: startOfMonth(now) } };
        }

        let typeFilter = {};
        if (type !== 'ALL') {
            typeFilter = { type: type };
        }

        // Find StudyRecords where isCorrect = false
        const mistakes = await prisma.studyRecord.findMany({
            where: {
                userId,
                isCorrect: false,
                ...dateFilter,
                question: {
                    ...typeFilter
                }
            },
            include: {
                question: {
                    include: {
                        tags: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Deduplicate by questionId - show only the most recent mistake
        const uniqueMistakes = new Map();
        mistakes.forEach(record => {
            if (!uniqueMistakes.has(record.questionId)) {
                uniqueMistakes.set(record.questionId, {
                    ...record.question,
                    mistakeDate: record.createdAt,
                    userAnswer: record.userAnswer,
                });
            }
        });

        return NextResponse.json({
            mistakes: Array.from(uniqueMistakes.values())
        });

    } catch (error) {
        console.error("Error fetching mistakes:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

// 保存答题记录
export async function POST(req: Request) {
    try {
        const userId = await getUserSession();
        if (!userId) {
            return NextResponse.json({ error: "未登录" }, { status: 401 });
        }

        const body = await req.json();
        const { questionId, isCorrect, userAnswer, duration } = body;

        if (!questionId || isCorrect === undefined) {
            return NextResponse.json({ error: "缺少必要参数" }, { status: 400 });
        }

        const record = await prisma.studyRecord.create({
            data: {
                userId,
                questionId,
                isCorrect,
                userAnswer: userAnswer || null,
                duration: duration || null,
            },
        });

        return NextResponse.json({ success: true, record });
    } catch (e) {
        console.error("Error saving study record:", e);
        return NextResponse.json({ error: "保存失败" }, { status: 500 });
    }
}
