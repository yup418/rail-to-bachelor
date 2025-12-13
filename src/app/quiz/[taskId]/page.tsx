"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useParams } from "next/navigation";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, ArrowRight, Loader2, ArrowLeft } from "lucide-react";
import canvasConfetti from 'canvas-confetti';
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function QuizPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const taskId = params.taskId as string;
    const questionId = searchParams.get('questionId');
    
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [xpGainedTotal, setXpGainedTotal] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [levelUp, setLevelUp] = useState(false);
    const [isSingleQuestion, setIsSingleQuestion] = useState(false);

    // Fetch data
    useEffect(() => {
        if (!taskId) return;
        
        async function loadQuiz() {
            try {
                // Try to fetch as exam paper first
                const paperRes = await fetch(`/api/papers/${taskId}`);
                if (paperRes.ok) {
                    const paperData = await paperRes.json();
                    if (paperData && paperData.questions) {
                        let questionsToShow = paperData.questions;
                        
                        // If questionId is provided, show only that question
                        if (questionId) {
                            const singleQuestion = questionsToShow.find((q: any) => q.id === questionId);
                            if (singleQuestion) {
                                questionsToShow = [singleQuestion];
                                setIsSingleQuestion(true);
                            }
                        }
                        
                        setQuestions(questionsToShow);
                        setLoading(false);
                        return;
                    }
                }
                
                // Fallback to daily task
                const taskRes = await fetch('/api/daily-task');
                const taskData = await taskRes.json();
                if (taskData && taskData.questions) {
                    let questionsToShow = taskData.questions;
                    
                    // If questionId is provided, show only that question
                    if (questionId) {
                        const singleQuestion = questionsToShow.find((q: any) => q.id === questionId);
                        if (singleQuestion) {
                            questionsToShow = [singleQuestion];
                            setIsSingleQuestion(true);
                        }
                    }
                    
                    setQuestions(questionsToShow);
                }
            } catch (error) {
                console.error("Failed to load quiz", error);
            } finally {
                setLoading(false);
            }
        }
        loadQuiz();
    }, [taskId, questionId]);

    const currentQuestion = questions[currentIdx];

    const handleOptionSelect = (idx: number) => {
        if (isSubmitted) return;
        setSelectedOption(idx);
    };

    const handleSubmit = async () => {
        if (selectedOption === null) return;

        setIsSubmitted(true);

        // Client-side check for immediate feedback
        const optionText = JSON.parse(currentQuestion.options)[selectedOption];
        const correct = optionText.startsWith(currentQuestion.answer.split('.')[0]);

        setIsCorrect(correct);

        if (correct) {
            canvasConfetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
            // Play sound effect here
        } else {
            // Vibrate logic if supported
        }

        // Server-side Sync
        try {
            const res = await fetch('/api/quiz/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    questionId: currentQuestion.id,
                    isCorrect: correct
                })
            });
            const data = await res.json();
            if (data.xpGained) {
                setXpGainedTotal(prev => prev + data.xpGained);
            }
            if (data.levelUp) {
                setLevelUp(true);
                // Trigger bigger confetti for level up
                canvasConfetti({ particleCount: 200, spread: 100, startVelocity: 40 });
            }
        } catch (e) {
            console.error("Failed to submit result", e);
        }
    };

    const handleNext = () => {
        if (isSingleQuestion) {
            // For single question mode, go back to home
            window.location.href = "/";
        } else if (currentIdx < questions.length - 1) {
            setCurrentIdx(prev => prev + 1);
            setSelectedOption(null);
            setIsSubmitted(false);
            setIsCorrect(false);
        } else {
            // Finish Quiz
            setIsFinished(true);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-cyan-500 w-10 h-10" />
                    <p className="text-sm text-neutral-500">加载中...</p>
                </div>
            </div>
        );
    }

    // Result Screen
    if (isFinished) {
        return (
            <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <Card className="max-w-md w-full bg-white border border-neutral-200 shadow-xl p-8 text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center border-2 border-amber-400 animate-pulse">
                            <span className="text-4xl">🏆</span>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                            挑战完成!
                        </h2>
                        <p className="text-neutral-500 mt-2">今日任务已击破</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                            <div className="text-neutral-500 text-xs uppercase tracking-wider mb-1">获得经验</div>
                            <div className="text-3xl font-mono font-bold text-emerald-600">+{xpGainedTotal}</div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                            <div className="text-neutral-500 text-xs uppercase tracking-wider mb-1">正确率</div>
                            <div className="text-3xl font-mono font-bold text-blue-600">100%</div>
                        </div>
                    </div>

                    {levelUp && (
                        <div className="bg-amber-50 border border-amber-300 p-3 rounded-lg text-amber-700 font-bold animate-bounce text-sm">
                            ⭐ LEVEL UP! 晋升为 见习技术员 ⭐
                        </div>
                    )}

                    <Button 
                        className="w-full h-12 text-lg font-bold bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white" 
                        onClick={() => window.location.href = "/"}
                    >
                        返回首页
                    </Button>
                </Card>
            </div>
        )
    }

    if (!currentQuestion) return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
            <div className="text-center">
                <p className="text-neutral-600 mb-4">未找到题目</p>
                <Link href="/">
                    <Button variant="outline">返回首页</Button>
                </Link>
            </div>
        </div>
    );

    const options = currentQuestion.options ? JSON.parse(currentQuestion.options) : [];

    return (
        <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Subtle Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 z-0"></div>

            {/* Top Bar */}
            <div className="w-full max-w-3xl z-10 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="text-neutral-600 hover:text-neutral-900">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            返回
                        </Button>
                    </Link>
                    {!isSingleQuestion && (
                        <div className="text-neutral-500 text-sm font-mono">
                            第 {currentIdx + 1} / {questions.length} 题
                        </div>
                    )}
                </div>
                {!isSingleQuestion && (
                    <div className="w-full">
                        <Progress value={((currentIdx + 1) / questions.length) * 100} className="h-2" />
                    </div>
                )}
            </div>

            {/* Main Quiz Card */}
            <div className="w-full max-w-3xl z-10 relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestion.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card className="bg-white border border-neutral-200 shadow-xl p-8 min-h-[500px] flex flex-col">

                            {/* Question Content */}
                            <div className="prose max-w-none mb-8 text-lg">
                                <ReactMarkdown
                                    remarkPlugins={[remarkMath]}
                                    rehypePlugins={[rehypeKatex]}
                                >
                                    {currentQuestion.content}
                                </ReactMarkdown>
                            </div>

                            {/* Options Area */}
                            <div className="space-y-3 flex-1">
                                {options.map((opt: string, idx: number) => (
                                    <div
                                        key={idx}
                                        onClick={() => handleOptionSelect(idx)}
                                        className={`
                                            p-4 rounded-xl border cursor-pointer transition-all duration-200 flex items-center justify-between
                                            ${selectedOption === idx ? 'border-cyan-500 bg-cyan-50 ring-2 ring-cyan-200' : 'border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300'}
                                            ${isSubmitted && idx === selectedOption && isCorrect ? '!bg-emerald-50 !border-emerald-500' : ''}
                                            ${isSubmitted && idx === selectedOption && !isCorrect ? '!bg-red-50 !border-red-500' : ''}
                                        `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                                                selectedOption === idx 
                                                    ? 'border-cyan-500 bg-cyan-500 text-white' 
                                                    : 'border-neutral-300 text-neutral-500 bg-neutral-50'
                                            }`}>
                                                {String.fromCharCode(65 + idx)}
                                            </div>
                                            <span className="font-medium text-neutral-900">
                                                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                                    {opt.substring(2)}
                                                </ReactMarkdown>
                                            </span>
                                        </div>

                                        {isSubmitted && idx === selectedOption && (
                                            isCorrect ? (
                                                <CheckCircle2 className="text-emerald-500 w-5 h-5" />
                                            ) : (
                                                <XCircle className="text-red-500 w-5 h-5" />
                                            )
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Action Bar */}
                            <div className="mt-8 pt-6 border-t border-neutral-200 flex justify-end">
                                {!isSubmitted ? (
                                    <Button
                                        size="lg"
                                        onClick={handleSubmit}
                                        disabled={selectedOption === null}
                                        className="w-full sm:w-auto font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white"
                                    >
                                        提交答案
                                    </Button>
                                ) : (
                                    <div className="flex items-center gap-4 w-full sm:w-auto">
                                        <div className={`flex-1 text-sm font-medium ${isCorrect ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {isCorrect ? "✓ 回答正确！获得 12 XP" : `正确答案: ${currentQuestion.answer}`}
                                        </div>
                                        <Button 
                                            size="lg" 
                                            onClick={handleNext} 
                                            className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white"
                                        >
                                            {isSingleQuestion ? '返回首页' : currentIdx === questions.length - 1 ? '完成' : '下一题'} 
                                            {!isSingleQuestion && <ArrowRight className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                )}
                            </div>

                        </Card>
                    </motion.div>
                </AnimatePresence>
            </div>

        </div>
    );
}
