import  'react';
import { PrismLight as SyntaxHighlighterComponent } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import graphql from 'react-syntax-highlighter/dist/esm/languages/prism/graphql';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';

import type { ExportFormat } from '../services/export.service';

SyntaxHighlighterComponent.registerLanguage('sql', sql);
SyntaxHighlighterComponent.registerLanguage('javascript', javascript);
SyntaxHighlighterComponent.registerLanguage('graphql', graphql);
SyntaxHighlighterComponent.registerLanguage('typescript', typescript);

interface SyntaxHighlighterProps {
  code: string;
  language: ExportFormat;
}

export function SyntaxHighlighter({ code, language }: SyntaxHighlighterProps) {
  const langMap: Record<ExportFormat, string> = {
    prisma: 'graphql', // Graphql highlighting works reasonably well for Prisma schema
    postgres: 'sql',
    mongo: 'javascript',
    dsl: 'graphql',
  };

  const prismLang = langMap[language] || 'javascript';

  return (
    <SyntaxHighlighterComponent
      language={prismLang}
      style={vscDarkPlus}
      customStyle={{
        margin: 0,
        padding: 0,
        background: 'transparent',
        fontSize: '13px',
      }}
      wrapLines={true}
      wrapLongLines={true}
    >
      {code}
    </SyntaxHighlighterComponent>
  );
}
