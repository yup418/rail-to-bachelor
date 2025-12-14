import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";

// 获取答题进度
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await getUserSession();
        if (!userId) {
            return NextResponse.json({ error: "未登录" }, { status: 401 });
        }

        const { id } = await params;

        const progress = await prisma.examProgress.findUnique({
            where: {
                userId_paperId: {
                    userId,
                    paperId: id
                }
            }
        });

        return NextResponse.json({ progress });
    } catch (error: any) {
        console.error('Get progress error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// 保存答题进度
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await getUserSession();
        if (!userId) {
            return NextResponse.json({ error: "未登录" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { currentAnswers, currentIndex, timeSpent } = body;

        const progress = await prisma.examProgress.upsert({
            where: {
                userId_paperId: {
                    userId,
                    paperId: id
                }
            },
            update: {
                currentAnswers: JSON.stringify(currentAnswers),
                currentIndex,
                timeSpent
            },
            create: {
                userId,
                paperId: id,
                currentAnswers: JSON.stringify(currentAnswers),
                currentIndex,
                timeSpent
            }
        });

        return NextResponse.json({ success: true, progress });
    } catch (error: any) {
        console.error('Save progress error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// 删除答题进度（完成答题后）
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await getUserSession();
        if (!userId) {
            return NextResponse.json({ error: "未登录" }, { status: 401 });
        }

        const { id } = await params;

        await prisma.examProgress.deleteMany({
            where: {
                userId,
                paperId: id
            }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Delete progress error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
