"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload, FileText, Eye, CheckCircle, X, Plus } from "lucide-react";
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
    passage?: string;  // 阅读理解文章
}

// 预设标签
const PRESET_TAGS = [
    "选择题", "填空题", "计算题", "证明题",
    "极限", "导数", "积分", "微分方程",
    "语法", "词汇", "阅读理解", "完形填空",
    "基础题", "中等题", "难题", "易错题"
];

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

    // 标签相关状态
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [customTag, setCustomTag] = useState("");
    const [showCustomInput, setShowCustomInput] = useState(false);

    // 添加标签
    const handleAddTag = (tag: string) => {
        if (tag && !selectedTags.includes(tag)) {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    // 删除标签
    const handleRemoveTag = (tag: string) => {
        setSelectedTags(selectedTags.filter(t => t !== tag));
    };

    // 添加自定义标签
    const handleAddCustomTag = () => {
        if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
            setSelectedTags([...selectedTags, customTag.trim()]);
            setCustomTag("");
            setShowCustomInput(false);
        }
    };

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

        // 检测是否包含阅读理解
        const hasPassage = md.includes('**文章**') || md.includes('**Passage**') || md.includes('**阅读材料**');

        if (hasPassage) {
            // 解析阅读理解格式
            return parseReadingComprehension(md);
        } else {
            // 解析普通题目格式
            return parseRegularQuestions(md);
        }
    };

    // 解析阅读理解
    const parseReadingComprehension = (md: string): ParsedQuestion[] => {
        const questions: ParsedQuestion[] = [];

        // 提取文章内容
        const passageMatch = md.match(/\*\*(文章|Passage|阅读材料)\*\*\s*\n([\s\S]*?)(?=\n\*\*题目|$)/);
        const passage = passageMatch ? passageMatch[2].trim() : '';

        // 提取题目部分
        const questionsSection = md.split(/\*\*(文章|Passage|阅读材料)\*\*/)[2] || md;
        const sections = questionsSection.split(/\*\*题目\s+\d+\*\*/);

        for (let i = 1; i < sections.length; i++) {
            const section = sections[i].trim();
            const lines = section.split('\n').map(l => l.trim()).filter(l => l);

            let content = '';
            let options: string[] = [];
            let answer = '';
            let explanation = '';
            let inExplanation = false;

            for (const line of lines) {
                if (line.startsWith('题目：') || line.startsWith('题目:') || line.startsWith('Question:')) {
                    content = line.replace(/^(题目|Question)[：:]?\s*/, '');
                }
                else if (line.match(/^[A-D][\\.、]\s/)) {
                    options.push(line);
                }
                else if (line.startsWith('Answer:') || line.startsWith('答案：') || line.startsWith('答案:')) {
                    answer = line.replace(/^(Answer|答案)[：:]?\s*/, '').trim();
                }
                else if (line.startsWith('Explanation:') || line.startsWith('解析：') || line.startsWith('解析:')) {
                    inExplanation = true;
                    const exp = line.replace(/^(Explanation|解析)[：:]?\s*/, '').trim();
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
                    type: 'READING',
                    options,
                    answer,
                    explanation,
                    passage,
                });
            }
        }

        return questions;
    };

    // 解析普通题目（增强版：支持多段阅读理解交替）
    const parseRegularQuestions = (md: string): ParsedQuestion[] => {
        const questions: ParsedQuestion[] = [];
        let sections = md.split(/(?:^|\n)\s*(?:\*\*|##)?\s*题目\s*\d+\s*(?:\*\*|##)?\s*(?:\n|$)/);

        let startIdx = 1;
        let currentPassage = '';
        let nextPassage = ''; // 用于存储在当前 section 末尾发现的新文章，供下一题使用

        // 1. 初始 Passage 检测 (Section 0)
        if (sections.length > 1 && sections[0].trim()) {
            const potentialPassage = sections[0].trim();
            if (potentialPassage.length > 50 || /Passage|Reading|Text|文章/i.test(potentialPassage)) {
                currentPassage = potentialPassage;
            }
            startIdx = 1;
        } else if (sections.length === 1 && sections[0].trim()) {
            startIdx = 0;
        }

        for (let i = startIdx; i < sections.length; i++) {
            let section = sections[i].trim();
            if (!section) continue;

            // 2. 检测该 section 内部（通常在末尾）是否包含下一篇文章的开始
            // 2. Line-based Passage Detection (更稳健的逐行检测)
            const lines = section.split('\n').map(l => l.trim());

            let content = '';
            let options: string[] = [];
            let answer = '';
            let explanation = '';
            let inExplanation = false;

            // 下一题的新文章内容
            nextPassage = '';

            for (let j = 0; j < lines.length; j++) {
                const line = lines[j];

                if (!line) {
                    if (inExplanation) {
                        explanation += '\n';
                    } else if (content && options.length === 0 && !answer) {
                        content += '\n';
                    }
                    continue;
                }

                // 检测是否遇到了新文章的标题
                // 规则：极度宽容，只要行内包含 Passage/Part/Text + 数字/序号
                // 允许前面有 markdown 符号、全角空格等
                // 排除: "According to Passage One" 这样的句子 (通常 header 很短)
                const isHeader = /(?:^|[\s\W])(Passage|Part|Text|Reading)[\s\W]+(One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|\d+|I+|IV|V|VI|A|B|C|D)(?:$|[\s\W])/i.test(line) && line.length < 60;

                // 只有在已经解析了一些可以算是当前题目内容的东西之后，才允许分割新文章
                const hasSomeContent = content || inExplanation || options.length > 0;

                if (isHeader && hasSomeContent) {
                    // 确定发现了新文章！
                    const remainingLines = lines.slice(j);
                    nextPassage = remainingLines.join('\n');
                    break; // 停止解析当前题目，剩下的都是新文章
                }

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
                    const needsNewline = explanation.length > 0 && !explanation.endsWith('\n');
                    explanation += (needsNewline ? '\n' : '') + line;
                }
                else if (!answer && !inExplanation && options.length === 0) {
                    if (!line.match(/^\s*(##|\*\*)\s*Part/i)) {
                        const needsNewline = content.length > 0 && !content.endsWith('\n');
                        content += (needsNewline ? '\n' : '') + line;
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
                    passage: currentPassage || undefined, // 使用**当前**的 passage
                });
            }

            // 循环结束前，如果发现了新文章，更新 currentPassage
            // 这样 i+1 轮次就会使用新文章
            if (nextPassage) {
                currentPassage = nextPassage;
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
                    tags: selectedTags,
                    questions: parsedQuestions, // 将解析好的题目直接传给后端
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

                {/* 标签选择 */}
                <Card>
                    <CardHeader>
                        <CardTitle>题目标签</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* 已选标签 */}
                        {selectedTags.length > 0 && (
                            <div className="space-y-2">
                                <Label>已选标签</Label>
                                <div className="flex flex-wrap gap-2">
                                    {selectedTags.map((tag) => (
                                        <div key={tag} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm">
                                            <span>{tag}</span>
                                            <button
                                                type="button"
                                                className="ml-1 hover:text-red-500 focus:outline-none"
                                                onClick={() => handleRemoveTag(tag)}
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 预设标签 */}
                        <div className="space-y-2">
                            <Label>选择预设标签</Label>
                            <div className="flex flex-wrap gap-2">
                                {PRESET_TAGS.map((tag) => (
                                    <Badge
                                        key={tag}
                                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                                        onClick={() => handleAddTag(tag)}
                                    >
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* 自定义标签 */}
                        <div className="space-y-2">
                            <Label>自定义标签</Label>
                            {!showCustomInput ? (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowCustomInput(true)}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    添加自定义标签
                                </Button>
                            ) : (
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="输入自定义标签"
                                        value={customTag}
                                        onChange={(e) => setCustomTag(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddCustomTag()}
                                    />
                                    <Button onClick={handleAddCustomTag}>添加</Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setShowCustomInput(false);
                                            setCustomTag("");
                                        }}
                                    >
                                        取消
                                    </Button>
                                </div>
                            )}
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
                                    {/* 如果是阅读理解，先显示文章 */}
                                    {parsedQuestions[0]?.passage && (
                                        <div className="p-6 border-2 border-blue-200 rounded-lg bg-blue-50">
                                            <div className="flex items-center gap-2 mb-4">
                                                <FileText className="w-5 h-5 text-blue-600" />
                                                <div className="font-bold text-lg text-blue-900">阅读材料</div>
                                            </div>
                                            <div className="prose prose-sm max-w-none">
                                                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                                    {parsedQuestions[0].passage}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    )}

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
                                                    {selectedTags.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mb-2">
                                                            {selectedTags.map((tag) => (
                                                                <Badge key={tag} variant="secondary" className="text-xs">
                                                                    {tag}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <div className="text-sm mb-2">
                                                        <span className="font-semibold text-green-600">答案: </span>
                                                        <span className="inline-block align-top">
                                                            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                                                {q.answer || '未识别'}
                                                            </ReactMarkdown>
                                                        </span>
                                                    </div>
                                                    {q.explanation && (
                                                        <div className="text-sm p-3 bg-blue-50 rounded border border-blue-200">
                                                            <div className="font-semibold mb-2">解析:</div>
                                                            <div className="prose prose-sm max-w-none">
                                                                <ReactMarkdown
                                                                    remarkPlugins={[remarkMath]}
                                                                    rehypePlugins={[rehypeKatex]}
                                                                    components={{
                                                                        p: ({ node, ...props }) => <p className="mb-2" {...props} />
                                                                    }}
                                                                >
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
                    <CardContent className="space-y-4 text-sm">
                        <div>
                            <div className="font-semibold mb-2">普通题目格式：</div>
                            <div className="space-y-1 ml-4">
                                <p>• 每道题以 <code className="bg-muted px-1 rounded">题目 数字</code> 或 <code className="bg-muted px-1 rounded">**题目 数字**</code> 开头</p>
                                <p>• 题目内容以 <code className="bg-muted px-1 rounded">题目：</code> 开头</p>
                                <p>• 选项以 <code className="bg-muted px-1 rounded">A.</code> <code className="bg-muted px-1 rounded">B.</code> 等开头</p>
                                <p>• 答案用 <code className="bg-muted px-1 rounded">Answer: A</code> 格式</p>
                                <p>• 解析用 <code className="bg-muted px-1 rounded">Explanation:</code> 开头</p>
                            </div>
                        </div>
                        <div className="border-t pt-4">
                            <div className="font-semibold mb-2">阅读理解格式：</div>
                            <div className="space-y-1 ml-4">
                                <p>• 文章以 <code className="bg-muted px-1 rounded">**文章**</code> 或 <code className="bg-muted px-1 rounded">**Passage**</code> 开头</p>
                                <p>• 文章后跟多道题目，格式同普通题目</p>
                                <p>• 所有题目会自动关联到同一篇文章</p>
                            </div>
                        </div>
                        <p className="border-t pt-4">• 支持 LaTeX 数学公式，用 $ 包裹</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
