"use client";

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Flame, Star, LogIn, LogOut } from "lucide-react"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface User {
    id: string;
    username: string;
    level: number;
    xp: number;
    streak: number;
    avatarUrl?: string | null;
}

interface TimeRemaining {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

export function GamificationHeader() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    // 2026年陕西专升本考试时间（根据往年4月中旬，预测为2026年4月18日上午9:00）
    const examDate = new Date('2026-04-18T09:00:00');

    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (data.user) {
                    setUser(data.user);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    // 倒计时更新
    useEffect(() => {
        const updateCountdown = () => {
            const now = new Date();
            const diff = examDate.getTime() - now.getTime();

            if (diff > 0) {
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                setTimeRemaining({ days, hours, minutes, seconds });
            } else {
                setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        };

        updateCountdown();
        const timer = setInterval(updateCountdown, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            setUser(null);
            router.push('/login');
            router.refresh();
        } catch (err) {
            console.error('Logout error:', err);
        }
    };

    const getLevelName = (level: number) => {
        const names = ['搬砖工', '见习技术员', '初级工程师', '中级工程师', '高级工程师', '资深工程师', '技术专家', '技术总监', '总工程师', '技术大师'];
        return names[Math.min(level - 1, names.length - 1)] || '搬砖工';
    };

    const currentLevelXp = user ? (user.xp % 100) : 0;
    const nextLevelXp = 100;
    const xpProgress = user ? (currentLevelXp / nextLevelXp) * 100 : 0;

    if (loading) {
        return (
            <div className="relative flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 border-b border-neutral-200 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="text-sm text-neutral-500">加载中...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="relative flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 border-b border-neutral-200 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="text-sm font-semibold text-neutral-900">专升本学习平台</div>
                <Link href="/login">
                    <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white">
                        <LogIn className="w-4 h-4 mr-2" />
                        登录
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="relative flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 border-b border-neutral-200 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
            <div className="relative flex items-center gap-4 sm:gap-6">
                <Link href="/profile" className="relative group cursor-pointer">
                    <Avatar className="relative h-9 w-9 sm:h-10 sm:w-10 border border-cyan-500/30 hover:border-cyan-500 transition-colors">
                        {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.username} />}
                        <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white font-semibold text-sm">
                            {user.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 bg-gradient-to-br from-amber-400 to-orange-500 text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white border border-white shadow-sm">
                        Lv.{user.level}
                    </div>
                    {/* 悬停提示 */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        个人中心
                    </div>
                </Link>

                <div className="hidden sm:block">
                    <h2 className="font-semibold text-sm text-neutral-900 mb-1">{getLevelName(user.level)}</h2>
                    <div className="w-24 sm:w-28">
                        <div className="relative h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${xpProgress}%` }}
                                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                            />
                        </div>
                        <p className="text-[9px] text-neutral-500 mt-1 text-right font-mono">{currentLevelXp}/{nextLevelXp}</p>
                    </div>
                </div>
            </div>

            <div className="relative flex items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-2 group cursor-help" title="连续打卡天数">
                    <div className="p-1.5 rounded-lg bg-orange-50 border border-orange-200 group-hover:scale-110 transition-transform">
                        <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                    </div>
                    <span className="text-xs font-mono font-semibold text-orange-600">{user.streak}</span>
                </div>

                <div className="flex items-center gap-2 group">
                    <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-200 group-hover:scale-110 transition-transform">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    </div>
                    <span className="text-xs font-mono font-semibold text-amber-600">{user.xp}</span>
                </div>

                <div className="hidden md:block h-6 w-px bg-neutral-200"></div>

                {/* 优化的倒计时显示 */}
                <div className="hidden md:block">
                    <div className="text-[11px] text-neutral-500 mb-1 text-center font-medium">
                        距离 2026 陕西专升本
                    </div>
                    <div className="flex items-center gap-2">
                        {/* 天数 */}
                        <div className="text-center">
                            <div className="text-2xl font-black font-mono tracking-tight bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                                {timeRemaining.days}
                            </div>
                            <div className="text-[9px] text-neutral-400 font-medium">天</div>
                        </div>

                        <div className="text-neutral-300 text-xl font-bold">:</div>

                        {/* 小时 */}
                        <div className="text-center">
                            <div className="text-xl font-bold font-mono text-neutral-700">
                                {String(timeRemaining.hours).padStart(2, '0')}
                            </div>
                            <div className="text-[9px] text-neutral-400 font-medium">时</div>
                        </div>

                        <div className="text-neutral-300 text-xl font-bold">:</div>

                        {/* 分钟 */}
                        <div className="text-center">
                            <div className="text-xl font-bold font-mono text-neutral-700">
                                {String(timeRemaining.minutes).padStart(2, '0')}
                            </div>
                            <div className="text-[9px] text-neutral-400 font-medium">分</div>
                        </div>

                        <div className="text-neutral-300 text-xl font-bold">:</div>

                        {/* 秒 */}
                        <div className="text-center">
                            <div className="text-xl font-bold font-mono text-red-500">
                                {String(timeRemaining.seconds).padStart(2, '0')}
                            </div>
                            <div className="text-[9px] text-neutral-400 font-medium">秒</div>
                        </div>
                    </div>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 overflow-hidden hover:bg-neutral-100 transition-colors">
                            <Avatar className="h-9 w-9 border border-neutral-200">
                                {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.username} />}
                                <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white font-semibold text-xs">
                                    {user.username.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user.username}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    Lv.{user.level} · {getLevelName(user.level)}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push('/profile')} className="cursor-pointer">
                            <div className="flex items-center">
                                <span className="mr-2">👤</span>
                                个人中心
                            </div>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
                            <div className="flex items-center">
                                <LogOut className="mr-2 h-4 w-4" />
                                退出登录
                            </div>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}
