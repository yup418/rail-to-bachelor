"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface ExamRecord {
    id: string;
    score: number;
    totalQuestions: number;
    timeSpent: number;
    completedAt: string;
    paper: {
        id: string;
        title: string;
        year: number;
        subject: string;
    };
}

export default function RecordsPage() {
    const [records, setRecords] = useState<ExamRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/exam-records')
            .then(res => res.json())
            .then(data => {
                if (data.records) {
                    setRecords(data.records);
                }
            })
            .finally(() => setLoading(false));
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}分${secs}秒`;
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 md:p-8">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* 头部 */}
                <div className="flex items-center gap-4">
                    <Link href="/">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            返回主页
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">我的答题记录</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            查看你的历史答题记录和成绩
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">加载中...</div>
                ) : records.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <p className="text-muted-foreground">暂无答题记录</p>
                            <Link href="/papers">
                                <Button className="mt-4">开始答题</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {records.map((record, index) => {
                            const passed = record.score >= 60;
                            const correctCount = Math.round((record.score / 100) * record.totalQuestions);

                            return (
                                <motion.div
                                    key={record.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className={`hover:shadow-lg transition-shadow ${passed ? 'border-green-200' : 'border-red-200'
                                        }`}>
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <Badge variant={record.paper.subject === 'MATH' ? 'default' : 'secondary'}>
                                                            {record.paper.subject === 'MATH' ? '高等数学' : '大学英语'}
                                                        </Badge>
                                                        <span className="text-sm text-muted-foreground">
                                                            {record.paper.year}年
                                                        </span>
                                                    </div>
                                                    <h3 className="text-lg font-semibold mb-1">
                                                        {record.paper.title}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        完成时间：{formatDate(record.completedAt)}
                                                    </p>
                                                </div>

                                                <div className="text-right ml-4">
                                                    <div className={`text-4xl font-bold mb-1 ${passed ? 'text-green-600' : 'text-red-600'
                                                        }`}>
                                                        {record.score}
                                                        <span className="text-lg">分</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        {passed ? (
                                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                                        ) : (
                                                            <XCircle className="w-4 h-4 text-red-600" />
                                                        )}
                                                        <span>{passed ? '通过' : '未通过'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-6">
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                                        <span>答对 {correctCount}/{record.totalQuestions} 题</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-4 h-4 text-blue-600" />
                                                        <span>用时 {formatTime(record.timeSpent)}</span>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <Link href={`/records/${record.id}`}>
                                                        <Button variant="default" size="sm">
                                                            查看详情
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/papers/${record.paper.id}`}>
                                                        <Button variant="outline" size="sm">
                                                            再做一次
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
