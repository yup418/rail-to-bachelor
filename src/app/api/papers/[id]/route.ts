import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const paper = await prisma.examPaper.findUnique({
            where: { id },
            include: {
                questions: {
                    include: { tags: true }
                }
            }
        });

        if (!paper) {
            return NextResponse.json({ error: "Paper not found" }, { status: 404 });
        }

        return NextResponse.json(paper);
    } catch (error) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

// 更新试卷
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // 检查管理员权限
        if (!(await isAdmin())) {
            return NextResponse.json({ error: "无权限" }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const { title, year, subject, paperType } = body;

        const paper = await prisma.examPaper.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(year && { year }),
                ...(subject && { subject }),
                ...(paperType && { paperType }),
            },
        });

        return NextResponse.json({ success: true, paper });
    } catch (error) {
        console.error("Error updating paper:", error);
        return NextResponse.json({ error: "更新失败" }, { status: 500 });
    }
}

// 删除试卷
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // 检查管理员权限
        if (!(await isAdmin())) {
            return NextResponse.json({ error: "无权限" }, { status: 403 });
        }

        const { id } = await params;

        // 先删除关联的题目（如果需要的话，或者使用级联删除）
        await prisma.examPaper.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting paper:", error);
        return NextResponse.json({ error: "删除失败" }, { status: 500 });
    }
}
