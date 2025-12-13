"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BrainCircuit, Clock, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface ReviewItem {
    id: string; // progress id
    question: {
        id: string;
        content: string;
        type: string;
        tags: { name: string }[];
    };
    streak: number;
    nextReviewDate: string;
}

interface Stats {
    totalLearned: number;
    dueCount: number;
    masterCount: number;
}

export default function ReviewPage() {
    const [reviews, setReviews] = useState<ReviewItem[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchReviews() {
            try {
                const res = await fetch('/api/review/due');
                const data = await res.json();
                setReviews(data.reviews);
                setStats(data.stats);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchReviews();
    }, []);

    if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-foreground">Loading memories...</div>;

    return (
        <div className="min-h-screen bg-background text-foreground dot-pattern p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/">
                        <Button variant="ghost" size="icon"><ArrowLeft /></Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <BrainCircuit className="text-pink-500" />
                            记忆修复中心
                        </h1>
                        <p className="text-muted-foreground">Smart Review System • Ebbinghaus Algorithm</p>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-gradient-to-br from-pink-500/10 to-transparent border-pink-500/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-pink-500 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" /> 待复习
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats?.dueCount || 0}</div>
                            <p className="text-xs text-muted-foreground">Questions decaying from memory</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">已掌握 (Mastered)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats?.masterCount || 0}</div>
                            <p className="text-xs text-muted-foreground">Streak {'>'}= 3</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">累计学习</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats?.totalLearned || 0}</div>
                            <p className="text-xs text-muted-foreground">Total unique questions</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Review List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Clock className="w-5 h-5 text-muted-foreground" />
                        修复队列
                    </h2>

                    {reviews.length === 0 ? (
                        <Card className="p-8 text-center border-dashed">
                            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                            <h3 className="text-lg font-bold">记忆状态完美</h3>
                            <p className="text-muted-foreground">暂无到期题目，去首页挑战新题吧！</p>
                            <Link href="/">
                                <Button className="mt-4" variant="outline">返回首页</Button>
                            </Link>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {reviews.map((item) => (
                                <Card key={item.id} className="hover:border-primary/50 transition-colors">
                                    <div className="p-4 flex items-center gap-4">
                                        <div className={`
                                            w-2 h-12 rounded-full 
                                            ${item.streak === 0 ? 'bg-red-500' : item.streak < 3 ? 'bg-yellow-500' : 'bg-green-500'}
                                        `}></div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="secondary" className="text-xs">
                                                    {item.question.tags[0]?.name || "General"}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    上次复习: {new Date(item.nextReviewDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="font-medium truncate pr-4 text-sm md:text-base">
                                                {item.question.content}
                                            </p>
                                        </div>

                                        <Link href={`/quiz/${item.question.id}?fromReview=true`}>
                                            {/* Note: In real implementation, we handle review quiz differently (update progress) 
                                                For now we reuse the quiz page but logic needs adaptation to handle single question review.
                                            */}
                                            <Button size="sm">复习</Button>
                                        </Link>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

            </div>
            <style jsx global>{`
                .dot-pattern {
                    background-image: radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px);
                    background-size: 24px 24px;
                }
            `}</style>
        </div>
    )
}
