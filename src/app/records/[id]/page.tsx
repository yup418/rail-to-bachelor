"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, XCircle, Clock, Target } from "lucide-react";
import Link from "next/link";
import { MathText } from "@/components/MathText";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface Answer {
    questionId: string;
    userAnswer: string;
    isCorrect: boolean;
}

interface Question {
    id: string;
    content: string;
    type: string;
    options: string | null;
    answer: string;
    explanation: string;
}

interface ExamRecordDetail {
    id: string;
    score: number;
    totalQuestions: number;
    timeSpent: number;
    completedAt: string;
    answers: Answer[];
    paper: {
        id: string;
        title: string;
        year: number;
        subject: string;
        questions: Question[];
    };
}

export default function RecordDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [record, setRecord] = useState<ExamRecordDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            loadRecordDetail();
        }
    }, [params.id]);

    const loadRecordDetail = async () => {
        try {
            const res = await fetch(`/api/exam-records/${params.id}`);
            const data = await res.json();

            if (data.record) {
                setRecord(data.record);
            }
        } catch (error) {
            console.error('Load record error:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" text="加载答题记录中..." />
            </div>
        );
    }

    if (!record) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card>
                    <CardContent className="p-12 text-center">
                        <p className="text-muted-foreground mb-4">记录未找到</p>
                        <Link href="/records">
                            <Button>返回记录列表</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const correctCount = record.answers.filter(a => a.isCorrect).length;
    const wrongCount = record.totalQuestions - correctCount;
    const passed = record.score >= 60;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 md:p-8">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* 头部 */}
                <div className="flex items-center gap-4">
                    <Link href="/records">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            返回记录
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">答题详情</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            {formatDate(record.completedAt)}
                        </p>
                    </div>
                </div>

                {/* 成绩卡片 */}
                <Card className={`border-2 ${passed ? 'border-green-500 bg-green-50/50' : 'border-red-500 bg-red-50/50'}`}>
                    <CardContent className="p-8">
                        <div className="text-center mb-6">
                            <div className={`text-6xl font-bold mb-2 ${passed ? 'text-green-600' : 'text-red-600'}`}>
                                {record.score}
                                <span className="text-2xl ml-2">分</span>
                            </div>
                            <div className="flex items-center justify-center gap-2 text-xl">
                                {passed ? (
                                    <>
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                        <span className="text-green-600 font-semibold">通过</span>
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="w-6 h-6 text-red-600" />
                                        <span className="text-red-600 font-semibold">未通过</span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-green-600 mb-1">{correctCount}</div>
                                <div className="text-sm text-muted-foreground">答对</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-red-600 mb-1">{wrongCount}</div>
                                <div className="text-sm text-muted-foreground">答错</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-blue-600 mb-1">{formatTime(record.timeSpent)}</div>
                                <div className="text-sm text-muted-foreground">用时</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 试卷信息 */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>{record.paper.title}</CardTitle>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge variant={record.paper.subject === 'MATH' ? 'default' : 'secondary'}>
                                        {record.paper.subject === 'MATH' ? '高等数学' : '大学英语'}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">{record.paper.year}年</span>
                                </div>
                            </div>
                            <Link href={`/papers/${record.paper.id}`}>
                                <Button variant="outline">
                                    <Target className="w-4 h-4 mr-2" />
                                    再做一次
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                </Card>

                {/* 答题详情 */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold">答题详情</h2>
                    {record.paper.questions.map((question, index) => {
                        const userAnswer = record.answers.find(a => a.questionId === question.id);
                        const isCorrect = userAnswer?.isCorrect || false;
                        const options = question.options ? JSON.parse(question.options) : [];

                        return (
                            <Card key={question.id} className={`border-l-4 ${isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
                                <CardContent className="p-6">
                                    {/* 题目头部 */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                                                {index + 1}
                                            </div>
                                            <span className="font-semibold">第 {index + 1} 题</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isCorrect ? (
                                                <Badge className="bg-green-500">
                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                    正确
                                                </Badge>
                                            ) : (
                                                <Badge variant="destructive">
                                                    <XCircle className="w-3 h-3 mr-1" />
                                                    错误
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* 题目内容 */}
                                    <div className="mb-4">
                                        <MathText text={question.content} />
                                    </div>

                                    {/* 选项 */}
                                    {question.type === 'CHOICE' && options.length > 0 && (
                                        <div className="space-y-2 mb-4">
                                            {options.map((opt: string) => {
                                                const optLabel = opt.charAt(0);
                                                const isUserAnswer = userAnswer?.userAnswer === optLabel;
                                                const isCorrectAnswer = question.answer === optLabel;

                                                return (
                                                    <div
                                                        key={opt}
                                                        className={`p-3 rounded-lg border-2 ${isCorrectAnswer
                                                                ? 'border-green-500 bg-green-50'
                                                                : isUserAnswer
                                                                    ? 'border-red-500 bg-red-50'
                                                                    : 'border-gray-200'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            {isCorrectAnswer && (
                                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                                            )}
                                                            {isUserAnswer && !isCorrectAnswer && (
                                                                <XCircle className="w-4 h-4 text-red-600" />
                                                            )}
                                                            <MathText text={opt} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* 答案和解析 */}
                                    <div className="space-y-3 pt-4 border-t">
                                        <div className="flex gap-2">
                                            <span className="font-semibold text-green-600">正确答案:</span>
                                            <span className="font-mono">{question.answer}</span>
                                        </div>
                                        {userAnswer && !isCorrect && (
                                            <div className="flex gap-2">
                                                <span className="font-semibold text-red-600">你的答案:</span>
                                                <span className="font-mono">{userAnswer.userAnswer || '未作答'}</span>
                                            </div>
                                        )}
                                        {question.explanation && (
                                            <div>
                                                <div className="font-semibold text-blue-600 mb-1">解析:</div>
                                                <div className="text-sm text-muted-foreground">
                                                    <MathText text={question.explanation} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* 底部按钮 */}
                <div className="flex justify-center gap-4 pb-8">
                    <Link href="/records">
                        <Button variant="outline" size="lg">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            返回记录列表
                        </Button>
                    </Link>
                    <Link href={`/papers/${record.paper.id}`}>
                        <Button size="lg">
                            <Target className="w-4 h-4 mr-2" />
                            再做一次
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
