import { useState, useMemo, useEffect } from 'react';
import { X, Copy, Download, Check } from 'lucide-react';
import { ExportService, type ExportFormat } from '../services/export.service';
import { SyntaxHighlighter } from './SyntaxHighlighter';

interface ExportSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
  dslText: string;
  diagramName: string;
}

export function ExportSchemaModal({ isOpen, onClose, dslText, diagramName }: ExportSchemaModalProps) {
  const [format, setFormat] = useState<ExportFormat>('prisma');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Re-generate the export string whenever the format or DSL changes
  const generatedCode = useMemo(() => {
    try {
      setError(null);
      return ExportService.generateExport(dslText, format);
    } catch (e: any) {
      setError(e.message || 'Failed to generate schema');
      return '';
    }
  }, [dslText, format]);

  // Reset copied state when format changes
  useEffect(() => {
    setCopied(false);
  }, [format]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleDownload = () => {
    const ext = ExportService.getFileExtension(format);
    const filename = `${diagramName.replace(/\s+/g, '_').toLowerCase()}_schema.${ext}`;
    ExportService.downloadStringAsFile(generatedCode, filename);
  };

  const formats: { id: ExportFormat; label: string }[] = [
    { id: 'prisma', label: 'Prisma' },
    { id: 'postgres', label: 'PostgreSQL' },
    { id: 'mongo', label: 'MongoDB' },
    { id: 'dsl', label: 'SchemaFlow DSL' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card w-full max-w-3xl rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Export Schema</h2>
          <button 
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-surface-hover rounded-md transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-48 border-r border-border bg-surface-hover/30 p-2 overflow-y-auto shrink-0">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3 pt-2">
              Formats
            </div>
            <div className="flex flex-col gap-1">
              {formats.map(f => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className={`text-left px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    format === f.id 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-surface-hover'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Code Viewer */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[#1e1e1e]">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
              <span className="text-xs text-white/50 font-mono">
                schema.{ExportService.getFileExtension(format)}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  disabled={!!error}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-md transition-colors disabled:opacity-50"
                >
                  {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={handleDownload}
                  disabled={!!error}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-md transition-colors disabled:opacity-50"
                >
                  <Download size={14} />
                  Download
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto p-4">
              {error ? (
                <div className="flex items-center justify-center h-full text-red-400 text-sm">
                  {error}
                </div>
              ) : (
                <SyntaxHighlighter code={generatedCode} language={format} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
