import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";

export async function PUT(req: Request) {
    try {
        const userId = await getUserSession();
        if (!userId) {
            return NextResponse.json({ error: "未登录" }, { status: 401 });
        }

        const body = await req.json();
        const { username, email, avatar } = body;

        // 验证用户名
        if (!username || username.trim().length === 0) {
            return NextResponse.json({ error: "用户名不能为空" }, { status: 400 });
        }

        // 检查用户名是否已被其他用户使用
        const existingUser = await prisma.user.findFirst({
            where: {
                username,
                NOT: {
                    id: userId
                }
            }
        });

        if (existingUser) {
            return NextResponse.json({ error: "用户名已被使用" }, { status: 400 });
        }

        // 更新用户信息
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                username: username.trim(),
                email: email?.trim() || null,
                avatarUrl: avatar?.trim() || null,
            },
            select: {
                id: true,
                username: true,
                email: true,
                avatarUrl: true,
                role: true,
                createdAt: true,
            }
        });

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error: any) {
        console.error('Update profile error:', error);
        return NextResponse.json({ error: error.message || "更新失败" }, { status: 500 });
    }
}
