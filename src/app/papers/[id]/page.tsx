"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle, Clock, Flag, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { MathText } from "@/components/MathText";
import { motion, AnimatePresence } from "framer-motion";
import { QuestionEditDialog } from "@/components/QuestionEditDialog";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface Tag {
    id: string;
    name: string;
}

interface Question {
    id: string;
    content: string;
    type: string;
    options: string | null;
    answer: string;
    explanation: string;
    difficulty: number;
    tags?: Tag[];
}

interface ExamPaperDetail {
    id: string;
    title: string;
    year: number;
    subject: string;
    paperType: string;
    questions: Question[];
}

interface UserAnswer {
    questionId: string;
    answer: string;
}

export default function PaperExamPage() {
    const params = useParams();
    const router = useRouter();
    const [paper, setPaper] = useState<ExamPaperDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<Map<string, string>>(new Map());
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showReport, setShowReport] = useState(false);
    const [startTime] = useState(Date.now());
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isAdmin, setIsAdmin] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

    useEffect(() => {
        if (!params.id) return;
        loadPaper();
    }, [params.id]);

    // 检查管理员权限
    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                setIsAdmin(data.user?.role === 'ADMIN');
            })
            .catch(() => setIsAdmin(false));
    }, []);

    const loadPaper = () => {
        setLoading(true);
        fetch(`/api/papers/${params.id}`)
            .then(res => res.json())
            .then(data => setPaper(data))
            .finally(() => setLoading(false));
    };

    // 计时器
    useEffect(() => {
        if (isSubmitted) return;
        const timer = setInterval(() => {
            setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);
        return () => clearInterval(timer);
    }, [startTime, isSubmitted]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleDeleteQuestion = async (questionId: string) => {
        if (!confirm('确定要删除这道题吗？此操作不可撤销！')) return;

        try {
            const res = await fetch(`/api/questions/${questionId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                alert('题目已删除');
                loadPaper(); // 重新加载试卷
            } else {
                const data = await res.json();
                alert('删除失败: ' + (data.error || '未知错误'));
            }
        } catch (e) {
            console.error(e);
            alert('删除出错');
        }
    };

    const handleAnswer = (questionId: string, answer: string) => {
        const newAnswers = new Map(userAnswers);
        newAnswers.set(questionId, answer);
        setUserAnswers(newAnswers);
    };

    const goToQuestion = (index: number) => {
        setCurrentIndex(index);
    };

    const handleNext = () => {
        if (paper && currentIndex < paper.questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleSubmit = async () => {
        if (!paper) return;
        const unanswered = paper.questions.filter(q => !userAnswers.has(q.id));
        if (unanswered.length > 0) {
            alert(`还有 ${unanswered.length} 道题未作答，请完成所有题目后再提交！`);
            return;
        }
        if (confirm('确定要提交答卷吗？提交后将无法修改。')) {
            setIsSubmitted(true);
            setShowReport(true);

            // 保存答题记录和每道题的学习记录
            try {
                const score = calculateScore();
                const answersObj: Record<string, string> = {};
                userAnswers.forEach((value, key) => {
                    answersObj[key] = value;
                });

                // 保存整体答题记录
                await fetch('/api/exam-records', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        paperId: paper.id,
                        answers: answersObj,
                        score: score.percentage,
                        totalQuestions: score.total,
                        timeSpent: elapsedTime,
                    }),
                });

                // 保存每道题的答题记录（用于错题集）
                const studyRecordPromises = paper.questions.map(q => {
                    const userAnswer = userAnswers.get(q.id);
                    const isCorrect = userAnswer?.trim().toLowerCase() === q.answer.trim().toLowerCase();

                    return fetch('/api/mistakes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            questionId: q.id,
                            isCorrect,
                            userAnswer: userAnswer || '',
                            duration: Math.floor(elapsedTime / paper.questions.length), // 平均用时
                        }),
                    });
                });

                await Promise.all(studyRecordPromises);
                console.log('所有答题记录已保存');
            } catch (e) {
                console.error('保存答题记录失败:', e);
                // 不影响用户查看报告
            }
        }
    };

    const calculateScore = () => {
        if (!paper) return { correct: 0, total: 0, percentage: 0 };
        let correct = 0;
        paper.questions.forEach(q => {
            const userAnswer = userAnswers.get(q.id);
            if (userAnswer && userAnswer.trim().toLowerCase() === q.answer.trim().toLowerCase()) {
                correct++;
            }
        });
        return {
            correct,
            total: paper.questions.length,
            percentage: Math.round((correct / paper.questions.length) * 100)
        };
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <LoadingSpinner size="lg" text="加载试卷中..." />
        </div>
    );
    if (!paper) return <div className="p-8 text-center">试卷未找到</div>;

    const currentQuestion = paper.questions[currentIndex];
    const currentOptions = currentQuestion?.options ? JSON.parse(currentQuestion.options) as string[] : [];
    const currentUserAnswer = userAnswers.get(currentQuestion?.id || '');
    const score = calculateScore();

    // 管理员题目管理视图
    if (isAdmin) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 md:p-8">
                <div className="max-w-6xl mx-auto space-y-6">
                    {/* 头部 */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href={`/papers?subject=${paper.subject}&type=${paper.paperType}`}>
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    返回试卷库
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold">{paper.title}</h1>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {paper.subject === 'MATH' ? '高等数学' : '大学英语'} · {paper.year}年 · 共 {paper.questions.length} 题
                                </p>
                            </div>
                        </div>
                        <Badge variant="outline" className="text-lg px-4 py-2">
                            管理员模式
                        </Badge>
                    </div>

                    {/* 题目列表 */}
                    <div className="space-y-4">
                        {paper.questions.map((q, index) => {
                            const opts = q.options ? JSON.parse(q.options) as string[] : [];

                            return (
                                <Card key={q.id} className="hover:shadow-lg transition-shadow">
                                    <CardContent className="p-6 space-y-4">
                                        {/* 题目头部 */}
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
                                                        {index + 1}
                                                    </div>
                                                    <Badge>{q.type === 'CHOICE' ? '选择题' : '其他'}</Badge>
                                                    <Badge variant="outline">难度: {q.difficulty}/5</Badge>
                                                </div>
                                                <MathText text={q.content} className="text-lg font-medium leading-relaxed" />
                                            </div>
                                            {/* 操作按钮 */}
                                            <div className="flex gap-2 ml-4">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setEditingQuestion(q)}
                                                >
                                                    <Edit className="w-4 h-4 mr-1" />
                                                    编辑
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleDeleteQuestion(q.id)}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-1" />
                                                    删除
                                                </Button>
                                            </div>
                                        </div>

                                        {/* 选项 */}
                                        {q.type === 'CHOICE' && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-11">
                                                {opts.map((opt, i) => {
                                                    const optLabel = opt.charAt(0);
                                                    const isCorrect = q.answer.trim() === optLabel;

                                                    return (
                                                        <div
                                                            key={i}
                                                            className={`p-3 rounded-lg border-2 ${isCorrect
                                                                ? 'border-green-500 bg-green-50'
                                                                : 'border-gray-200 bg-white'
                                                                }`}
                                                        >
                                                            <MathText text={opt} className="text-sm" />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* 答案和解析 */}
                                        <div className="space-y-3 pl-11 pt-3 border-t">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-green-600">✓ 正确答案:</span>
                                                <span className="font-mono font-bold">{q.answer}</span>
                                            </div>
                                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                                <div className="font-semibold text-blue-700 mb-2">📖 解析：</div>
                                                <MathText text={q.explanation} className="text-sm text-gray-700 whitespace-pre-wrap" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* 空状态 */}
                    {paper.questions.length === 0 && (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <p className="text-muted-foreground">该试卷暂无题目</p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* 编辑对话框 */}
                <QuestionEditDialog
                    question={editingQuestion}
                    open={!!editingQuestion}
                    onOpenChange={(open) => !open && setEditingQuestion(null)}
                    onSave={() => {
                        loadPaper();
                        setEditingQuestion(null);
                    }}
                />
            </div>
        );
    }

    // 答题报告视图
    if (showReport) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* 报告头部 */}
                    <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        <CardContent className="p-8">
                            <div className="text-center space-y-4">
                                <div className="text-6xl font-bold">{score.percentage}分</div>
                                <div className="text-xl">
                                    答对 {score.correct} / {score.total} 题
                                </div>
                                <div className="flex justify-center gap-8 text-sm opacity-90">
                                    <div>用时: {formatTime(elapsedTime)}</div>
                                    <div>正确率: {score.percentage}%</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 题目详解 */}
                    <div className="space-y-4">
                        {paper.questions.map((q, index) => {
                            const opts = q.options ? JSON.parse(q.options) as string[] : [];
                            const userAns = userAnswers.get(q.id) || '';
                            const isCorrect = userAns.trim().toLowerCase() === q.answer.trim().toLowerCase();

                            return (
                                <Card key={q.id} className={`border-2 ${isCorrect ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}`}>
                                    <CardContent className="p-6 space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge variant={isCorrect ? "default" : "destructive"}>
                                                        {isCorrect ? '✓ 正确' : '✗ 错误'}
                                                    </Badge>
                                                    <span className="text-sm text-muted-foreground">第 {index + 1} 题</span>
                                                </div>
                                                <MathText text={q.content} className="text-base font-medium" />
                                            </div>
                                            {/* 管理员操作按钮 */}
                                            {isAdmin && (
                                                <div className="flex gap-2 ml-4">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setEditingQuestion(q)}
                                                    >
                                                        <Edit className="w-4 h-4 mr-1" />
                                                        编辑
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleDeleteQuestion(q.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-1" />
                                                        删除
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        {q.type === 'CHOICE' && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {opts.map((opt, i) => {
                                                    const optLabel = opt.charAt(0);
                                                    const isUserChoice = userAns === optLabel;
                                                    const isCorrectChoice = q.answer.trim() === optLabel;

                                                    return (
                                                        <div
                                                            key={i}
                                                            className={`p-3 rounded-lg border-2 ${isCorrectChoice
                                                                ? 'border-green-500 bg-green-100'
                                                                : isUserChoice
                                                                    ? 'border-red-500 bg-red-100'
                                                                    : 'border-gray-200'
                                                                }`}
                                                        >
                                                            <MathText text={opt} className="text-sm" />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        <div className="space-y-2 pt-4 border-t">
                                            <div className="flex gap-4 text-sm">
                                                <span className="font-semibold text-green-600">正确答案: {q.answer}</span>
                                                <span className="font-semibold text-gray-600">你的答案: {userAns || '未作答'}</span>
                                            </div>
                                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                                <div className="font-semibold text-blue-700 mb-2">📖 解析：</div>
                                                <MathText text={q.explanation} className="text-sm text-gray-700 whitespace-pre-wrap" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* 底部按钮 */}
                    <div className="flex justify-center gap-4 pb-8">
                        <Link href={`/papers?subject=${paper.subject}&type=${paper.paperType}`}>
                            <Button variant="outline" size="lg">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                返回试卷库
                            </Button>
                        </Link>
                        <Button size="lg" onClick={() => window.location.reload()}>
                            再做一次
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // 答题视图
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
            {/* 顶部导航栏 */}
            <div className="bg-white border-b shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={`/papers?subject=${paper.subject}&type=${paper.paperType}`}>
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                退出
                            </Button>
                        </Link>
                        <div>
                            <div className="font-bold text-lg">{paper.title}</div>
                            <div className="text-sm text-muted-foreground">
                                {paper.subject === 'MATH' ? '高等数学' : '大学英语'} · {paper.year}年
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4" />
                            <span className="font-mono">{formatTime(elapsedTime)}</span>
                        </div>
                        <Badge variant="outline">
                            {userAnswers.size} / {paper.questions.length} 已答
                        </Badge>
                        <Button
                            onClick={handleSubmit}
                            disabled={userAnswers.size < paper.questions.length}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                        >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            提交答卷
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4 md:p-8 flex gap-6">
                {/* 左侧：题目导航面板 */}
                <div className="w-64 flex-shrink-0">
                    <Card className="sticky top-24">
                        <CardContent className="p-4">
                            <div className="font-semibold mb-3 flex items-center gap-2">
                                <Flag className="w-4 h-4" />
                                题目导航
                            </div>
                            <div className="grid grid-cols-5 gap-2">
                                {paper.questions.map((q, index) => {
                                    const isAnswered = userAnswers.has(q.id);
                                    const isCurrent = index === currentIndex;

                                    return (
                                        <button
                                            key={q.id}
                                            onClick={() => goToQuestion(index)}
                                            className={`
                                                aspect-square rounded-lg text-sm font-medium transition-all
                                                ${isCurrent
                                                    ? 'bg-blue-500 text-white ring-2 ring-blue-300 scale-110'
                                                    : isAnswered
                                                        ? 'bg-green-500 text-white hover:bg-green-600'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }
                                            `}
                                        >
                                            {index + 1}
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-blue-500"></div>
                                    <span>当前题目</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-green-500"></div>
                                    <span>已作答</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-gray-100"></div>
                                    <span>未作答</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 右侧：题目内容 */}
                <div className="flex-1">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Card className="shadow-lg">
                                <CardContent className="p-8 space-y-6">
                                    {/* 题目头部 */}
                                    <div className="flex items-center justify-between pb-4 border-b">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                                                {currentIndex + 1}
                                            </div>
                                            <div>
                                                <div className="font-semibold">第 {currentIndex + 1} 题</div>
                                                <div className="text-sm text-muted-foreground">
                                                    共 {paper.questions.length} 题
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge>{currentQuestion.type === 'CHOICE' ? '选择题' : '其他'}</Badge>
                                            {currentQuestion.tags && currentQuestion.tags.length > 0 && (
                                                <>
                                                    {currentQuestion.tags.map((tag) => (
                                                        <Badge key={tag.id} variant="secondary" className="text-xs">
                                                            {tag.name}
                                                        </Badge>
                                                    ))}
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* 题目内容 */}
                                    <div className="text-lg leading-relaxed">
                                        <MathText text={currentQuestion.content} />
                                    </div>

                                    {/* 选项 */}
                                    {currentQuestion.type === 'CHOICE' && (
                                        <div className="space-y-3">
                                            {currentOptions.map((opt, i) => {
                                                const optLabel = opt.charAt(0);
                                                const isSelected = currentUserAnswer === optLabel;

                                                return (
                                                    <button
                                                        key={i}
                                                        onClick={() => handleAnswer(currentQuestion.id, optLabel)}
                                                        className={`
                                                            w-full p-4 rounded-xl border-2 text-left transition-all
                                                            ${isSelected
                                                                ? 'border-blue-500 bg-blue-50 shadow-md scale-[1.02]'
                                                                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                                            }
                                                        `}
                                                    >
                                                        <MathText text={opt} className="text-base" />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* 导航按钮 */}
                                    <div className="flex justify-between pt-6 border-t">
                                        <Button
                                            onClick={handlePrevious}
                                            disabled={currentIndex === 0}
                                            variant="outline"
                                            size="lg"
                                        >
                                            <ChevronLeft className="w-4 h-4 mr-2" />
                                            上一题
                                        </Button>
                                        <Button
                                            onClick={handleNext}
                                            disabled={currentIndex === paper.questions.length - 1}
                                            size="lg"
                                        >
                                            下一题
                                            <ChevronRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* 题目编辑对话框 */}
            <QuestionEditDialog
                question={editingQuestion}
                open={!!editingQuestion}
                onOpenChange={(open) => !open && setEditingQuestion(null)}
                onSave={() => {
                    loadPaper();
                    setEditingQuestion(null);
                }}
            />
        </div>
    );
}
