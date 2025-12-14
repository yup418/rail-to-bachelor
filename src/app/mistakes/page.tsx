"use client";

import { useState, useEffect } from "react";
import { GamificationHeader } from "@/features/gamification/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertCircle, Calendar, Filter, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import Link from "next/link";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface Question {
    id: string;
    content: string;
    type: string;
    options: string | null;
    answer: string;
    explanation: string | null;
    mistakeDate: string;
    tags: { name: string }[];
}

export default function MistakesPage() {
    const [period, setPeriod] = useState("all");
    const [type, setType] = useState("ALL");
    const [mistakes, setMistakes] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);

    const periodOptions = [
        { value: "all", label: "全部时间" },
        { value: "day", label: "今日" },
        { value: "week", label: "本周" },
        { value: "month", label: "本月" },
    ];

    const typeOptions = [
        { value: "ALL", label: "全部题型" },
        { value: "CHOICE", label: "选择题" },
        { value: "FILL", label: "填空题" },
    ];

    useEffect(() => {
        async function fetchMistakes() {
            setLoading(true);
            try {
                const res = await fetch(`/api/mistakes?period=${period}&type=${type}`);
                const json = await res.json();
                if (json.mistakes) {
                    setMistakes(json.mistakes);
                }
            } catch (error) {
                console.error("Failed to fetch mistakes", error);
            } finally {
                setLoading(false);
            }
        }
        fetchMistakes();
    }, [period, type]);

    return (
        <div className="min-h-screen bg-background text-foreground dot-pattern">
            <GamificationHeader />
            <main className="container mx-auto px-4 py-8 max-w-5xl space-y-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-4">
                            <Link href="/">
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    返回主页
                                </Button>
                            </Link>
                            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent flex items-center gap-2">
                                <AlertCircle className="w-8 h-8 text-red-500" />
                                错题集锦
                            </h1>
                        </div>
                        <p className="text-muted-foreground">复习是最好的老师。消灭这些红点, 你的分数就会上涨。</p>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-2">
                        <Select value={period} onValueChange={setPeriod}>
                            <SelectTrigger className="w-[120px]">
                                <Calendar className="w-4 h-4 mr-2" />
                                <SelectValue placeholder="时间" />
                            </SelectTrigger>
                            <SelectContent>
                                {periodOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger className="w-[120px]">
                                <Filter className="w-4 h-4 mr-2" />
                                <SelectValue placeholder="题型" />
                            </SelectTrigger>
                            <SelectContent>
                                {typeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <LoadingSpinner size="lg" text="加载错题中..." />
                    </div>
                ) : mistakes.length === 0 ? (
                    <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
                        <p className="text-muted-foreground">太棒了！当前筛选条件下没有错题。</p>
                        <p className="text-sm text-muted-foreground mt-2">快去刷题挑战自己吧！</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        <AnimatePresence>
                            {mistakes.map((q) => (
                                <motion.div
                                    key={q.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    layout
                                >
                                    <MistakeCard question={q} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </main>
        </div>
    );
}

function MistakeCard({ question }: { question: Question }) {
    const [showAnswer, setShowAnswer] = useState(false);

    // Parse options if choice
    let optionsList: string[] = [];
    try {
        if (question.type === 'CHOICE' && question.options) {
            optionsList = JSON.parse(question.options);
        }
    } catch (e) { }

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div className="flex gap-2">
                        <Badge variant="outline">{question.type === 'CHOICE' ? '选择题' : '填空题'}</Badge>
                        {question.tags.map(t => <Badge key={t.name} variant="secondary">{t.name}</Badge>)}
                    </div>
                    <span className="text-xs text-muted-foreground">
                        记录于 {new Date(question.mistakeDate).toLocaleDateString()}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="text-lg font-medium">
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                        {question.content}
                    </ReactMarkdown>
                </div>

                {optionsList.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-2">
                        {optionsList.map((opt, i) => (
                            <div key={i} className="p-2 rounded bg-muted/30 text-sm border border-transparent hover:border-muted-foreground/20">
                                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                    {opt}
                                </ReactMarkdown>
                            </div>
                        ))}
                    </div>
                )}

                <div className="pt-2 border-t flex justify-between items-center">
                    <Link href={`/mistakes/${question.id}`}>
                        <Button variant="default" size="sm">
                            查看详情
                        </Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => setShowAnswer(!showAnswer)}>
                        {showAnswer ? "隐藏解析" : "快速查看"}
                    </Button>
                </div>

                {showAnswer && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg border border-green-100 dark:border-green-800 text-sm space-y-2"
                    >
                        <p className="font-bold text-green-700 dark:text-green-400">正确答案: {question.answer}</p>
                        <div className="text-muted-foreground">
                            <span className="font-semibold text-foreground">解析: </span>
                            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                {question.explanation || "暂无解析"}
                            </ReactMarkdown>
                        </div>
                    </motion.div>
                )}
            </CardContent>
        </Card>
    )
}
