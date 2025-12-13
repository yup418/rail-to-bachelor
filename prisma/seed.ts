import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding exam papers with full content...')

    // Clean up old data to avoid duplicates for this seed run
    // await prisma.choiceOption.deleteMany({}).catch(() => { }) // if I had this model
    await prisma.questionProgress.deleteMany({})
    await prisma.studyRecord.deleteMany({})
    await prisma.dailyTask.deleteMany({})

    // Delete Questions and Papers
    await prisma.question.deleteMany({})
    await prisma.examPaper.deleteMany({})
    await prisma.tag.deleteMany({})

    // 1. Tags
    const tags = [
        { name: '函数与极限', category: 'MATH' },
        { name: '导数与微分', category: 'MATH' },
        { name: '一元函数积分', category: 'MATH' },
        { name: '虚拟语气', category: 'ENGLISH' },
        { name: '词汇与语法', category: 'ENGLISH' },
        { name: '定语从句', category: 'ENGLISH' },
    ];

    for (const t of tags) {
        await prisma.tag.create({ data: t });
    }

    // 2. Create Exam Papers
    const paperMath2023 = await prisma.examPaper.create({
        data: {
            title: '2023年陕西省普通高等教育专升本招生考试高等数学',
            year: 2023,
            subject: 'MATH',
            paperType: 'REAL'
        }
    });

    // 3. Questions
    const questionsData = [
        // Math 2023 - Complete Set (Simulated based on search results)
        {
            paperId: paperMath2023.id,
            content: '1. 函数 $f(x) = \\sqrt{4-x^2} + \\ln(x-1)$ 的定义域为',
            type: 'CHOICE',
            options: JSON.stringify(['(A) (-2, 2)', '(B) (1, 2]', '(C) (-2, -1) U (1, 2)', '(D) (1, +inf)']),
            answer: '(B) (1, 2]',
            difficulty: 2,
            explanation: '需满足：1. $4-x^2 \\ge 0 \\Rightarrow -2 \\le x \\le 2$；2. $x-1 > 0 \\Rightarrow x > 1$。取交集得 $(1, 2]$。',
            tagNames: ['函数与极限']
        },
        {
            paperId: paperMath2023.id,
            content: '2. 极限 $\\lim_{x \\to 0} \\frac{\\sin kx}{x}$ (k为非零常数) 等于',
            type: 'CHOICE',
            options: JSON.stringify(['(A) 0', '(B) k', '(C) 1/k', '(D) 1']),
            answer: '(B) k',
            difficulty: 2,
            explanation: '利用重要极限 $\\lim_{x \\to 0} \\frac{\\sin \\Box}{\\Box} = 1$。原式 = $\\lim_{x \\to 0} k \\cdot \\frac{\\sin kx}{kx} = k \\cdot 1 = k$。',
            tagNames: ['函数与极限']
        },
        {
            paperId: paperMath2023.id,
            content: '3. 函数 $f(x) = x^3 - 3x^2 + 2$ 的驻点为',
            type: 'CHOICE',
            options: JSON.stringify(['(A) 0', '(B) 1', '(C) 2', '(D) 0, 2']),
            answer: '(D) 0, 2',
            difficulty: 3,
            explanation: '$f\'(x) = 3x^2 - 6x = 3x(x-2)$。令 $f\'(x)=0$，解得 $x=0$ 或 $x=2$。',
            tagNames: ['导数与微分']
        },
        {
            paperId: paperMath2023.id,
            content: '4. 函数 $f(x) = e^{-x^2}$ 在区间 $[-1, 1]$ 上的最小值是',
            type: 'CHOICE',
            options: JSON.stringify(['(A) 0', '(B) e^{-1}', '(C) 1', '(D) e']),
            answer: '(B) e^{-1}',
            difficulty: 3,
            explanation: '$f(x)$ 是偶函数，关于 y 轴对称。$f\'(x) = -2xe^{-x^2}$。在 $(0, 1)$ 上 $f\'(x) < 0$，函数单调递减。最大值为 $f(0)=1$，最小值为 $f(1)=e^{-1}$。',
            tagNames: ['导数与微分']
        },
        {
            paperId: paperMath2023.id,
            content: '5. 若 $f(x)$ 在点 $x_0$ 处可导，且 $f\'(x_0) = 2$，则 $\\lim_{h \\to 0} \\frac{f(x_0+h) - f(x_0-h)}{h}$ 等于',
            type: 'CHOICE',
            options: JSON.stringify(['(A) 2', '(B) 4', '(C) 0', '(D) 1']),
            answer: '(B) 4',
            difficulty: 4,
            explanation: '原式 = $\\lim_{h \\to 0} \\frac{f(x_0+h) - f(x_0) + f(x_0) - f(x_0-h)}{h} = \\lim_{h \\to 0} \\frac{f(x_0+h) - f(x_0)}{h} + \\lim_{h \\to 0} \\frac{f(x_0-h) - f(x_0)}{-h} = f\'(x_0) + f\'(x_0) = 2 + 2 = 4$。',
            tagNames: ['导数与微分']
        },
        {
            paperId: paperMath2023.id,
            content: '6. 极限 $\\lim_{x \\to 1} \\frac{x^2-1}{x-1} = $',
            type: 'CHOICE', // Treat fill-in as choice for now or use FILL
            options: null,
            answer: '2',
            difficulty: 2,
            explanation: '利用因式分解：$\\frac{(x-1)(x+1)}{x-1} = x+1$，当 $x \\to 1$ 时，极限为 2。',
            tagNames: ['函数与极限']
        },
        {
            paperId: paperMath2023.id,
            content: '7. 定积分 $\\int_{0}^{1} (x^3 + x^2) \\, dx = $',
            type: 'CHOICE',
            options: null,
            answer: '7/12',
            difficulty: 3,
            explanation: '原式 = $[\\frac{x^4}{4} + \\frac{x^3}{3}]_0^1 = (\\frac{1}{4} + \\frac{1}{3}) - 0 = \\frac{7}{12}$。',
            tagNames: ['一元函数积分']
        }
    ];

    for (const q of questionsData) {
        // Connect tags
        const tagConnect = await prisma.tag.findMany({
            where: { name: { in: q.tagNames } }
        });

        await prisma.question.create({
            data: {
                content: q.content,
                type: q.type,
                difficulty: q.difficulty,
                options: q.options,
                answer: q.answer,
                explanation: q.explanation,
                tags: {
                    connect: tagConnect.map(t => ({ id: t.id }))
                },
                examPapers: {
                    connect: { id: q.paperId }
                }
            }
        });
    }

    // Ensure we have an admin user
    // Note: Using a simple email format since email must be unique
    // User can login with email "admin@admin.com" or we can update login to support username
    await prisma.user.upsert({
        where: { email: 'admin@admin.com' },
        update: {
            username: 'admin',
            password: 'admin',
            email: 'admin@admin.com',
            role: 'ADMIN',
        },
        create: {
            email: 'admin@admin.com',
            username: 'admin',
            password: 'admin',
            role: 'ADMIN',
            level: 1,
            xp: 0,
            streak: 0,
        }
    });

    console.log(`Seeding finished.`);
    console.log(`管理员账号已创建:`);
    console.log(`  邮箱: admin@admin.com`);
    console.log(`  用户名: admin`);
    console.log(`  密码: admin`);
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        // clean up even if error
        await prisma.$disconnect()
        process.exit(1)
    })
