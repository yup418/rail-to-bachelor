import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function PUT(req: Request) {
    try {
        const userId = await getUserSession();
        if (!userId) {
            return NextResponse.json({ error: "未登录" }, { status: 401 });
        }

        const body = await req.json();
        const { currentPassword, newPassword } = body;

        // 验证输入
        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: "请填写所有字段" }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ error: "新密码长度至少为 6 位" }, { status: 400 });
        }

        // 获取用户当前密码
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { password: true }
        });

        if (!user || !user.password) {
            return NextResponse.json({ error: "用户不存在" }, { status: 404 });
        }

        // 验证当前密码
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return NextResponse.json({ error: "当前密码错误" }, { status: 400 });
        }

        // 加密新密码
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 更新密码
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        return NextResponse.json({ success: true, message: "密码修改成功" });
    } catch (error: any) {
        console.error('Change password error:', error);
        return NextResponse.json({ error: error.message || "密码修改失败" }, { status: 500 });
    }
}
