"use client";

import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathTextProps {
    text: string;
    className?: string;
}

/**
 * 渲染包含 LaTeX 数学公式的文本
 * 支持 \( ... \) 和 \[ ... \] 格式
 */
export function MathText({ text, className = '' }: MathTextProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current || !text) return;

        // 将文本中的 LaTeX 公式渲染为 HTML
        const renderMath = (input: string): string => {
            let result = input;

            // 处理行内公式 \( ... \)
            result = result.replace(/\\\((.*?)\\\)/g, (match, formula) => {
                try {
                    return katex.renderToString(formula, {
                        throwOnError: false,
                        displayMode: false,
                    });
                } catch (e) {
                    console.error('KaTeX inline error:', e);
                    return match;
                }
            });

            // 处理块级公式 \[ ... \]
            result = result.replace(/\\\[(.*?)\\\]/g, (match, formula) => {
                try {
                    return katex.renderToString(formula, {
                        throwOnError: false,
                        displayMode: true,
                    });
                } catch (e) {
                    console.error('KaTeX block error:', e);
                    return match;
                }
            });

            // 处理 $...$ 格式（单个 $ 表示行内公式）
            result = result.replace(/\$([^\$]+)\$/g, (match, formula) => {
                try {
                    return katex.renderToString(formula, {
                        throwOnError: false,
                        displayMode: false,
                    });
                } catch (e) {
                    console.error('KaTeX $ error:', e);
                    return match;
                }
            });

            // 处理 $$...$$ 格式（双 $$ 表示块级公式）
            result = result.replace(/\$\$([^\$]+)\$\$/g, (match, formula) => {
                try {
                    return katex.renderToString(formula, {
                        throwOnError: false,
                        displayMode: true,
                    });
                } catch (e) {
                    console.error('KaTeX $$ error:', e);
                    return match;
                }
            });

            return result;
        };

        containerRef.current.innerHTML = renderMath(text);
    }, [text]);

    return <div ref={containerRef} className={className} />;
}
