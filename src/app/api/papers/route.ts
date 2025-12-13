
import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";

export async function GET() {
    try {
        const papers = await prisma.examPaper.findMany({
            orderBy: { year: 'desc' },
            select: {
                id: true,
                title: true,
                year: true,
                subject: true,
                paperType: true,
                createdAt: true,
                _count: {
                    select: {
                        questions: true
                    }
                }
            }
        });
        
        return NextResponse.json({ papers });
    } catch (e) {
        console.error("Error fetching papers:", e);
        return NextResponse.json({ error: "Failed to fetch papers" }, { status: 500 });
    }
}

// 创建新试卷
export async function POST(req: Request) {
    try {
        // 检查管理员权限
        if (!(await isAdmin())) {
            return NextResponse.json({ error: "无权限" }, { status: 403 });
        }

        const body = await req.json();
        const { title, year, subject, paperType } = body;

        if (!title || !year || !subject) {
            return NextResponse.json({ error: "缺少必要字段" }, { status: 400 });
        }

        const paper = await prisma.examPaper.create({
            data: {
                title,
                year: parseInt(year),
                subject,
                paperType: paperType || "REAL",
            },
        });

        return NextResponse.json({ success: true, paper });
    } catch (e) {
        console.error("Error creating paper:", e);
        return NextResponse.json({ error: "创建失败" }, { status: 500 });
    }
}
