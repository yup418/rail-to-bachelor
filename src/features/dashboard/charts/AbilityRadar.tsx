"use client";

import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AbilityRadar() {
    const [mathData, setMathData] = useState<any[]>([]);
    const [englishData, setEnglishData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch('/api/stats');
                const json = await res.json();
                if (json.mathRadar) setMathData(json.mathRadar);
                if (json.englishRadar) setEnglishData(json.englishRadar);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    if (loading) return <div className="h-[250px] flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

    const defaultMath = [
        { subject: '函数极限', A: 50, fullMark: 100 },
        { subject: '导数微分', A: 30, fullMark: 100 },
        { subject: '积分', A: 20, fullMark: 100 },
    ];
    const defaultEng = [
        { subject: '英语语法', A: 65, fullMark: 100 },
        { subject: '英语词汇', A: 40, fullMark: 100 },
        { subject: '阅读理解', A: 30, fullMark: 100 },
    ];

    const finalMath = mathData.length > 0 ? mathData : defaultMath;
    const finalEng = englishData.length > 0 ? englishData : defaultEng;

    return (
        <div className="w-full mt-2">
            <Tabs defaultValue="math" className="w-full">
                <div className="px-4 pb-4">
                    <TabsList className="grid w-full grid-cols-2 bg-neutral-100 border border-neutral-200 p-1 rounded-lg">
                        <TabsTrigger 
                            value="math" 
                            className="data-[state=active]:bg-cyan-50 data-[state=active]:text-cyan-600 data-[state=active]:border data-[state=active]:border-cyan-300 rounded-md transition-all duration-200 text-xs"
                        >
                            高等数学
                        </TabsTrigger>
                        <TabsTrigger 
                            value="english"
                            className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-600 data-[state=active]:border data-[state=active]:border-emerald-300 rounded-md transition-all duration-200 text-xs"
                        >
                            大学英语
                        </TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value="math" className="h-[250px] w-full px-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={finalMath}>
                            <PolarGrid stroke="rgba(0,0,0,0.1)" strokeWidth={1} />
                            <PolarAngleAxis 
                                dataKey="subject" 
                                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }} 
                            />
                            <Radar
                                name="Math Ability"
                                dataKey="A"
                                stroke="#06b6d4"
                                strokeWidth={2}
                                fill="#06b6d4"
                                fillOpacity={0.2}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </TabsContent>
                <TabsContent value="english" className="h-[250px] w-full px-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={finalEng}>
                            <PolarGrid stroke="rgba(0,0,0,0.1)" strokeWidth={1} />
                            <PolarAngleAxis 
                                dataKey="subject" 
                                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }} 
                            />
                            <Radar
                                name="English Ability"
                                dataKey="A"
                                stroke="#10b981"
                                strokeWidth={2}
                                fill="#10b981"
                                fillOpacity={0.2}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </TabsContent>
            </Tabs>
        </div>
    );
}
