import { memo, type ReactNode } from 'react';
import { Markdown } from '@/lib/markdown';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export const MarkdownPreview = memo(function MarkdownPreview({
  content,
  className = '',
}: MarkdownPreviewProps): ReactNode {
  return (
    <div className={`prose prose-sm prose-invert max-w-none text-foreground ${className}`}>
      <Markdown>{content}</Markdown>
    </div>
  );
});
