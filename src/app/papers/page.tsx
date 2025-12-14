"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Calculator, FileText, ScrollText, Filter, Trash2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface Tag {
    id: string;
    name: string;
}

interface ExamPaper {
    id: string;
    title: string;
    year: number;
    subject: string;
    paperType?: string;
    tags?: Tag[];
    _count: {
        questions: number;
    };
}

function PapersContent() {
    const searchParams = useSearchParams();
    const [papers, setPapers] = useState<ExamPaper[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    // 获取 URL 参数
    const subjectFilter = searchParams.get('subject'); // MATH 或 ENGLISH
    const typeFilter = searchParams.get('type'); // REAL 或 PRACTICE

    useEffect(() => {
        // 检查管理员权限
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (data.user?.role === 'ADMIN') {
                    setIsAdmin(true);
                }
            });

        // 加载试卷列表
        fetch('/api/papers')
            .then(res => res.json())
            .then(data => {
                if (data.papers && Array.isArray(data.papers)) {
                    setPapers(data.papers);
                }
            })
            .finally(() => setLoading(false));
    }, []);

    // 删除试卷
    const handleDeletePaper = async (paperId: string, paperTitle: string) => {
        if (!confirm(`确定要删除试卷"${paperTitle}"吗？\n\n此操作将删除试卷及其所有题目，且不可撤销！`)) {
            return;
        }

        try {
            const res = await fetch(`/api/papers/${paperId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                alert('试卷已删除');
                // 重新加载试卷列表
                setPapers(papers.filter(p => p.id !== paperId));
            } else {
                const data = await res.json();
                alert(`删除失败: ${data.error || '未知错误'}`);
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('删除失败，请检查网络连接');
        }
    };

    // 筛选试卷
    const filteredPapers = papers.filter(paper => {
        if (subjectFilter && paper.subject !== subjectFilter) return false;
        if (typeFilter && paper.paperType !== typeFilter) return false;
        return true;
    });

    // 获取页面标题
    const getPageTitle = () => {
        if (subjectFilter && typeFilter) {
            const subjectName = subjectFilter === 'MATH' ? '高等数学' : '大学英语';
            const typeName = typeFilter === 'REAL' ? '真题' : '练习题';
            return `${subjectName}${typeName}库`;
        }
        if (subjectFilter) {
            return subjectFilter === 'MATH' ? '高等数学题库' : '大学英语题库';
        }
        if (typeFilter) {
            return typeFilter === 'REAL' ? '真题库' : '练习题库';
        }
        return '全部试卷';
    };

    // 获取所有试卷的标签（去重）
    const getAllTags = () => {
        const tagSet = new Set<string>();
        filteredPapers.forEach(paper => {
            paper.tags?.forEach(tag => tagSet.add(tag.name));
        });
        return Array.from(tagSet);
    };

    const allTags = getAllTags();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* 头部 */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold">{getPageTitle()}</h1>
                            <p className="text-muted-foreground">共 {filteredPapers.length} 套试卷</p>
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
                                className="relative"
                            >
                                {/* 管理员删除按钮 */}
                                {isAdmin && (
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleDeletePaper(paper.id, paper.title);
                                        }}
                                        className="absolute top-2 right-2 z-10 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
                                        title="删除试卷"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}

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
                                            {/* 标签显示 */}
                                            {paper.tags && paper.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {paper.tags.map((tag) => (
                                                        <Badge key={tag.id} variant="secondary" className="text-xs">
                                                            {tag.name}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
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
        </div>
    );
}

export default function PapersPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">加载中...</div>}>
            <PapersContent />
        </Suspense>
    );
}
