"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Mail, Lock, Camera, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface UserProfile {
    id: string;
    username: string;
    email: string | null;
    role: string;
    avatarUrl: string | null;
    createdAt: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<UserProfile | null>(null);

    // 表单状态
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [avatar, setAvatar] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        try {
            const res = await fetch('/api/auth/me');
            const data = await res.json();

            if (data.user) {
                setUser(data.user);
                setUsername(data.user.username);
                setEmail(data.user.email || "");
                setAvatar(data.user.avatarUrl || "");
            } else {
                router.push('/login');
            }
        } catch (error) {
            console.error('Load profile error:', error);
            setError('加载用户信息失败');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        setMessage("");
        setError("");
        setSaving(true);

        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    email: email || null,
                    avatar: avatar || null,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage('个人信息更新成功！');
                setUser(data.user);
            } else {
                setError(data.error || '更新失败');
            }
        } catch (error) {
            console.error('Update error:', error);
            setError('更新失败，请检查网络连接');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        setMessage("");
        setError("");

        if (!currentPassword || !newPassword || !confirmPassword) {
            setError('请填写所有密码字段');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('两次输入的新密码不一致');
            return;
        }

        if (newPassword.length < 6) {
            setError('新密码长度至少为 6 位');
            return;
        }

        setSaving(true);

        try {
            const res = await fetch('/api/user/password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage('密码修改成功！');
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                setError(data.error || '密码修改失败');
            }
        } catch (error) {
            console.error('Change password error:', error);
            setError('密码修改失败，请检查网络连接');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" text="加载个人信息中..." />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* 头部 */}
                <div className="flex items-center gap-4">
                    <Link href="/">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">个人中心</h1>
                        <p className="text-muted-foreground">管理您的个人信息和账户设置</p>
                    </div>
                </div>

                {/* 消息提示 */}
                {message && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                        {message}
                    </div>
                )}
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {error}
                    </div>
                )}

                {/* 用户信息卡片 */}
                <Card>
                    <CardHeader>
                        <CardTitle>基本信息</CardTitle>
                        <CardDescription>更新您的个人资料</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* 头像 */}
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                                    {avatar ? (
                                        <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        username.charAt(0).toUpperCase()
                                    )}
                                </div>
                            </div>
                            <div className="flex-1 space-y-2">
                                <Label htmlFor="avatar">头像 URL</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="avatar"
                                        placeholder="https://example.com/avatar.jpg"
                                        value={avatar}
                                        onChange={(e) => setAvatar(e.target.value)}
                                    />
                                    <Button variant="outline" size="icon">
                                        <Camera className="w-4 h-4" />
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    输入图片 URL 或点击相机图标上传
                                </p>
                            </div>
                        </div>

                        {/* 用户名 */}
                        <div className="space-y-2">
                            <Label htmlFor="username">用户名</Label>
                            <Input
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="请输入用户名"
                            />
                        </div>

                        {/* 邮箱 */}
                        <div className="space-y-2">
                            <Label htmlFor="email">邮箱（可选）</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                            />
                        </div>

                        {/* 角色和注册时间 */}
                        <div className="flex gap-4 pt-4 border-t">
                            <div>
                                <Label className="text-muted-foreground">角色</Label>
                                <div className="mt-1">
                                    <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                                        {user.role === 'ADMIN' ? '管理员' : '普通用户'}
                                    </Badge>
                                </div>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">注册时间</Label>
                                <div className="mt-1 text-sm">
                                    {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                                </div>
                            </div>
                        </div>

                        {/* 保存按钮 */}
                        <Button
                            onClick={handleUpdateProfile}
                            disabled={saving}
                            className="w-full"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {saving ? '保存中...' : '保存更改'}
                        </Button>
                    </CardContent>
                </Card>

                {/* 修改密码卡片 */}
                <Card>
                    <CardHeader>
                        <CardTitle>修改密码</CardTitle>
                        <CardDescription>更新您的登录密码</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="currentPassword">当前密码</Label>
                            <Input
                                id="currentPassword"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="请输入当前密码"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="newPassword">新密码</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="请输入新密码（至少6位）"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">确认新密码</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="再次输入新密码"
                            />
                        </div>

                        <Button
                            onClick={handleChangePassword}
                            disabled={saving}
                            variant="outline"
                            className="w-full"
                        >
                            <Lock className="w-4 h-4 mr-2" />
                            {saving ? '修改中...' : '修改密码'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
