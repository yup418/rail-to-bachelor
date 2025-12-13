"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Calculator, FileText, ScrollText, Filter } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface ExamPaper {
    id: string;
    title: string;
    year: number;
    subject: string;
    paperType?: string;
    _count: {
        questions: number;
    };
}

function PapersContent() {
    const searchParams = useSearchParams();
    const [papers, setPapers] = useState<ExamPaper[]>([]);
    const [loading, setLoading] = useState(true);

    // 获取 URL 参数
    const subjectFilter = searchParams.get('subject'); // MATH 或 ENGLISH
    const typeFilter = searchParams.get('type'); // REAL 或 PRACTICE

    useEffect(() => {
        fetch('/api/papers')
            .then(res => res.json())
            .then(data => {
                if (data.papers && Array.isArray(data.papers)) {
                    setPapers(data.papers);
                }
            })
            .finally(() => setLoading(false));
    }, []);

    // 筛选试卷
    const filteredPapers = papers.filter(paper => {
        if (subjectFilter && paper.subject !== subjectFilter) return false;
        if (typeFilter && paper.paperType !== typeFilter) return false;
        return true;
    });

    // 获取页面标题
    const getPageTitle = () => {
        if (subjectFilter && typeFilter) {
            const subjectName = subjectFilter === 'MATH' ? '高数' : '英语';
            const typeName = typeFilter === 'REAL' ? '真题库' : '练习题库';
            return `${subjectName}${typeName}`;
        }
        if (subjectFilter) {
            return subjectFilter === 'MATH' ? '高等数学题库' : '大学英语题库';
        }
        if (typeFilter) {
            return typeFilter === 'REAL' ? '真题试卷库' : '练习题库';
        }
        return '全部试卷';
    };

    const getPageDescription = () => {
        if (subjectFilter && typeFilter) {
            const subjectName = subjectFilter === 'MATH' ? '高等数学' : '大学英语';
            const typeName = typeFilter === 'REAL' ? '历年真题' : '专项练习';
            return `${subjectName} · ${typeName} · 2018-2025`;
        }
        return '选择试卷开始练习';
    };

    return (
        <div className="min-h-screen bg-background p-4 md:p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/">
                        <Button variant="ghost" size="icon"><ArrowLeft /></Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <ScrollText className="text-primary" />
                            {getPageTitle()}
                        </h1>
                        <p className="text-muted-foreground">{getPageDescription()}</p>
                    </div>
                </div>

                {/* 筛选标签 */}
                {(subjectFilter || typeFilter) && (
                    <Link href="/papers">
                        <Button variant="outline" size="sm">
                            <Filter className="w-4 h-4 mr-2" />
                            清除筛选
                        </Button>
                    </Link>
                )}
            </div>

            {loading ? <div>Loading papers...</div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPapers.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                            暂无试卷 (No Papers Found)。<br />请联系管理员录入。
                        </div>
                    ) : filteredPapers.map(paper => (
                        <motion.div
                            key={paper.id}
                            whileHover={{ y: -5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <Link href={`/papers/${paper.id}`}>
                                <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <Badge variant={paper.subject === 'MATH' ? 'default' : 'secondary'} className="mb-2">
                                                {paper.subject === 'MATH' ? '高等数学' : '大学英语'}
                                            </Badge>
                                            <div className="flex gap-2">
                                                <Badge variant="outline" className="text-xs">
                                                    {paper.paperType === 'REAL' ? '真题' : '练习'}
                                                </Badge>
                                                <span className="text-sm font-bold text-muted-foreground">{paper.year}</span>
                                            </div>
                                        </div>
                                        <CardTitle className="leading-snug">{paper.title}</CardTitle>
                                        <CardDescription className="flex items-center gap-2 mt-2">
                                            <FileText className="w-4 h-4" /> {paper._count.questions} 道题
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button className="w-full mt-4" variant="outline">
                                            <BookOpen className="w-4 h-4 mr-2" /> 开始整卷训练
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default function PapersPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">加载中...</div>}>
            <PapersContent />
        </Suspense>
    );
}
