import { motion } from "framer-motion";

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg";
    text?: string;
}

export function LoadingSpinner({ size = "md", text = "加载中..." }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: "w-8 h-8",
        md: "w-12 h-12",
        lg: "w-16 h-16"
    };

    const dotSize = {
        sm: "w-2 h-2",
        md: "w-3 h-3",
        lg: "w-4 h-4"
    };

    return (
        <div className="flex flex-col items-center justify-center gap-4 py-12">
            {/* 旋转的圆环 */}
            <div className="relative">
                <motion.div
                    className={`${sizeClasses[size]} rounded-full border-4 border-primary/20`}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                    className={`${sizeClasses[size]} rounded-full border-4 border-transparent border-t-primary absolute top-0 left-0`}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
            </div>

            {/* 跳动的文字 */}
            {text && (
                <div className="flex items-center gap-1 text-muted-foreground">
                    {text.split('').map((char, index) => (
                        <motion.span
                            key={index}
                            animate={{
                                y: [0, -8, 0],
                            }}
                            transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                delay: index * 0.1,
                            }}
                        >
                            {char}
                        </motion.span>
                    ))}
                </div>
            )}
        </div>
    );
}

// 简单的点点点加载动画
export function LoadingDots() {
    return (
        <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className="w-2 h-2 bg-primary rounded-full"
                    animate={{
                        scale: [1, 1.5, 1],
                        opacity: [1, 0.5, 1],
                    }}
                    transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: i * 0.2,
                    }}
                />
            ))}
        </div>
    );
}

// 骨架屏加载
export function SkeletonCard() {
    return (
        <div className="border rounded-lg p-6 space-y-4 animate-pulse">
            <div className="flex justify-between items-start">
                <div className="h-6 bg-gray-200 rounded w-24"></div>
                <div className="flex gap-2">
                    <div className="h-5 bg-gray-200 rounded w-16"></div>
                    <div className="h-5 bg-gray-200 rounded w-12"></div>
                </div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="flex gap-2">
                <div className="h-6 bg-gray-200 rounded w-16"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
    );
}
