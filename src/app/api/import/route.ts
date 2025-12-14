
import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";

// 解析 Markdown
function parseMarkdown(md: string): any[] {
    const questions: any[] = [];
    const sections = md.split(/\*\*题目\s+\d+\*\*/);

    for (let i = 1; i < sections.length; i++) {
        const section = sections[i].trim();
        const lines = section.split('\n').map(l => l.trim()).filter(l => l);

        let content = '';
        let options: string[] = [];
        let answer = '';
        let explanation = '';
        let inExplanation = false;

        for (const line of lines) {
            if (line.startsWith('题目：') || line.startsWith('题目:')) {
                content = line.replace(/^题目[：:]\s*/, '');
            }
            else if (line.match(/^[A-D][\.\、]\s/)) {
                options.push(line);
            }
            else if (line.startsWith('Answer:') || line.startsWith('答案：') || line.startsWith('答案:')) {
                answer = line.replace(/^(Answer|答案)[：:]\s*/, '').trim();
            }
            else if (line.startsWith('Explanation:') || line.startsWith('解析：') || line.startsWith('解析:')) {
                inExplanation = true;
                const exp = line.replace(/^(Explanation|解析)[：:]\s*/, '').trim();
                if (exp) explanation = exp;
            }
            else if (inExplanation) {
                explanation += (explanation ? '\n' : '') + line;
            }
            else if (!answer && !inExplanation && options.length === 0) {
                content += (content ? ' ' : '') + line;
            }
        }

        if (content) {
            questions.push({
                content,
                type: options.length > 0 ? 'CHOICE' : 'FILL',
                options,
                answer,
                explanation,
            });
        }
    }

    return questions;
}

export async function POST(req: Request) {
    try {
        // 检查管理员权限
        if (!(await isAdmin())) {
            return NextResponse.json({ error: "无权限" }, { status: 403 });
        }

        const body = await req.json();
        const { markdown, title, year, subject, paperType, tags = [] } = body;

        if (!markdown || !title) {
            return NextResponse.json({ error: "请填写试卷标题和题目内容" }, { status: 400 });
        }

        // 解析 Markdown
        const questions = parseMarkdown(markdown);

        if (questions.length === 0) {
            return NextResponse.json({ error: "未能解析出题目，请检查格式" }, { status: 400 });
        }

        // 创建试卷
        const paper = await prisma.examPaper.create({
            data: {
                title,
                year: year || new Date().getFullYear(),
                subject: subject || 'MATH',
                paperType: paperType || 'REAL',
            }
        });

        // 插入题目
        let count = 0;
        for (const q of questions) {
            // 准备标签连接
            const tagConnections = tags.length > 0
                ? tags.map((tagName: string) => ({
                    where: { name: tagName },
                    create: { name: tagName, category: 'OTHER' }
                }))
                : [{
                    where: { name: '导入题目' },
                    create: { name: '导入题目', category: 'OTHER' }
                }];

            await prisma.question.create({
                data: {
                    examPapers: {
                        connect: { id: paper.id }
                    },
                    content: q.content,
                    type: q.type,
                    passage: q.passage || null,  // 添加 passage 字段
                    options: q.options.length > 0 ? JSON.stringify(q.options) : null,
                    answer: q.answer,
                    explanation: q.explanation || "",
                    difficulty: 3,
                    tags: {
                        connectOrCreate: tagConnections
                    }
                }
            });
            count++;
        }

        return NextResponse.json({ success: true, count, paperId: paper.id });

    } catch (e: any) {
        console.error('Import error:', e);
        return NextResponse.json({ error: e.message || "Import failed" }, { status: 500 });
    }
}
