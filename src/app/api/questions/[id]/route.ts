import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";

// 获取单个题目
export async function GET(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;

        const question = await prisma.question.findUnique({
            where: { id: params.id },
            include: {
                tags: true
            }
        });

        if (!question) {
            return NextResponse.json({ error: "题目未找到" }, { status: 404 });
        }

        return NextResponse.json(question);
    } catch (e) {
        console.error("Error fetching question:", e);
        return NextResponse.json({ error: "获取失败" }, { status: 500 });
    }
}


// 更新题目
export async function PUT(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        console.log('收到更新请求，题目 ID:', params.id);

        // 检查管理员权限
        if (!(await isAdmin())) {
            console.log('权限检查失败');
            return NextResponse.json({ error: "无权限" }, { status: 403 });
        }

        const body = await req.json();
        console.log('请求数据:', body);

        const { content, options, answer, explanation, type, difficulty } = body;

        // 验证必填字段
        if (!content || !answer) {
            console.log('缺少必填字段');
            return NextResponse.json({ error: "题目内容和答案不能为空" }, { status: 400 });
        }

        const updateData: any = {
            content,
            answer,
            explanation: explanation || '',
        };

        // 只在提供时更新这些字段
        if (options !== undefined) {
            updateData.options = options ? JSON.stringify(options) : null;
        }
        if (type) {
            updateData.type = type;
        }
        if (difficulty !== undefined && difficulty !== null) {
            updateData.difficulty = parseInt(difficulty.toString());
        }

        console.log('准备更新数据:', updateData);

        const question = await prisma.question.update({
            where: { id: params.id },
            data: updateData,
        });

        console.log('更新成功:', question.id);
        return NextResponse.json({ success: true, question });
    } catch (e) {
        console.error("Error updating question:", e);
        const errorMessage = e instanceof Error ? e.message : "更新失败";
        return NextResponse.json({
            error: "更新失败",
            details: errorMessage,
            stack: e instanceof Error ? e.stack : undefined
        }, { status: 500 });
    }
}

// 删除题目
export async function DELETE(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;

        // 检查管理员权限
        if (!(await isAdmin())) {
            return NextResponse.json({ error: "无权限" }, { status: 403 });
        }

        await prisma.question.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error("Error deleting question:", e);
        return NextResponse.json({ error: "删除失败" }, { status: 500 });
    }
}
