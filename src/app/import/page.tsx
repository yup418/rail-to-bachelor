"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, FileText, Eye, CheckCircle } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface ParsedQuestion {
    content: string;
    type: string;
    options: string[];
    answer: string;
    explanation: string;
}

export default function ImportPage() {
    const [markdown, setMarkdown] = useState("");
    const [title, setTitle] = useState("");
    const [year, setYear] = useState(new Date().getFullYear());
    const [subject, setSubject] = useState("MATH");
    const [paperType, setPaperType] = useState("REAL");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
    const [showPreview, setShowPreview] = useState(false);

    // 处理文件上传
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            setMarkdown(content);

            // 自动从文件名提取信息
            const filename = file.name.replace('.md', '');
            if (!title) {
                setTitle(filename);
            }
        };
        reader.readAsText(file);
    };

    // 解析预览
    const handlePreview = () => {
        if (!markdown.trim()) {
            setMessage("请先输入或上传题目内容");
            return;
        }

        const questions = parseMarkdown(markdown);
        setParsedQuestions(questions);
        setShowPreview(true);
        setMessage(`✅ 成功解析 ${questions.length} 道题目`);
    };

    // 解析 Markdown
    const parseMarkdown = (md: string): ParsedQuestion[] => {
        const questions: ParsedQuestion[] = [];
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
                // 检测题目内容
                if (line.startsWith('题目：') || line.startsWith('题目:')) {
                    content = line.replace(/^题目[：:]\s*/, '');
                }
                // 检测选项
                else if (line.match(/^[A-D][\.\、]\s/)) {
                    options.push(line);
                }
                // 检测答案
                else if (line.startsWith('Answer:') || line.startsWith('答案：') || line.startsWith('答案:')) {
                    answer = line.replace(/^(Answer|答案)[：:]\s*/, '').trim();
                }
                // 检测解析开始
                else if (line.startsWith('Explanation:') || line.startsWith('解析：') || line.startsWith('解析:')) {
                    inExplanation = true;
                    const exp = line.replace(/^(Explanation|解析)[：:]\s*/, '').trim();
                    if (exp) explanation = exp;
                }
                // 继续解析内容
                else if (inExplanation) {
                    explanation += (explanation ? '\n' : '') + line;
                }
                // 继续题目内容
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
    };

    // 导入题目
    const handleImport = async () => {
        if (!markdown.trim() || !title.trim()) {
            setMessage("请填写试卷标题和题目内容");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const response = await fetch("/api/import", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    markdown,
                    title,
                    year,
                    subject,
                    paperType,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(`✅ 成功导入 ${data.count} 道题目！`);
                setMarkdown("");
                setTitle("");
                setParsedQuestions([]);
                setShowPreview(false);
            } else {
                setMessage(`❌ 导入失败: ${data.error}`);
            }
        } catch (error) {
            setMessage("❌ 导入失败，请检查网络连接");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 md:p-8">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <FileText className="text-primary" />
                            题目导入
                        </h1>
                        <p className="text-muted-foreground">从 Markdown 格式导入题目</p>
                    </div>
                </div>

                {/* Import Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>试卷信息</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="title">试卷标题</Label>
                                <Input
                                    id="title"
                                    placeholder="例如：2023年陕西专升本高等数学真题"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="year">年份</Label>
                                <Input
                                    id="year"
                                    type="number"
                                    value={year}
                                    onChange={(e) => setYear(parseInt(e.target.value))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="subject">科目</Label>
                                <Select value={subject} onValueChange={setSubject}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MATH">高等数学</SelectItem>
                                        <SelectItem value="ENGLISH">大学英语</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="type">类型</Label>
                                <Select value={paperType} onValueChange={setPaperType}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="REAL">真题</SelectItem>
                                        <SelectItem value="PRACTICE">练习</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>上传文件或粘贴内容</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="file">上传 Markdown 文件</Label>
                            <Input
                                id="file"
                                type="file"
                                accept=".md,.txt"
                                onChange={handleFileUpload}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="markdown">或直接粘贴内容</Label>
                            <Textarea
                                id="markdown"
                                placeholder={`**题目 1**
题目：Not only I but also Ellis and Jane _____ fond of playing basketball.
    A. am
    B. is
    C. are
    D. be

    Answer: C

    Explanation:
    **翻译：** 不仅我，而且埃利斯和简都喜欢打篮球。
    **语法点：** 主谓一致的就近原则。`}
                                value={markdown}
                                onChange={(e) => setMarkdown(e.target.value)}
                                rows={12}
                                className="font-mono text-sm"
                            />
                        </div>

                        {message && (
                            <div className={`p-4 rounded-lg ${message.startsWith("✅") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                                {message}
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button
                                onClick={handlePreview}
                                variant="outline"
                                className="flex-1"
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                解析预览
                            </Button>
                            <Button
                                onClick={handleImport}
                                disabled={loading || parsedQuestions.length === 0}
                                className="flex-1"
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                {loading ? "导入中..." : "确认导入"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Preview Section */}
                {showPreview && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Eye className="w-5 h-5" />
                                解析预览
                                {parsedQuestions.length > 0 && (
                                    <span className="text-sm font-normal text-muted-foreground">
                                        （共 {parsedQuestions.length} 道题）
                                    </span>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {parsedQuestions.length === 0 ? (
                                <div className="text-center py-12 text-red-500">
                                    <p>未能解析出题目，请检查格式</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {parsedQuestions.map((q, index) => (
                                        <div key={index} className="p-4 border rounded-lg bg-white">
                                            <div className="flex items-start gap-2">
                                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                                                <div className="flex-1">
                                                    <div className="font-semibold mb-2">题目 {index + 1}</div>
                                                    <div className="text-sm mb-2">
                                                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                                            {q.content}
                                                        </ReactMarkdown>
                                                    </div>
                                                    {q.options.length > 0 && (
                                                        <div className="space-y-1 mb-2 ml-4">
                                                            {q.options.map((opt, i) => (
                                                                <div key={i} className="text-sm text-muted-foreground">
                                                                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                                                        {opt}
                                                                    </ReactMarkdown>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <div className="text-sm mb-2">
                                                        <span className="font-semibold text-green-600">答案: </span>
                                                        {q.answer || '未识别'}
                                                    </div>
                                                    {q.explanation && (
                                                        <div className="text-sm p-3 bg-blue-50 rounded border border-blue-200">
                                                            <div className="font-semibold mb-1">解析:</div>
                                                            <div className="prose prose-sm max-w-none">
                                                                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                                                    {q.explanation}
                                                                </ReactMarkdown>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Format Guide */}
                <Card>
                    <CardHeader>
                        <CardTitle>格式说明</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p>• 每道题以 <code className="bg-muted px-1 rounded">**题目 数字**</code> 开头</p>
                        <p>• 题目内容以 <code className="bg-muted px-1 rounded">题目：</code> 开头</p>
                        <p>• 选项以 <code className="bg-muted px-1 rounded">A.</code> <code className="bg-muted px-1 rounded">B.</code> 等开头</p>
                        <p>• 答案用 <code className="bg-muted px-1 rounded">Answer: A</code> 格式</p>
                        <p>• 解析用 <code className="bg-muted px-1 rounded">Explanation:</code> 开头</p>
                        <p>• 支持 LaTeX 数学公式，用 $ 包裹</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
