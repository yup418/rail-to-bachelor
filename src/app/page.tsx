"use client";

import { GamificationHeader } from "@/features/gamification/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, AlertCircle, FileUp, Sparkles, BarChart3, Clock, Menu, X, Calculator, BookOpen, GraduationCap, BookMarked, ChevronRight, Target, CheckCircle } from "lucide-react";
import { AbilityRadar } from "@/features/dashboard/charts/AbilityRadar";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [stats, setStats] = useState({ accuracy: 0, todayCount: 0, weakestTag: "暂无数据" });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        if (data.stats) {
          setStats(data.stats);
        }
      })
      .catch(err => console.error(err));

    // Check admin status
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        setIsAdmin(data.user?.role === 'ADMIN');
      })
      .catch(() => setIsAdmin(false));
  }, []);

  // Sidebar Content Component
  const SidebarContent = () => (
    <>
      {/* Stats Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider px-2">学习数据</h3>
        <div className="space-y-2">
          <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
            <div className="text-xs text-neutral-500 mb-1">平均正确率</div>
            <div className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
              {stats.accuracy}%
            </div>
          </div>
          <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
            <div className="text-xs text-neutral-500 mb-1">今日刷题</div>
            <div className="text-2xl font-bold text-neutral-900">{stats.todayCount}</div>
          </div>
          <div className="p-3 rounded-lg bg-red-50 border border-red-200">
            <div className="text-xs text-neutral-500 mb-1">薄弱环节</div>
            <div className="text-sm font-medium text-red-600">{stats.weakestTag}</div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="space-y-3 pt-4 border-t border-neutral-200">
        <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider px-2">快捷入口</h3>
        <nav className="space-y-1">
          <Link href="/mistakes" onClick={() => setMobileMenuOpen(false)}>
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer group">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <div className="flex-1">
                <div className="text-sm font-medium text-neutral-900 group-hover:text-red-600 transition-colors">错题集</div>
                <div className="text-xs text-neutral-500">3 个待复习</div>
              </div>
            </div>
          </Link>
          <Link href="/review" onClick={() => setMobileMenuOpen(false)}>
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer group">
              <Clock className="w-4 h-4 text-purple-500" />
              <div className="flex-1">
                <div className="text-sm font-medium text-neutral-900 group-hover:text-purple-600 transition-colors">复习</div>
                <div className="text-xs text-neutral-500">记忆修复</div>
              </div>
            </div>
          </Link>
          <Link href="/records" onClick={() => setMobileMenuOpen(false)}>
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer group">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <div className="flex-1">
                <div className="text-sm font-medium text-neutral-900 group-hover:text-green-600 transition-colors">答题记录</div>
                <div className="text-xs text-neutral-500">查看历史</div>
              </div>
            </div>
          </Link>
        </nav>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col">
      <GamificationHeader />

      {/* Mobile Menu Button */}
      <div className="lg:hidden border-b border-neutral-200 bg-white px-4 py-2">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex items-center gap-2 text-neutral-700 hover:text-neutral-900"
        >
          <Menu className="w-5 h-5" />
          <span className="text-sm font-medium">菜单</span>
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-neutral-200 z-50 lg:hidden overflow-y-auto"
            >
              <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
                <span className="font-semibold text-neutral-900">导航菜单</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg hover:bg-neutral-100"
                >
                  <X className="w-5 h-5 text-neutral-600" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <SidebarContent />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Layout - LeetCode Style */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR - Fixed Navigation */}
        <aside className="hidden lg:flex flex-col w-64 border-r border-neutral-200 bg-white shrink-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <SidebarContent />
            </motion.div>
          </div>
        </aside>

        {/* CENTER - Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-neutral-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
            {/* Page Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-8"
            >
              <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-2">
                题库中心
              </h1>
              <p className="text-sm text-neutral-600">
                选择题库开始练习，提升你的考试能力
              </p>
            </motion.div>

            {/* Four Library Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 高数真题库 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <Link href="/papers?subject=MATH&type=REAL">
                  <Card className="h-full bg-white border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 group-hover:scale-110 transition-transform">
                          <Calculator className="w-6 h-6 text-blue-600" />
                        </div>
                        <Badge className="bg-blue-100 text-blue-700 border-blue-300">真题</Badge>
                      </div>
                      <CardTitle className="text-xl font-bold text-neutral-900">高数真题库</CardTitle>
                      <p className="text-sm text-neutral-500 mt-1">历年专升本高等数学真题试卷</p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-neutral-600">
                        <span>2018-2025 年真题</span>
                        <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>

              {/* 高数练习题库 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <Link href="/papers?subject=MATH&type=PRACTICE">
                  <Card className="h-full bg-white border-2 border-cyan-200 hover:border-cyan-400 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-200 group-hover:scale-110 transition-transform">
                          <BookMarked className="w-6 h-6 text-cyan-600" />
                        </div>
                        <Badge className="bg-cyan-100 text-cyan-700 border-cyan-300">练习</Badge>
                      </div>
                      <CardTitle className="text-xl font-bold text-neutral-900">高数练习题库</CardTitle>
                      <p className="text-sm text-neutral-500 mt-1">高等数学专项练习与模拟题</p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-neutral-600">
                        <span>分类练习题目</span>
                        <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-cyan-600 transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>

              {/* 英语真题库 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <Link href="/papers?subject=ENGLISH&type=REAL">
                  <Card className="h-full bg-white border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 group-hover:scale-110 transition-transform">
                          <BookOpen className="w-6 h-6 text-emerald-600" />
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">真题</Badge>
                      </div>
                      <CardTitle className="text-xl font-bold text-neutral-900">英语真题库</CardTitle>
                      <p className="text-sm text-neutral-500 mt-1">历年专升本大学英语真题试卷</p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-neutral-600">
                        <span>2018-2025 年真题</span>
                        <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-emerald-600 transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>

              {/* 英语练习题库 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <Link href="/papers?subject=ENGLISH&type=PRACTICE">
                  <Card className="h-full bg-white border-2 border-teal-200 hover:border-teal-400 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 group-hover:scale-110 transition-transform">
                          <GraduationCap className="w-6 h-6 text-teal-600" />
                        </div>
                        <Badge className="bg-teal-100 text-teal-700 border-teal-300">练习</Badge>
                      </div>
                      <CardTitle className="text-xl font-bold text-neutral-900">英语练习题库</CardTitle>
                      <p className="text-sm text-neutral-500 mt-1">大学英语专项练习与模拟题</p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-neutral-600">
                        <span>分类练习题目</span>
                        <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-teal-600 transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            </div>
          </div>
        </main>

        {/* RIGHT SIDEBAR - Info Panel */}
        <aside className="hidden xl:flex flex-col w-80 border-l border-neutral-200 bg-white shrink-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Ability Radar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-neutral-700 flex items-center gap-2 mb-3">
                  <BarChart3 className="w-4 h-4 text-cyan-500" />
                  能力分析
                </h3>
                <Card className="bg-white border border-neutral-200 shadow-sm">
                  <CardContent className="p-0">
                    <AbilityRadar />
                  </CardContent>
                </Card>
              </div>
            </motion.div>

            {/* Daily Quote */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs font-semibold text-cyan-600 flex items-center justify-center gap-2">
                    <Sparkles className="w-3 h-3" />
                    每日一句
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-center text-sm text-neutral-700 leading-relaxed italic">
                    "专升本不是终点，而是你精彩人生的新起点。"
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </aside>
      </div>
    </div>
  );
}
