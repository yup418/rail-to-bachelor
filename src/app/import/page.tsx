"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GamificationHeader } from "@/features/gamification/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, FileUp, Upload, Trash2, Edit2, Plus, AlertCircle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { MathText } from "@/components/MathText";

interface Paper {
    id: string;
    title: string;
    year: number;
    subject: string;
    paperType?: string;
    _count?: {
        questions: number;
    };
}

export default function ImportPage() {
    const router = useRouter();
    const [papers, setPapers] = useState<Paper[]>([]);
    const [selectedPaperId, setSelectedPaperId] = useState<string>("new");
    const [newPaperTitle, setNewPaperTitle] = useState("");
    const [newPaperYear, setNewPaperYear] = useState(new Date().getFullYear());
    const [newPaperSubject, setNewPaperSubject] = useState("MATH");
    const [newPaperType, setNewPaperType] = useState("REAL");
    const [importContent, setImportContent] = useState("");
    const [previewQuestions, setPreviewQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [importing, setImporting] = useState(false);
    const [uploadingPdf, setUploadingPdf] = useState(false);
    const [questionPdf, setQuestionPdf] = useState<File | null>(null);
    const [answerPdf, setAnswerPdf] = useState<File | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [editingPaper, setEditingPaper] = useState<Paper | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);

    // Check admin status
    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                setIsAdmin(data.user?.role === 'ADMIN');
                setCheckingAuth(false);
            })
            .catch(() => {
                setIsAdmin(false);
                setCheckingAuth(false);
            });
    }, []);

    // Fetch existing papers
    useEffect(() => {
        fetch('/api/papers')
            .then(res => res.json())
            .then(data => {
                if (data.papers) setPapers(data.papers);
            });
    }, []);

    const parseText = () => {
        // 更宽容的 Markdown 题目解析：支持「题目:」「第1题」「1．」等格式，
        // 支持 "1. 题目：" 格式，以及同行多个选项的格式（如 "A. 0　B. 1　C. 2　D. 3"），确保完整获取 Explanation 的多行内容
        // 并将"详细解答/解析"区块单独收集，不再塞进题干。

        const lines = importContent.split('\n');
        const parsed: any[] = [];
        let currentQ: any = null;
        let inExplanation = false;

        const qStartRegex = /^(\d+)[\.、．]/; // 1. / 1、/ 1．
        const qTitlePrefix = /^(题目|问题|试题|练习|单选题|多选题)\s*[:：]\s*(.+)/;
        const qOrdinalRegex = /^第\s*\d+\s*题/;
        const optStartRegex = /^[A-D][\.、．]/;
        // 匹配同行多个选项，如 "A. 0　B. 1　C. 2　D. 3"
        const multiOptRegex = /([A-D][\.、．]\s*[^A-D]+)/g;

        lines.forEach(rawLine => {
            let line = rawLine.trim();
            if (!line) return;

            // 去掉 markdown 前缀（#, -, *, >）
            line = line.replace(/^[#>*\-\s]+/, '').trim();
            if (!line) return;

            const isAnswerLine = /^答案\s*[:：]/.test(line) || /^Answer\s*[:：]/i.test(line);
            const isExplainStart = /^(解析|详细解答|解答步骤|Explanation)\s*[:：]?/i.test(line);

            // 新题：1. 题目: xxx（处理 "1. 题目：" 这种复合格式）
            const compositeMatch = line.match(/^(\d+)[\.、．]\s*(题目|问题|试题)\s*[:：]\s*(.+)/);
            if (compositeMatch) {
                if (currentQ) parsed.push(currentQ);
                currentQ = {
                    content: compositeMatch[3].trim(),
                    options: [],
                    type: 'CHOICE',
                    answer: '',
                    explanation: ''
                };
                inExplanation = false;
                return;
            }

            // 新题：题目: xxx
            const titleMatch = line.match(qTitlePrefix);
            if (titleMatch) {
                if (currentQ) parsed.push(currentQ);
                currentQ = {
                    content: titleMatch[2].trim(),
                    options: [],
                    type: 'CHOICE',
                    answer: '',
                    explanation: ''
                };
                inExplanation = false;
                return;
            }

            // 新题：1. 或 第1题
            if (qStartRegex.test(line) || qOrdinalRegex.test(line)) {
                if (currentQ) parsed.push(currentQ);
                currentQ = {
                    content: line.replace(qStartRegex, '').replace(qOrdinalRegex, '').trim(),
                    options: [],
                    type: 'CHOICE',
                    answer: '',
                    explanation: ''
                };
                inExplanation = false;
                return;
            }

            if (!currentQ) return;

            // 检查是否是同行多个选项（如 "A. 0　B. 1　C. 2　D. 3"）
            const multiOptMatches = line.match(multiOptRegex);
            if (multiOptMatches && multiOptMatches.length > 1) {
                // 同行有多个选项，分别添加
                multiOptMatches.forEach(opt => {
                    currentQ.options.push(opt.trim());
                });
                return;
            }

            // 单个选项行
            if (optStartRegex.test(line)) {
                currentQ.options.push(line);
                return;
            }

            if (isAnswerLine) {
                const parts = line.split(/[:：]/);
                currentQ.answer = (parts[1] || '').trim();
                inExplanation = false;
                return;
            }

            if (isExplainStart) {
                const parts = line.split(/[:：]/);
                const after = parts.slice(1).join(':').trim();
                if (after) currentQ.explanation = after;
                inExplanation = true;
                return;
            }

            if (inExplanation) {
                currentQ.explanation = currentQ.explanation
                    ? currentQ.explanation + '\n' + line
                    : line;
                return;
            }

            // 其它文本：在未进入解析前，视为题干补充
            if (!currentQ.answer && currentQ.options.length === 0) {
                currentQ.content = currentQ.content
                    ? currentQ.content + '\n' + line
                    : line;
            }
        });

        if (currentQ) parsed.push(currentQ);

        // 调试：输出解析结果
        console.log('=== 解析结果 ===');
        parsed.forEach((q, i) => {
            console.log(`题目 ${i + 1}:`, {
                content: q.content.substring(0, 50) + '...',
                options: q.options,
                answer: q.answer,
                explanation: q.explanation ? q.explanation.substring(0, 100) + '...' : '无'
            });
        });

        setPreviewQuestions(parsed);
        if (parsed.length === 0) {
            alert("未解析出题目，请检查格式（示例：`题目: ...`、`第1题 ...` 或 `1．题干...`，选项 `A．...`）");
        }
    };

    const handlePdfUpload = async () => {
        if (!questionPdf) {
            alert("请先选择试卷 PDF");
            return;
        }

        setUploadingPdf(true);
        const formData = new FormData();
        formData.append('questionPdf', questionPdf);
        if (answerPdf) {
            formData.append('answerPdf', answerPdf);
        }
        formData.append('paperId', selectedPaperId === 'new' ? '' : selectedPaperId);
        formData.append('newPaperTitle', selectedPaperId === 'new' ? newPaperTitle : '');

        try {
            const res = await fetch('/api/import-pdf', {
                method: 'POST',
                body: formData
            });
            const json = await res.json();

            if (res.ok) {
                if (json.questions && json.questions.length > 0) {
                    setPreviewQuestions(json.questions);
                    const msg = `PDF 解析成功！识别到 ${json.questions.length} 道题目${json.hasAnswers ? '（含答案）' : ''}，请预览确认后导入。`;
                    alert(msg);
                } else {
                    alert("PDF 解析完成，但未识别到题目。请检查 PDF 格式或尝试手动输入。");
                }
            } else {
                alert("PDF 上传失败: " + (json.error || "未知错误"));
            }
        } catch (e) {
            console.error(e);
            alert("PDF 处理出错");
        } finally {
            setUploadingPdf(false);
        }
    };

    const handleImport = async () => {
        if (previewQuestions.length === 0) return;
        if (selectedPaperId === 'new' && (!newPaperTitle || !newPaperSubject || !newPaperType)) {
            alert("请先选择学科、题库类型并填写试卷标题");
            return;
        }
        setImporting(true);
        const selectedPaper = papers.find(p => p.id === selectedPaperId);
        const targetSubject = selectedPaper ? selectedPaper.subject : newPaperSubject;
        const targetPaperType = selectedPaper ? (selectedPaper.paperType || "REAL") : newPaperType;
        try {
            const res = await fetch('/api/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    paperId: selectedPaperId === 'new' ? null : selectedPaperId,
                    newPaperTitle: selectedPaperId === 'new' ? newPaperTitle : null,
                    subject: targetSubject,
                    paperType: targetPaperType,
                    questions: previewQuestions
                })
            });
            const json = await res.json();
            if (res.ok) {
                alert("导入成功！已导入 " + json.count + " 道题目。");
                setImportContent("");
                setPreviewQuestions([]);
                setQuestionPdf(null);
                setAnswerPdf(null);
                // Refresh papers list
                fetch('/api/papers')
                    .then(res => res.json())
                    .then(data => {
                        if (data.papers) setPapers(data.papers);
                    });
            } else {
                alert("导入失败: " + json.error);
            }
        } catch (e) {
            console.error(e);
            alert("导入出错");
        } finally {
            setImporting(false);
        }
    };

    const handleCreatePaper = async () => {
        if (!newPaperTitle || !newPaperYear || !newPaperSubject || !newPaperType) {
            alert("请填写完整信息");
            return;
        }

        try {
            const res = await fetch('/api/papers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newPaperTitle,
                    year: newPaperYear,
                    subject: newPaperSubject,
                    paperType: newPaperType,
                })
            });
            const json = await res.json();
            if (res.ok) {
                alert("试卷创建成功！");
                setPapers([...papers, json.paper]);
                setNewPaperTitle("");
                setNewPaperYear(new Date().getFullYear());
                setNewPaperSubject("MATH");
                setNewPaperType("REAL");
                setShowCreateForm(false);
            } else {
                alert("创建失败: " + json.error);
            }
        } catch (e) {
            console.error(e);
            alert("创建出错");
        }
    };

    const handleUpdatePaper = async () => {
        if (!editingPaper) return;
        if (!editingPaper.title || !editingPaper.year || !editingPaper.subject || !editingPaper.paperType) {
            alert("请填写完整信息");
            return;
        }

        try {
            const res = await fetch(`/api/papers/${editingPaper.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: editingPaper.title,
                    year: editingPaper.year,
                    subject: editingPaper.subject,
                    paperType: editingPaper.paperType,
                })
            });
            const json = await res.json();
            if (res.ok) {
                alert("试卷更新成功！");
                setPapers(papers.map(p => p.id === editingPaper.id ? json.paper : p));
                setEditingPaper(null);
            } else {
                alert("更新失败: " + json.error);
            }
        } catch (e) {
            console.error(e);
            alert("更新出错");
        }
    };

    const handleDeletePaper = async (paperId: string) => {
        if (!confirm("确定要删除这个试卷吗？此操作不可恢复。")) return;

        try {
            const res = await fetch(`/api/papers/${paperId}`, {
                method: 'DELETE',
            });
            const json = await res.json();
            if (res.ok) {
                alert("试卷删除成功！");
                setPapers(papers.filter(p => p.id !== paperId));
                if (selectedPaperId === paperId) {
                    setSelectedPaperId("new");
                }
            } else {
                alert("删除失败: " + json.error);
            }
        } catch (e) {
            console.error(e);
            alert("删除出错");
        }
    };

    if (checkingAuth) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
            </div>
        );
    }

    const selectedPaper = papers.find(p => p.id === selectedPaperId);

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col">
                <GamificationHeader />
                <main className="flex-1 flex items-center justify-center p-4">
                    <Card className="max-w-md w-full border-red-200 bg-red-50/50">
                        <CardHeader className="text-center">
                            <div className="flex justify-center mb-4">
                                <div className="p-3 rounded-full bg-red-100">
                                    <AlertCircle className="w-8 h-8 text-red-600" />
                                </div>
                            </div>
                            <CardTitle className="text-red-700">无权限访问</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center text-neutral-600">
                            <p>此功能仅限管理员使用。</p>
                            <p className="text-sm mt-2">如需使用，请联系管理员获取权限。</p>
                        </CardContent>
                    </Card>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col">
            <GamificationHeader />
            <main className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">题库管理</h1>
                        <p className="text-neutral-600 mt-1">试卷和题目的增删改查</p>
                    </div>
                    <Button variant="outline" onClick={() => router.back()} className="flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        返回
                    </Button>
                </div>

                {/* 试卷管理卡片 */}
                <Card className="bg-white border border-neutral-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-xl font-semibold text-neutral-900">试卷管理</CardTitle>
                        <Button
                            onClick={() => {
                                setShowCreateForm(!showCreateForm);
                                setEditingPaper(null);
                            }}
                            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            新建试卷
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* 创建/编辑表单 */}
                        {(showCreateForm || editingPaper) && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-3"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                    <Input
                                        placeholder="试卷标题"
                                        value={editingPaper ? editingPaper.title : newPaperTitle}
                                        onChange={(e) => {
                                            if (editingPaper) {
                                                setEditingPaper({ ...editingPaper, title: e.target.value });
                                            } else {
                                                setNewPaperTitle(e.target.value);
                                            }
                                        }}
                                    />
                                    <Input
                                        type="number"
                                        placeholder="年份"
                                        value={editingPaper ? editingPaper.year : newPaperYear}
                                        onChange={(e) => {
                                            const year = parseInt(e.target.value);
                                            if (editingPaper) {
                                                setEditingPaper({ ...editingPaper, year });
                                            } else {
                                                setNewPaperYear(year);
                                            }
                                        }}
                                    />
                                    <Select
                                        value={editingPaper ? editingPaper.subject : newPaperSubject}
                                        onValueChange={(value) => {
                                            if (editingPaper) {
                                                setEditingPaper({ ...editingPaper, subject: value });
                                            } else {
                                                setNewPaperSubject(value);
                                            }
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="学科" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MATH">高数</SelectItem>
                                            <SelectItem value="ENGLISH">英语</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select
                                        value={editingPaper ? (editingPaper.paperType || "REAL") : newPaperType}
                                        onValueChange={(value) => {
                                            if (editingPaper) {
                                                setEditingPaper({ ...editingPaper, paperType: value });
                                            } else {
                                                setNewPaperType(value);
                                            }
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="题库类型" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="REAL">真题</SelectItem>
                                            <SelectItem value="PRACTICE">练习/模拟</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={editingPaper ? handleUpdatePaper : handleCreatePaper}
                                        className="bg-cyan-500 hover:bg-cyan-600 text-white"
                                    >
                                        {editingPaper ? "更新" : "创建"}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setShowCreateForm(false);
                                            setEditingPaper(null);
                                        }}
                                    >
                                        取消
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* 试卷列表 */}
                        <div className="space-y-2">
                            {papers.map((paper) => (
                                <div
                                    key={paper.id}
                                    className="flex items-center justify-between p-3 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                                >
                                    <div className="flex-1">
                                        <div className="font-medium text-neutral-900">{paper.title}</div>
                                        <div className="text-sm text-neutral-500 mt-1">
                                            {paper.year}年 · {paper.subject === 'MATH' ? '高数' : '英语'} · {(paper.paperType === 'PRACTICE' ? '练习' : '真题')} ·
                                            {paper._count?.questions || 0} 道题
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setEditingPaper({ ...paper, paperType: paper.paperType || "REAL" });
                                                setShowCreateForm(false);
                                            }}
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDeletePaper(paper.id)}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {papers.length === 0 && (
                                <div className="text-center py-8 text-neutral-500">
                                    暂无试卷，点击"新建试卷"创建第一个
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* 题目导入卡片 */}
                <Card className="bg-white border border-neutral-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold text-neutral-900">题目导入</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-700">选择目标试卷</label>
                            <Select value={selectedPaperId} onValueChange={setSelectedPaperId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="选择试卷" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="new">+ 创建新试卷</SelectItem>
                                    {papers.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.title} ({p.year})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {selectedPaperId === 'new' ? (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <Input
                                        placeholder="输入新试卷标题 (例如: 2024年高等数学模拟卷)"
                                        value={newPaperTitle}
                                        onChange={e => setNewPaperTitle(e.target.value)}
                                    />
                                    <Select value={newPaperSubject} onValueChange={setNewPaperSubject}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="选择学科" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MATH">高数真题/练习</SelectItem>
                                            <SelectItem value="ENGLISH">英语真题/练习</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={newPaperType} onValueChange={setNewPaperType}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="选择题库类型" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="REAL">真题库</SelectItem>
                                            <SelectItem value="PRACTICE">练习题库</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2 text-sm text-neutral-600">
                                    <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                                        {selectedPaper?.subject === 'ENGLISH' ? '英语' : '高数'}
                                    </span>
                                    <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                                        {selectedPaper?.paperType === 'PRACTICE' ? '练习题库' : '真题库'}
                                    </span>
                                    <span className="px-2 py-1 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200">
                                        {selectedPaper?._count?.questions || 0} 道题
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-700">粘贴或上传 Markdown（含题干/选项/答案/解析）</label>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Input
                                    type="file"
                                    accept=".md,text/markdown,text/plain"
                                    className="sm:w-1/2"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const text = await file.text();
                                        setImportContent(text);
                                    }}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="sm:w-32"
                                    onClick={() => {
                                        if (!importContent) {
                                            alert("请先上传或粘贴 Markdown 内容");
                                            return;
                                        }
                                        parseText();
                                    }}
                                >
                                    上传并解析
                                </Button>
                            </div>
                            <Textarea
                                className="min-h-[300px] font-mono text-sm"
                                placeholder={`示例: 
1. 题干...
A. 选项A
B. 选项B
C. 选项C
D. 选项D
Answer: A
Explanation: 解析...`}
                                value={importContent}
                                onChange={e => setImportContent(e.target.value)}
                            />
                            <Button onClick={parseText} disabled={!importContent} className="bg-cyan-500 hover:bg-cyan-600 text-white">
                                解析预览
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {previewQuestions.length > 0 && (
                    <Card className="border-green-200 bg-green-50/50">
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center text-green-700">
                                <span>✅ 预览: 即将导入 {previewQuestions.length} 道题</span>
                                <Button onClick={handleImport} disabled={importing} className="bg-green-600 hover:bg-green-700 text-white">
                                    {importing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    确认导入
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                {previewQuestions.map((q, i) => (
                                    <div key={i} className="p-3 bg-white rounded border border-neutral-200 text-sm">
                                        <div className="font-bold flex gap-2">
                                            <span className="text-neutral-500">#{i + 1}</span>
                                            <MathText text={q.content} className="flex-1" />
                                        </div>
                                        {q.options && q.options.length > 0 && (
                                            <div className="grid grid-cols-2 gap-1 mt-2 text-xs text-neutral-600">
                                                {q.options.map((o: string, idx: number) => (
                                                    <MathText key={idx} text={o} />
                                                ))}
                                            </div>
                                        )}
                                        <div className="mt-2 text-xs flex flex-col gap-2">
                                            <span className="text-green-600 font-semibold">答案: {q.answer}</span>
                                            {q.explanation && (
                                                <div className="text-neutral-700 bg-blue-50 p-2 rounded border border-blue-200">
                                                    <div className="font-semibold text-blue-700 mb-1">解析:</div>
                                                    <MathText text={q.explanation} className="whitespace-pre-wrap" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    );
}
