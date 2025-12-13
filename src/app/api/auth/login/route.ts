import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { setUserSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: '邮箱/用户名和密码不能为空' },
        { status: 400 }
      );
    }

    // Find user by email or username
    let user = null;

    // Try to find by email if it looks like an email
    if (email.includes('@')) {
      user = await prisma.user.findUnique({
        where: { email },
      });
    }

    // If not found or not an email, try username
    if (!user) {
      user = await prisma.user.findFirst({
        where: { username: email },
      });
    }

    // Debug logging
    console.log('Login attempt:', {
      input: email,
      userFound: !!user,
      userId: user?.id,
      username: user?.username,
      userEmail: user?.email,
      hasPassword: !!user?.password
    });

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 401 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        { error: '该账户未设置密码，请联系管理员' },
        { status: 401 }
      );
    }

    // 使用 bcrypt 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log('Password verification failed');
      return NextResponse.json(
        { error: '密码错误' },
        { status: 401 }
      );
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Set session
    await setUserSession(user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        level: user.level,
        xp: user.xp,
        streak: user.streak,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: '登录失败，请稍后重试' },
      { status: 500 }
    );
  }
}

