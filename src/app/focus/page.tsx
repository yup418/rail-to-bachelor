"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Volume2, VolumeX, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Slider } from "@/components/ui/slider";

export default function FocusPage() {
    // 25 minutes default
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(false);
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

    // Initial Timer Setup
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(time => time - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            // Play notification sound
            if (soundEnabled) {
                // In real app play ding
            }
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, timeLeft, soundEnabled]);

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(25 * 60);
    };

    const toggleSound = () => {
        setSoundEnabled(!soundEnabled);
        // In a real app, this would play/pause a looped white noise track
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-1000">
            {/* Dynamic Background based on timer state */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${isActive ? 'opacity-30' : 'opacity-10'}`}>
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/40 to-black"></div>
            </div>

            <div className="z-10 w-full max-w-md p-8 text-center space-y-12">

                <div className="flex justify-between items-center text-zinc-400">
                    <Link href="/">
                        <Button variant="ghost" size="icon" className="hover:text-white"><ArrowLeft /></Button>
                    </Link>
                    <span className="text-sm font-mono tracking-widest uppercase">Deep Focus Mode</span>
                    <div className="w-10"></div> {/* Spacer */}
                </div>

                {/* Clock Visualization */}
                <div className="relative w-72 h-72 mx-auto flex items-center justify-center">
                    {/* Background Ring */}
                    <div className="absolute inset-0 rounded-full border-4 border-zinc-800"></div>

                    {/* Progress Ring (SVG) */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle
                            cx="144"
                            cy="144"
                            r="138"
                            fill="none"
                            stroke={isActive ? "#6366f1" : "#3f3f46"}
                            strokeWidth="4"
                            strokeDasharray="870" // 2 * PI * 138
                            strokeDashoffset={870 - (870 * timeLeft) / (25 * 60)}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-linear"
                        />
                    </svg>

                    {/* Time Text */}
                    <div className="font-mono text-6xl font-bold tracking-tighter">
                        {formatTime(timeLeft)}
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-6">
                    <Button
                        size="lg"
                        variant="outline"
                        className={`w-16 h-16 rounded-full border-2 ${isActive ? 'border-yellow-500 text-yellow-500 hover:bg-yellow-500/10' : 'border-green-500 text-green-500 hover:bg-green-500/10'}`}
                        onClick={toggleTimer}
                    >
                        {isActive ? <Pause className="fill-current" /> : <Play className="fill-current ml-1" />}
                    </Button>

                    <Button
                        size="icon"
                        variant="ghost"
                        className="text-zinc-500 hover:text-white"
                        onClick={resetTimer}
                    >
                        <RotateCcw />
                    </Button>
                </div>

                {/* Ambience Controls */}
                <div className="bg-zinc-900/50 rounded-2xl p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <Button variant="ghost" size="icon" onClick={toggleSound}>
                            {soundEnabled ? <Volume2 className="text-indigo-400" /> : <VolumeX />}
                        </Button>
                        <span>Rainy Mood</span>
                    </div>
                    <Slider className="w-24" defaultValue={[50]} max={100} step={1} disabled={!soundEnabled} />
                </div>

            </div>
        </div>
    )
}
