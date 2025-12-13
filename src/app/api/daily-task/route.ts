import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = 'force-dynamic'; // Prevent static caching

// GET /api/daily-task
export async function GET() {
    try {
        // 1. Get current logged in user
        const currentUser = await getCurrentUser();
        
        if (!currentUser) {
            return NextResponse.json(
                { error: "请先登录" },
                { status: 401 }
            );
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

        // 2. Check if there is already a DailyTask for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existingTask = await prisma.dailyTask.findFirst({
            where: {
                userId: user.id,
                date: {
                    gte: today,
                }
            },
            include: {
                questions: {
                    include: { tags: true }
                }
            }
        });

        if (existingTask) {
            return NextResponse.json(existingTask);
        }

        // 3. If NO task exists, GENERATE one (The Core Logic)
        // Rule: 1 Math, 1 English, 1 Hard/Random
        // Simple implementation for now: Random 3 questions
        const questionCount = await prisma.question.count();
        const take = 3;
        const skip = Math.max(0, Math.floor(Math.random() * questionCount) - take);

        const randomQuestions = await prisma.question.findMany({
            take: take,
            skip: skip,
            include: { tags: true }
        });

        const newTask = await prisma.dailyTask.create({
            data: {
                userId: user.id,
                date: new Date(),
                title: "今日特训: 随机突击",
                questions: {
                    connect: randomQuestions.map(q => ({ id: q.id }))
                }
            },
            include: {
                questions: {
                    include: { tags: true }
                }
            }
        });

        return NextResponse.json(newTask);

    } catch (error) {
        console.error("Failed to fetch daily task:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
