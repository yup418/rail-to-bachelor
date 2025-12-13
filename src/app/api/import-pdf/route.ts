import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

export async function POST(req: Request) {
    try {
        // 检查管理员权限
        if (!(await isAdmin())) {
            return NextResponse.json({ error: "无权限" }, { status: 403 });
        }

        const formData = await req.formData();
        const questionPdf = formData.get('questionPdf') as File;
        const answerPdf = formData.get('answerPdf') as File;

        if (!questionPdf) {
            return NextResponse.json({ error: "请上传试卷 PDF" }, { status: 400 });
        }

        // Dynamic import for pdf-parse (直接引用主实现，避免依赖测试文件路径)
        const pdfParse = await (async () => {
            try {
                const mod = (await import('pdf-parse/lib/pdf-parse.js')).default;
                if (mod) return mod;
            } catch (e) {
                // fallback to CJS require
            }
            const mod = require('pdf-parse/lib/pdf-parse.js');
            return mod.default || mod;
        })();

        // Parse question PDF
        const questionBuffer = Buffer.from(await questionPdf.arrayBuffer());
        const questionData = await pdfParse(questionBuffer);
        const questionText = questionData.text;

        // Parse answer PDF if provided
        let answerText = '';
        if (answerPdf) {
            const answerBuffer = Buffer.from(await answerPdf.arrayBuffer());
            const answerData = await pdfParse(answerBuffer);
            answerText = answerData.text;
        }

        // Extract questions from question PDF
        const questions = parseQuestions(questionText);

        // Extract answers from answer PDF and match with questions
        if (answerText) {
            const answers = parseAnswers(answerText);
            matchAnswersToQuestions(questions, answers);
        }

        return NextResponse.json({
            success: true,
            questions,
            questionCount: questions.length,
            hasAnswers: !!answerText
        });

    } catch (error: any) {
        console.error("PDF parsing error:", error);
        return NextResponse.json({
            error: "PDF 解析失败: " + (error.message || "未知错误")
        }, { status: 500 });
    }
}

function parseQuestions(text: string) {
    const questions: any[] = [];
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');

    let currentQ: any = null;
    const questionStartRegex = /^(\d+)[\.、]/;
    const optionStartRegex = /^[A-D][\.、]/;

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        const match = trimmed.match(questionStartRegex);
        if (match) {
            if (currentQ) questions.push(currentQ);
            currentQ = {
                number: match[1],
                content: trimmed.replace(questionStartRegex, '').trim(),
                options: [],
                type: 'CHOICE',
                answer: '',
                explanation: ''
            };
        } else if (currentQ) {
            if (optionStartRegex.test(trimmed)) {
                currentQ.options.push(trimmed);
            } else {
                currentQ.content += ' ' + trimmed;
            }
        }
    }

    if (currentQ) questions.push(currentQ);
    return questions;
}

function parseAnswers(text: string) {
    const answers: Record<string, { answer: string, explanation: string }> = {};
    const lines = text.split(/\r?\n/);

    let currentNum = '';
    let currentAnswer = '';
    let currentExplanation = '';

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Match question number
        const numMatch = trimmed.match(/^(\d+)[\.、]/);
        if (numMatch) {
            // Save previous
            if (currentNum) {
                answers[currentNum] = { answer: currentAnswer, explanation: currentExplanation };
            }
            currentNum = numMatch[1];
            currentAnswer = '';
            currentExplanation = '';

            // Try to extract answer from same line
            const answerMatch = trimmed.match(/[答案|Answer][:：]\s*([A-D])/i);
            if (answerMatch) {
                currentAnswer = answerMatch[1];
            }
        } else if (currentNum) {
            // Check if this line contains answer
            const answerMatch = trimmed.match(/[答案|Answer][:：]\s*([A-D])/i);
            if (answerMatch) {
                currentAnswer = answerMatch[1];
            }
            // Check if this line contains explanation
            else if (trimmed.includes('解析') || trimmed.toLowerCase().includes('explanation')) {
                const parts = trimmed.split(/[:：]/);
                if (parts.length > 1) currentExplanation = parts[1].trim();
            } else if (currentExplanation) {
                currentExplanation += ' ' + trimmed;
            }
        }
    }

    // Save last one
    if (currentNum) {
        answers[currentNum] = { answer: currentAnswer, explanation: currentExplanation };
    }

    return answers;
}

function matchAnswersToQuestions(questions: any[], answers: Record<string, { answer: string, explanation: string }>) {
    for (const q of questions) {
        if (answers[q.number]) {
            q.answer = answers[q.number].answer;
            q.explanation = answers[q.number].explanation;
        }
    }
}
