import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
// 可选：引入代码高亮插件
import rehypeHighlight from 'rehype-highlight';
// 引入代码高亮样式
import 'highlight.js/styles/github.css';

interface MarkdownRendererProps {
  markdown: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ markdown }) => {
  if (!markdown) {
    return null;
  }

  return (
    <div className="markdown-content prose prose-gray max-w-none dark:prose-invert">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          code: ({ node, inline, className, children, ...props }: any) => {
            // 处理代码块
            if (inline) {
              return <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>;
            }
            
            // 处理多行代码块
            const match = /language-(\w+)/.exec(className || '');
            return <code className="!text-sm !font-mono">{children}</code>;
          },
          // 自定义链接渲染
          a: ({ node, ...props }: any) => {
            return <a {...props} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" />;
          },
          // 自定义表格样式
          table: ({ node, ...props }: any) => {
            return <table {...props} className="min-w-full border-collapse border border-border rounded-md overflow-hidden" />;
          },
          th: ({ node, ...props }: any) => {
            return <th {...props} className="bg-muted p-2 text-left text-sm font-semibold border border-border" />;
          },
          td: ({ node, ...props }: any) => {
            return <td {...props} className="p-2 text-sm border border-border" />;
          }
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;