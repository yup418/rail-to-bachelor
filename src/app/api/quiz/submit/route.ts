import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { questionId, isCorrect } = body;

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

        // 2. Transcation to update multiple things safely
        const result = await prisma.$transaction(async (tx) => {
            // A. Record the attempt
            await tx.studyRecord.create({
                data: {
                    userId: user.id,
                    questionId: questionId,
                    isCorrect: isCorrect,
                    userAnswer: isCorrect ? "Correct" : "Wrong", // Simplified
                }
            });

            // B. Update Spaced Repetition Progress (Simple Leibner Logic)
            // Find existing progress
            const progress = await tx.questionProgress.findUnique({
                where: {
                    userId_questionId: {
                        userId: user.id,
                        questionId: questionId
                    }
                }
            });

            let newStreak = 0;
            let newInterval = 1;

            if (progress) {
                // Update logic
                if (isCorrect) {
                    newStreak = progress.streak + 1;
                    newInterval = Math.round(progress.interval * 2.5); // Exponential growth
                } else {
                    newStreak = 0;
                    newInterval = 1; // Reset
                }

                await tx.questionProgress.update({
                    where: { id: progress.id },
                    data: {
                        streak: newStreak,
                        interval: newInterval,
                        nextReviewDate: new Date(Date.now() + newInterval * 24 * 60 * 60 * 1000)
                    }
                });
            } else {
                // Create new progress record
                await tx.questionProgress.create({
                    data: {
                        userId: user.id,
                        questionId: questionId,
                        streak: isCorrect ? 1 : 0,
                        interval: 1,
                        nextReviewDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
                    }
                })
            }

            // C. Gamification: Update XP
            let xpGained = 0;
            let levelUp = false;

            if (isCorrect) {
                xpGained = 10 + (newStreak * 2); // Streak bonus

                const updatedUser = await tx.user.update({
                    where: { id: user.id },
                    data: {
                        xp: { increment: xpGained }
                    }
                });

                // Check Level Up (Simple: Level = XP / 100)
                const newLevel = Math.floor(updatedUser.xp / 100) + 1;
                if (newLevel > updatedUser.level) {
                    levelUp = true;
                    await tx.user.update({
                        where: { id: user.id },
                        data: { level: newLevel }
                    });
                }
            }

            return {
                xpGained,
                levelUp,
                currentXp: (await tx.user.findFirstOrThrow({ where: { id: user.id } })).xp
            };
        });

        return NextResponse.json(result);

    } catch (error) {
        console.error("Submit error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
