"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Calculator, FileText, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { GamificationHeader } from "@/features/gamification/Header";

interface ExamPaper {
    id: string;
    title: string;
    year: number;
    subject: string;
    paperType: string;
    _count: {
        questions: number;
    };
}

export default function LibraryPage() {
    const params = useParams();
    const subject = params.subject as string; // 'math' or 'english'
    const type = params.type as string; // 'real' or 'practice'
    
    const [papers, setPapers] = useState<ExamPaper[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/papers')
            .then(res => res.json())
            .then(data => {
                if (data.papers) {
                    let filtered: ExamPaper[] = data.papers;

                    const subjectFilter = subject === 'math' ? 'MATH' : 'ENGLISH';
                    filtered = filtered.filter((p: ExamPaper) => p.subject === subjectFilter);

                    const typeFilter = type === 'real' ? 'REAL' : 'PRACTICE';
                    filtered = filtered.filter((p: ExamPaper) => (p.paperType || 'REAL') === typeFilter);

                    filtered.sort((a: ExamPaper, b: ExamPaper) => (b.year || 0) - (a.year || 0));

                    setPapers(filtered);
                }
            })
            .finally(() => setLoading(false));
    }, [subject, type]);

    const getSubjectInfo = () => {
        if (subject === 'math') {
            return {
                name: '高等数学',
                icon: Calculator,
                color: 'blue',
                bgColor: 'bg-blue-50',
                borderColor: 'border-blue-200',
                textColor: 'text-blue-600',
                iconColor: 'text-blue-500'
            };
        } else {
            return {
                name: '大学英语',
                icon: BookOpen,
                color: 'emerald',
                bgColor: 'bg-emerald-50',
                borderColor: 'border-emerald-200',
                textColor: 'text-emerald-600',
                iconColor: 'text-emerald-500'
            };
        }
    };

    const subjectInfo = getSubjectInfo();
    const Icon = subjectInfo.icon;
    const typeName = type === 'real' ? '真题库' : '练习题库';

    return (
        <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col">
            <GamificationHeader />
            
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <Link href="/">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-xl ${subjectInfo.bgColor} border ${subjectInfo.borderColor}`}>
                                <Icon className={`w-6 h-6 ${subjectInfo.iconColor}`} />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">
                                    {subjectInfo.name} {typeName}
                                </h1>
                                <p className="text-sm text-neutral-600 mt-1">
                                    {type === 'real' ? '历年真题试卷' : '专项练习与模拟题'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Papers Grid */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="flex flex-col items-center gap-4">
                                <Loader2 className="w-10 h-10 animate-spin text-cyan-500" />
                                <p className="text-sm text-neutral-500">加载中...</p>
                            </div>
                        </div>
                    ) : papers.length === 0 ? (
                        <Card className="p-12 text-center">
                            <p className="text-neutral-500 mb-4">暂无试卷</p>
                            <Link href="/">
                                <Button variant="outline">返回首页</Button>
                            </Link>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {papers.map((paper, index) => (
                                <motion.div
                                    key={paper.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                >
                                    <Link href={`/quiz/${paper.id}`}>
                                        <Card className="h-full bg-white border border-neutral-200 hover:border-cyan-400 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                                            <CardHeader>
                                                <div className="flex justify-between items-start mb-2">
                                                    <Badge 
                                                        className={`${subjectInfo.bgColor} ${subjectInfo.textColor} border ${subjectInfo.borderColor}`}
                                                    >
                                                        {paper.subject === 'MATH' ? '高等数学' : '大学英语'}
                                                    </Badge>
                                                    <span className="text-sm font-semibold text-neutral-500">{paper.year}</span>
                                                </div>
                                                <CardTitle className="text-lg leading-snug group-hover:text-cyan-600 transition-colors">
                                                    {paper.title}
                                                </CardTitle>
                                                <CardDescription className="flex items-center gap-2 mt-2">
                                                    <FileText className="w-4 h-4" />
                                                    {paper._count?.questions || 0} 道题
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <Button 
                                                    className="w-full mt-2" 
                                                    variant="outline"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        window.location.href = `/quiz/${paper.id}`;
                                                    }}
                                                >
                                                    <BookOpen className="w-4 h-4 mr-2" />
                                                    开始练习
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

