"use client";

import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Question {
    id: string;
    content: string;
    type: string;
    options: string | null;
    answer: string;
    explanation: string;
    difficulty: number;
}

interface QuestionEditDialogProps {
    question: Question | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: () => void;
}

export function QuestionEditDialog({ question, open, onOpenChange, onSave }: QuestionEditDialogProps) {
    const [formData, setFormData] = useState<Partial<Question>>({});
    const [saving, setSaving] = useState(false);

    // 当对话框打开时，初始化表单数据
    useEffect(() => {
        if (question && open) {
            setFormData({
                content: question.content,
                type: question.type,
                options: question.options,
                answer: question.answer,
                explanation: question.explanation,
                difficulty: question.difficulty,
            });
        }
    }, [question, open]);

    const handleSave = async () => {
        if (!question) return;

        setSaving(true);
        try {
            // 验证和解析选项
            let options = null;
            if (formData.options) {
                try {
                    options = JSON.parse(formData.options);
                } catch (e) {
                    toast.error('选项 JSON 格式错误，请检查格式');
                    setSaving(false);
                    return;
                }
            }

            console.log('保存题目数据:', {
                content: formData.content,
                options,
                answer: formData.answer,
                explanation: formData.explanation,
                type: formData.type,
                difficulty: formData.difficulty,
            });

            const res = await fetch(`/api/questions/${question.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: formData.content,
                    options,
                    answer: formData.answer,
                    explanation: formData.explanation,
                    type: formData.type,
                    difficulty: formData.difficulty,
                }),
            });

            const data = await res.json();
            console.log('API 响应:', data);

            if (res.ok) {
                toast.success('题目更新成功！');
                onSave();
                onOpenChange(false);
            } else {
                const errorMsg = data.details
                    ? `${data.error}\n详情: ${data.details}`
                    : (data.error || '未知错误');
                toast.error('更新失败:\n' + errorMsg);
                console.error('API 错误详情:', data);
            }
        } catch (e) {
            console.error('保存出错:', e);
            toast.error('更新出错: ' + (e instanceof Error ? e.message : '未知错误'));
        } finally {
            setSaving(false);
        }
    };

    if (!question) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>编辑题目</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* 题目内容 */}
                    <div className="space-y-2">
                        <Label htmlFor="content">题目内容</Label>
                        <Textarea
                            id="content"
                            value={formData.content || ''}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            rows={4}
                            className="font-mono text-sm"
                        />
                    </div>

                    {/* 题目类型 */}
                    <div className="space-y-2">
                        <Label htmlFor="type">题目类型</Label>
                        <Select
                            value={formData.type || 'CHOICE'}
                            onValueChange={(value) => setFormData({ ...formData, type: value })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="CHOICE">选择题</SelectItem>
                                <SelectItem value="BLANK">填空题</SelectItem>
                                <SelectItem value="ESSAY">问答题</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* 选项（仅选择题） */}
                    {formData.type === 'CHOICE' && (
                        <div className="space-y-2">
                            <Label htmlFor="options">选项（JSON 格式）</Label>
                            <Textarea
                                id="options"
                                value={formData.options || ''}
                                onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                                rows={6}
                                className="font-mono text-xs"
                                placeholder='["A. 选项A", "B. 选项B", "C. 选项C", "D. 选项D"]'
                            />
                            <p className="text-xs text-muted-foreground">
                                当前选项预览：
                            </p>
                            <div className="space-y-1 text-sm">
                                {(() => {
                                    try {
                                        const previewOpts = formData.options ? JSON.parse(formData.options) as string[] : [];
                                        return previewOpts.map((opt, i) => (
                                            <div key={i} className="p-2 bg-muted rounded">{opt}</div>
                                        ));
                                    } catch (e) {
                                        return <div className="text-red-500 text-xs">JSON 格式错误</div>;
                                    }
                                })()}
                            </div>
                        </div>
                    )}

                    {/* 答案 */}
                    <div className="space-y-2">
                        <Label htmlFor="answer">正确答案</Label>
                        <Input
                            id="answer"
                            value={formData.answer || ''}
                            onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                            placeholder="例如: A 或 B"
                        />
                    </div>

                    {/* 解析 */}
                    <div className="space-y-2">
                        <Label htmlFor="explanation">解析</Label>
                        <Textarea
                            id="explanation"
                            value={formData.explanation || ''}
                            onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                            rows={6}
                            className="font-mono text-sm"
                        />
                    </div>

                    {/* 难度 */}
                    <div className="space-y-2">
                        <Label htmlFor="difficulty">难度（1-5）</Label>
                        <Select
                            value={formData.difficulty?.toString() || '3'}
                            onValueChange={(value) => setFormData({ ...formData, difficulty: parseInt(value) })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">1 - 非常简单</SelectItem>
                                <SelectItem value="2">2 - 简单</SelectItem>
                                <SelectItem value="3">3 - 中等</SelectItem>
                                <SelectItem value="4">4 - 困难</SelectItem>
                                <SelectItem value="5">5 - 非常困难</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        取消
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? '保存中...' : '保存修改'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
