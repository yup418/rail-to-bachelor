import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const userId = await getUserSession();
        if (!userId) {
            return NextResponse.json({ error: "未登录" }, { status: 401 });
        }

        const body = await req.json();
        const { paperId, answers, score, totalQuestions, timeSpent } = body;

        if (!paperId || !answers) {
            return NextResponse.json({ error: "缺少必要参数" }, { status: 400 });
        }

        // 创建答题记录
        const record = await prisma.examRecord.create({
            data: {
                userId,
                paperId,
                answers: JSON.stringify(answers),
                score: score || 0,
                totalQuestions: totalQuestions || 0,
                timeSpent: timeSpent || 0,
                completedAt: new Date(),
            },
        });

        return NextResponse.json({ success: true, record });
    } catch (e) {
        console.error("Error saving exam record:", e);
        return NextResponse.json({ error: "保存失败" }, { status: 500 });
    }
}

// 获取用户的答题记录
export async function GET(req: Request) {
    try {
        const userId = await getUserSession();
        if (!userId) {
            return NextResponse.json({ error: "未登录" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const paperId = searchParams.get('paperId');

        const where: any = { userId };
        if (paperId) {
            where.paperId = paperId;
        }

        const records = await prisma.examRecord.findMany({
            where,
            include: {
                paper: {
                    select: {
                        id: true,
                        title: true,
                        year: true,
                        subject: true,
                    },
                },
            },
            orderBy: {
                completedAt: 'desc',
            },
        });

        return NextResponse.json({ records });
    } catch (e) {
        console.error("Error fetching exam records:", e);
        return NextResponse.json({ error: "获取失败" }, { status: 500 });
    }
}
