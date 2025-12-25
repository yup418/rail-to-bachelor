
import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";

// 解析 Markdown (同步前端的优化逻辑)
function parseMarkdown(md: string): any[] {
    const questions: any[] = [];

    // 1. 支持 "**题目 1**" 和 "题目 1" (无星号)
    let sections = md.split(/(?:^|\n)\s*(?:\*\*|##)?\s*题目\s*\d+\s*(?:\*\*|##)?\s*(?:\n|$)/);

    let startIdx = 1;
    let globalPassage = '';

    // 检查第一部分是否为阅读理解的文章
    if (sections.length > 1 && sections[0].trim()) {
        const potentialPassage = sections[0].trim();
        if (potentialPassage.length > 50 || /Passage|Reading|Text|文章/i.test(potentialPassage)) {
            globalPassage = potentialPassage;
        }
        startIdx = 1;
    } else if (sections.length === 1 && sections[0].trim()) {
        startIdx = 0;
    }

    for (let i = startIdx; i < sections.length; i++) {
        const section = sections[i].trim();
        if (!section) continue;

        const lines = section.split('\n').map(l => l.trim()).filter(l => l);

        let content = '';
        let options: string[] = [];
        let answer = '';
        let explanation = '';
        let inExplanation = false;

        for (const line of lines) {
            if (line.match(/^(题目|Question)[：:]/i)) {
                content = line.replace(/^(题目|Question)[：:]\s*/i, '');
            }
            else if (line.match(/^[A-D][\\.、]/)) {
                options.push(line);
            }
            else if (line.match(/^(Answer|答案)[：:]/i)) {
                answer = line.replace(/^(Answer|答案)[：:]\s*/i, '').trim();
            }
            else if (line.match(/^(Explanation|解析)[：:]/i)) {
                inExplanation = true;
                const exp = line.replace(/^(Explanation|解析)[：:]\s*/i, '').trim();
                if (exp) explanation = exp;
            }
            else if (inExplanation) {
                explanation += (explanation ? '\n' : '') + line;
            }
            else if (!answer && !inExplanation && options.length === 0) {
                // 忽略像 "## Part I" 这样的标题行
                if (!line.match(/^\s*(##|\*\*)\s*Part/i)) {
                    content += (content ? '\n' : '') + line;
                }
            }
        }

        if (content) {
            questions.push({
                content,
                type: options.length > 0 ? 'CHOICE' : 'FILL',
                options,
                answer,
                explanation,
                passage: globalPassage || undefined,
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
        const { markdown, title, year, subject, paperType, tags = [], questions: preParsedQuestions } = body;

        if (!title) {
            return NextResponse.json({ error: "请填写试卷标题" }, { status: 400 });
        }

        let questions = [];

        // 优先使用前端解析好的题目
        if (preParsedQuestions && Array.isArray(preParsedQuestions) && preParsedQuestions.length > 0) {
            questions = preParsedQuestions;
        } else if (markdown) {
            // 降级：后端解析
            questions = parseMarkdown(markdown);
        } else {
            return NextResponse.json({ error: "请提供题目内容" }, { status: 400 });
        }

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
