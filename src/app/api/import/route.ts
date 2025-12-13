
import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        // 检查管理员权限
        if (!(await isAdmin())) {
            return NextResponse.json({ error: "无权限" }, { status: 403 });
        }

        const body = await req.json();
        const { paperId, newPaperTitle, questions, subject, paperType } = body;

        // Require subject & paperType when creating new paper to match四大题库
        if (!paperId && (!subject || !paperType)) {
            return NextResponse.json({ error: "请先选择题库学科与类型" }, { status: 400 });
        }

        // 1. Determine Paper ID
        let targetPaperId = paperId;

        if (!targetPaperId && newPaperTitle) {
            // Create new paper
            const newPaper = await prisma.examPaper.create({
                data: {
                    title: newPaperTitle,
                    year: new Date().getFullYear(),
                    subject: subject || 'MATH',
                    paperType: paperType || 'REAL',
                }
            });
            targetPaperId = newPaper.id;
        }

        if (!targetPaperId) {
            return NextResponse.json({ error: "Missing Paper ID" }, { status: 400 });
        }

        // 2. Insert Questions
        let count = 0;
        for (const q of questions) {
            await prisma.question.create({
                data: {
                    examPapers: {
                        connect: { id: targetPaperId }
                    },
                    content: q.content || "Empty content",
                    type: q.type || "CHOICE",
                    options: q.options ? JSON.stringify(q.options) : null,
                    answer: q.answer || "Unknown",
                    explanation: q.explanation || "",
                    difficulty: 3, // Default
                    // Create default tag if needed
                    tags: {
                        connectOrCreate: {
                            where: { name: '导入题目' },
                            create: { name: '导入题目', category: 'OTHER' }
                        }
                    }
                }
            });
            count++;
        }

        return NextResponse.json({ success: true, count, paperId: targetPaperId });

    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Import failed" }, { status: 500 });
    }
}
