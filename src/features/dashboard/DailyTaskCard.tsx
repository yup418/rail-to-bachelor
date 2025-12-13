"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sword, Brain, Zap, BookOpen, Calculator, Loader2, Sparkles, ChevronRight } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

// Define types based on our API response
interface Tag {
    id: string;
    name: string;
    category: string;
}

interface Question {
    id: string;
    content: string;
    type: string;
    difficulty: number;
    tags: Tag[];
}

interface DailyTask {
    id: string;
    date: string;
    questions: Question[];
}

interface GroupedQuestions {
    [key: string]: Question[];
}

export function DailyTaskCard() {
    const [task, setTask] = useState<DailyTask | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

    useEffect(() => {
        async function fetchTask() {
            try {
                const res = await fetch('/api/daily-task');
                const data = await res.json();
                setTask(data);
                // 默认展开所有类目
                if (data && data.questions) {
                    const categories = new Set<string>();
                    data.questions.forEach((q: Question) => {
                        q.tags.forEach(tag => {
                            categories.add(tag.name);
                        });
                    });
                    setExpandedCategories(categories);
                }
            } catch (error) {
                console.error("Failed to load daily task", error);
            } finally {
                setLoading(false);
            }
        }
        fetchTask();
    }, []);

    // Group questions by tag
    const groupedQuestions = useMemo(() => {
        if (!task) return {};
        
        const grouped: GroupedQuestions = {};
        task.questions.forEach((q) => {
            const primaryTag = q.tags[0]?.name || "未分类";
            if (!grouped[primaryTag]) {
                grouped[primaryTag] = [];
            }
            grouped[primaryTag].push(q);
        });
        
        return grouped;
    }, [task]);

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(category)) {
                newSet.delete(category);
            } else {
                newSet.add(category);
            }
            return newSet;
        });
    };

    if (loading) {
        return (
            <Card className="w-full min-h-[500px] flex items-center justify-center bg-white border border-neutral-200">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-cyan-500" />
                    <p className="text-sm text-neutral-500">加载任务中...</p>
                </div>
            </Card>
        )
    }

    if (!task) return null;

    // Helper to determine icon and styles based on tag category or question type
    const getQuestionStyle = (q: Question) => {
        let icon = <Zap className="w-4 h-4" />;
        let borderColor = "border-cyan-200";
        let iconColor = "text-cyan-500";
        let textColor = "text-cyan-600";
        let bgColor = "bg-cyan-50";

        const isMath = q.tags.some(t => t.category === "MATH");
        const isEnglish = q.tags.some(t => t.category === "ENGLISH");

        if (isMath) {
            icon = <Calculator className="w-4 h-4" />;
            borderColor = "border-blue-200";
            iconColor = "text-blue-500";
            textColor = "text-blue-600";
            bgColor = "bg-blue-50";
        } else if (isEnglish) {
            icon = <BookOpen className="w-4 h-4" />;
            borderColor = "border-emerald-200";
            iconColor = "text-emerald-500";
            textColor = "text-emerald-600";
            bgColor = "bg-emerald-50";
        }

        return { icon, borderColor, iconColor, textColor, bgColor };
    }

    const getCategoryStyle = (category: string) => {
        // 根据类目名称或第一个题目的类型来确定样式
        const firstQuestion = groupedQuestions[category]?.[0];
        if (!firstQuestion) return { bgColor: "bg-neutral-50", borderColor: "border-neutral-200", iconColor: "text-neutral-500" };
        
        const style = getQuestionStyle(firstQuestion);
        return {
            bgColor: style.bgColor,
            borderColor: style.borderColor,
            iconColor: style.iconColor
        };
    }

    const totalQuestions = task.questions.length;
    const categoryCount = Object.keys(groupedQuestions).length;

    return (
        <Card className="relative w-full bg-white border border-neutral-200 shadow-lg overflow-hidden">
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>

            <CardHeader className="relative pb-4">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl font-bold">
                            <div className="p-2 rounded-xl bg-cyan-50 border border-cyan-200">
                                <Sword className="w-5 h-5 text-cyan-500" />
                            </div>
                            <span className="text-neutral-900">
                                今日特训
                            </span>
                        </CardTitle>
                        <CardDescription className="text-neutral-500 text-xs flex items-center gap-2 ml-12">
                            <Sparkles className="w-3 h-3" />
                            {new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })} • {categoryCount} 个类目 • {totalQuestions} 道题
                        </CardDescription>
                    </div>
                    <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-center min-w-[70px]">
                        <div className="text-xl font-bold font-mono bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                            0/{totalQuestions}
                        </div>
                        <div className="text-[9px] uppercase text-neutral-500 tracking-wider mt-0.5">完成</div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="relative space-y-4">
                {Object.entries(groupedQuestions).map(([category, questions], categoryIndex) => {
                    const isExpanded = expandedCategories.has(category);
                    const categoryStyle = getCategoryStyle(category);
                    const firstQuestion = questions[0];
                    const { icon } = getQuestionStyle(firstQuestion);

                    return (
                        <motion.div
                            key={category}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: categoryIndex * 0.1 }}
                            className="border border-neutral-200 rounded-xl overflow-hidden"
                        >
                            {/* Category Header */}
                            <button
                                onClick={() => toggleCategory(category)}
                                className={`w-full flex items-center justify-between p-4 ${categoryStyle.bgColor} border-b ${categoryStyle.borderColor} hover:opacity-90 transition-opacity`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg bg-white border ${categoryStyle.borderColor}`}>
                                        <div className={categoryStyle.iconColor}>
                                            {icon}
                                        </div>
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold text-sm text-neutral-900">{category}</div>
                                        <div className="text-xs text-neutral-500">{questions.length} 道题</div>
                                    </div>
                                </div>
                                <ChevronRight 
                                    className={`w-5 h-5 text-neutral-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                                />
                            </button>

                            {/* Questions List */}
                            {isExpanded && (
                                <div className="bg-white divide-y divide-neutral-100">
                                    {questions.map((q, qIndex) => {
                                        const { icon, borderColor, iconColor, textColor } = getQuestionStyle(q);
                                        return (
                                            <Link 
                                                key={q.id} 
                                                href={`/quiz/${task.id}?questionId=${q.id}`}
                                                className="block"
                                            >
                                                <motion.div
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ duration: 0.2, delay: qIndex * 0.05 }}
                                                    className="flex items-center gap-3 p-4 hover:bg-neutral-50 transition-colors cursor-pointer group/item"
                                                >
                                                    <div className={`p-2 rounded-lg bg-white border ${borderColor} group-hover/item:scale-110 transition-transform duration-200 shrink-0`}>
                                                        <div className={iconColor}>
                                                            {icon}
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium text-sm text-neutral-900 mb-1 line-clamp-2">
                                                            {q.content.substring(0, 60)}
                                                            {q.content.length > 60 && '...'}
                                                        </div>
                                                        <div className="text-xs text-neutral-500 flex items-center gap-2">
                                                            <span className="flex items-center gap-1">
                                                                难度 <span className="text-amber-500">{"⭐".repeat(q.difficulty)}</span>
                                                            </span>
                                                            <span>•</span>
                                                            <span>{q.type}</span>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-neutral-400 group-hover/item:text-cyan-500 transition-colors shrink-0" />
                                                </motion.div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </CardContent>
        </Card>
    )
}
