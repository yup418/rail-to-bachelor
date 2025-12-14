import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";

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

        const record = await prisma.examRecord.findUnique({
            where: {
                id,
                userId, // 确保只能查看自己的记录
            },
            include: {
                paper: {
                    include: {
                        questions: {
                            include: {
                                tags: true
                            }
                        }
                    }
                },
                answers: true
            }
        });

        if (!record) {
            return NextResponse.json({ error: "记录未找到" }, { status: 404 });
        }

        return NextResponse.json({ record });
    } catch (error: any) {
        console.error('Get record detail error:', error);
        return NextResponse.json({ error: error.message || "获取记录失败" }, { status: 500 });
    }
}
