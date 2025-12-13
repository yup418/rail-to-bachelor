import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = 'force-dynamic';

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

        const now = new Date();

        // 2. Find pending reviews
        const dueReviews = await prisma.questionProgress.findMany({
            where: {
                userId: user.id,
                nextReviewDate: {
                    lte: now
                }
            },
            include: {
                question: {
                    include: { tags: true }
                }
            },
            orderBy: {
                nextReviewDate: 'asc'
            }
        });

        // 3. Calculate Stats
        const totalLearned = await prisma.questionProgress.count({ where: { userId: user.id } });
        const masterCount = await prisma.questionProgress.count({
            where: {
                userId: user.id,
                streak: { gte: 3 } // Assume streak >= 3 is "Mastered"
            }
        });

        return NextResponse.json({
            reviews: dueReviews,
            stats: {
                totalLearned,
                dueCount: dueReviews.length,
                masterCount
            }
        });

    } catch (error) {
        console.error("Review fetch error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
