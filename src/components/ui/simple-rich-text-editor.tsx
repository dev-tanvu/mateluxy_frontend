'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Bold } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SimpleRichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    className?: string; // Wrapper class items
    placeholder?: string;
}

export function SimpleRichTextEditor({ value, onChange, className, placeholder }: SimpleRichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    // Internal state to track if we should update from props
    // We only update from props if the editor is NOT focused or empty to avoid cursor jumping
    const shouldUpdateFromProps = useRef(true);

    // Convert Markdown to HTML for display
    const formatToHtml = (markdown: string) => {
        if (!markdown) return '';

        let html = markdown
            // Escape HTML characters first to prevent XSS (basic)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            // Bold: **text** -> <b>text</b>
            .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
            // Newlines: \n -> <br>
            .replace(/\n/g, '<br>');

        return html;
    };

    // Convert HTML back to Markdown for storage
    const formatToMarkdown = (html: string) => {
        if (!html) return '';

        // Create a temporary element to traverse nodes
        const temp = document.createElement('div');
        temp.innerHTML = html;

        let markdown = '';

        // Helper to traverse nodes
        const traverse = (node: Node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                markdown += node.textContent;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const el = node as HTMLElement;
                const isBold =
                    el.tagName === 'B' ||
                    el.tagName === 'STRONG' ||
                    el.style.fontWeight === 'bold' ||
                    parseInt(el.style.fontWeight) >= 700;

                if (el.tagName === 'BR') {
                    markdown += '\n';
                } else if (el.tagName === 'DIV') {
                    // ContentEditable uses divs for new lines often
                    if (markdown.length > 0 && !markdown.endsWith('\n')) {
                        markdown += '\n';
                    }
                    Array.from(el.childNodes).forEach(traverse);
                } else if (isBold) {
                    markdown += '**';
                    Array.from(el.childNodes).forEach(traverse);
                    markdown += '**';
                } else {
                    Array.from(el.childNodes).forEach(traverse);
                }
            }
        };

        Array.from(temp.childNodes).forEach(traverse);
        return markdown;
    };

    // Initial load and updates from parent (e.g. AI generation)
    useEffect(() => {
        if (editorRef.current && shouldUpdateFromProps.current) {
            const html = formatToHtml(value || '');
            if (editorRef.current.innerHTML !== html) {
                editorRef.current.innerHTML = html;
            }
        }
    }, [value]);

    const handleInput = () => {
        if (editorRef.current) {
            shouldUpdateFromProps.current = false; // User is typing, don't overwrite
            const html = editorRef.current.innerHTML;
            const markdown = formatToMarkdown(html);
            onChange(markdown);
        }
    };

    const handleBoldClick = (e: React.MouseEvent) => {
        e.preventDefault();
        document.execCommand('bold', false);
        handleInput(); // Trigger update
        editorRef.current?.focus();
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
    };

    return (
        <div className={cn(
            "flex flex-col border border-[#EDF1F7] rounded-lg overflow-hidden bg-white transition-all",
            isFocused && "ring-1 ring-blue-500 border-blue-500",
            className
        )}>
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 border-b border-[#EDF1F7] bg-gray-50/50">
                <button
                    type="button"
                    onClick={handleBoldClick}
                    className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors"
                    title="Bold directly (Ctrl+B)"
                >
                    <Bold className="w-4 h-4" />
                </button>
            </div>

            {/* Editor Area */}
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onFocus={() => {
                    setIsFocused(true);
                    shouldUpdateFromProps.current = false;
                }}
                onBlur={() => {
                    setIsFocused(false);
                    shouldUpdateFromProps.current = true; // Allow updates again (e.g. re-formatting)
                }}
                onPaste={handlePaste}
                className="p-4 outline-none min-h-[200px] text-[15px] text-[#1f2837] overflow-y-auto"
                style={{ whiteSpace: 'pre-wrap' }}
            />
            {(!value && !isFocused) && (
                <div className="absolute top-[52px] left-4 text-[#8F9BB3] pointer-events-none text-[15px]">
                    {placeholder || 'Write here...'}
                </div>
            )}
        </div>
    );
}
