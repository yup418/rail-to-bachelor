import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock, RotateCcw, Play } from "lucide-react";

interface ProgressDialogProps {
    open: boolean;
    onContinue: () => void;
    onRestart: () => void;
    progress: {
        currentIndex: number;
        timeSpent: number;
        totalQuestions: number;
    };
}

export function ProgressDialog({ open, onContinue, onRestart, progress }: ProgressDialogProps) {
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}分${secs}秒`;
    };

    return (
        <Dialog open={open}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-500" />
                        发现未完成的答题
                    </DialogTitle>
                    <DialogDescription>
                        你上次答题还没有完成，是否继续？
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">答题进度</span>
                            <span className="font-medium">
                                {progress.currentIndex + 1} / {progress.totalQuestions}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">已用时间</span>
                            <span className="font-medium">{formatTime(progress.timeSpent)}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 mt-2">
                            <div
                                className="bg-blue-500 h-2 rounded-full transition-all"
                                style={{
                                    width: `${((progress.currentIndex + 1) / progress.totalQuestions) * 100}%`
                                }}
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                        variant="outline"
                        onClick={onRestart}
                        className="w-full sm:w-auto"
                    >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        重新开始
                    </Button>
                    <Button
                        onClick={onContinue}
                        className="w-full sm:w-auto"
                    >
                        <Play className="w-4 h-4 mr-2" />
                        继续答题
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
