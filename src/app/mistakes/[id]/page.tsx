"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, XCircle, Lightbulb } from "lucide-react";
import Link from "next/link";
import { MathText } from "@/components/MathText";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface Question {
    id: string;
    content: string;
    type: string;
    options: string | null;
    answer: string;
    explanation: string | null;
    tags: { name: string }[];
}

export default function MistakeDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [question, setQuestion] = useState<Question | null>(null);
    const [loading, setLoading] = useState(true);
    const [userAnswer, setUserAnswer] = useState("");
    const [showAnswer, setShowAnswer] = useState(false);

    useEffect(() => {
        if (params.id) {
            loadQuestion();
        }
    }, [params.id]);

    const loadQuestion = async () => {
        try {
            const res = await fetch(`/api/questions/${params.id}`);
            const data = await res.json();

            if (data) {
                setQuestion(data);
            }
        } catch (error) {
            console.error('Load question error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" text="加载错题中..." />
            </div>
        );
    }

    if (!question) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card>
                    <CardContent className="p-12 text-center">
                        <p className="text-muted-foreground mb-4">题目未找到</p>
                        <Link href="/mistakes">
                            <Button>返回错题集</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const options = question.options ? JSON.parse(question.options) : [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* 头部 */}
                <div className="flex items-center gap-4">
                    <Link href="/mistakes">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            返回错题集
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">错题详情</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            仔细复习，避免再次出错
                        </p>
                    </div>
                </div>

                {/* 题目卡片 */}
                <Card className="border-l-4 border-l-red-500">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>错题回顾</CardTitle>
                            <div className="flex gap-2">
                                <Badge variant="destructive">
                                    <XCircle className="w-3 h-3 mr-1" />
                                    错题
                                </Badge>
                                {question.tags && question.tags.length > 0 && (
                                    <>
                                        {question.tags.map((tag) => (
                                            <Badge key={tag.name} variant="secondary" className="text-xs">
                                                {tag.name}
                                            </Badge>
                                        ))}
                                    </>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* 题目内容 */}
                        <div>
                            <div className="text-sm text-muted-foreground mb-2">题目：</div>
                            <div className="text-lg">
                                <MathText text={question.content} />
                            </div>
                        </div>

                        {/* 选项 */}
                        {question.type === 'CHOICE' && options.length > 0 && (
                            <div className="space-y-2">
                                <div className="text-sm text-muted-foreground mb-2">选项：</div>
                                {options.map((opt: string) => {
                                    const optLabel = opt.charAt(0);
                                    const isCorrect = question.answer === optLabel;

                                    return (
                                        <div
                                            key={opt}
                                            className={`p-4 rounded-lg border-2 ${showAnswer && isCorrect
                                                    ? 'border-green-500 bg-green-50'
                                                    : 'border-gray-200'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                {showAnswer && isCorrect && (
                                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                                )}
                                                <MathText text={opt} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* 显示答案按钮 */}
                        {!showAnswer && (
                            <Button
                                onClick={() => setShowAnswer(true)}
                                variant="outline"
                                className="w-full"
                            >
                                <Lightbulb className="w-4 h-4 mr-2" />
                                查看答案和解析
                            </Button>
                        )}

                        {/* 答案和解析 */}
                        {showAnswer && (
                            <div className="space-y-4 pt-4 border-t">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        <span className="font-semibold text-green-700">正确答案</span>
                                    </div>
                                    <div className="text-2xl font-mono font-bold text-green-700">
                                        {question.answer}
                                    </div>
                                </div>

                                {question.explanation && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Lightbulb className="w-5 h-5 text-blue-600" />
                                            <span className="font-semibold text-blue-700">详细解析</span>
                                        </div>
                                        <div className="text-sm text-gray-700">
                                            <MathText text={question.explanation} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 底部按钮 */}
                <div className="flex justify-center gap-4 pb-8">
                    <Link href="/mistakes">
                        <Button variant="outline" size="lg">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            返回错题集
                        </Button>
                    </Link>
                    <Button
                        size="lg"
                        onClick={() => {
                            setShowAnswer(false);
                            setUserAnswer("");
                        }}
                    >
                        再练一次
                    </Button>
                </div>
            </div>
        </div>
    );
}
