"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, FileText } from "lucide-react";
import Link from "next/link";

export default function ImportPage() {
    const [markdown, setMarkdown] = useState("");
    const [title, setTitle] = useState("");
    const [year, setYear] = useState(new Date().getFullYear());
    const [subject, setSubject] = useState("MATH");
    const [paperType, setPaperType] = useState("REAL");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

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
            <div className="max-w-4xl mx-auto space-y-6">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
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

                            <div className="space-y-2">
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

                        <div className="space-y-2">
                            <Label htmlFor="markdown">题目内容（Markdown 格式）</Label>
                            <Textarea
                                id="markdown"
                                placeholder={`请按以下格式输入题目：

## 1. 题目内容

A. 选项A
B. 选项B
C. 选项C
D. 选项D

**答案**: A
**解析**: 这里是解析内容

## 2. 下一道题目...`}
                                value={markdown}
                                onChange={(e) => setMarkdown(e.target.value)}
                                rows={15}
                                className="font-mono text-sm"
                            />
                        </div>

                        {message && (
                            <div className={`p-4 rounded-lg ${message.startsWith("✅") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                                {message}
                            </div>
                        )}

                        <Button
                            onClick={handleImport}
                            disabled={loading}
                            className="w-full"
                            size="lg"
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            {loading ? "导入中..." : "开始导入"}
                        </Button>
                    </CardContent>
                </Card>

                {/* Format Guide */}
                <Card>
                    <CardHeader>
                        <CardTitle>格式说明</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p>• 每道题以 <code className="bg-muted px-1 rounded">## 数字.</code> 开头</p>
                        <p>• 选项以 <code className="bg-muted px-1 rounded">A.</code> <code className="bg-muted px-1 rounded">B.</code> 等开头</p>
                        <p>• 答案用 <code className="bg-muted px-1 rounded">**答案**: A</code> 格式</p>
                        <p>• 解析用 <code className="bg-muted px-1 rounded">**解析**: 内容</code> 格式</p>
                        <p>• 支持 LaTeX 数学公式，用 $ 包裹</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
