import { useState, useEffect } from 'react';
import { apiClient } from '@/shared/api/apiClient';
import { Toast } from '@/shared/stores/toast.store';
import { DatabaseIcon, TerminalIcon, AlertCircleIcon } from 'lucide-react';

interface Plugin {
  id: string;
  name: string;
  importCommand: string;
  troubleshootingGuide: string;
}

interface ImportSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
  diagramId: string;
  onSuccess: () => void;
}

export function ImportSchemaModal({ isOpen, onClose, diagramId, onSuccess }: ImportSchemaModalProps) {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [selectedPluginId, setSelectedPluginId] = useState<string>('');
  const [content, setContent] = useState('');
  const [action, setAction] = useState<'append' | 'replace'>('append');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      apiClient.get('/parser/plugins').then((res) => {
        // apiClient interceptor unwraps { success: true, data: [...] } into just the array
        if (Array.isArray(res.data)) {
          setPlugins(res.data);
          if (res.data.length > 0) {
            setSelectedPluginId(res.data[0].id);
          }
        } else {
          console.error("Unexpected plugins response format:", res.data);
        }
      }).catch(err => {
        console.error("Failed to fetch plugins", err);
        Toast.error("Failed to load parser plugins");
      });
    }
  }, [isOpen]);

  // Auto-detect source type based on content
  useEffect(() => {
    if (!content) return;
    
    const text = content.trim();
    let detectedId = null;

    if (text.includes('CREATE TABLE') || text.includes('PostgreSQL database dump')) {
      detectedId = 'postgres';
    } else if (text.includes('model ') && text.includes('{') && text.includes('}')) {
      detectedId = 'prisma';
    } else if (text.includes('new Schema') || text.includes('mongoose.Schema')) {
      detectedId = 'mongodb';
    }

    if (detectedId && detectedId !== selectedPluginId && plugins.some(p => p.id === detectedId)) {
      setSelectedPluginId(detectedId);
      Toast.success(`Auto-detected ${plugins.find(p => p.id === detectedId)?.name}!`);
    }
  }, [content, plugins, selectedPluginId]);

  if (!isOpen) return null;

  const selectedPlugin = plugins.find(p => p.id === selectedPluginId);

  const handleImport = async () => {
    if (!content.trim()) {
      Toast.error('Please paste your schema content.');
      return;
    }

    setIsLoading(true);
    try {
      // apiClient will unwrap { success: true, data: ... }
      await apiClient.post(`/parser/import/${diagramId}`, {
        pluginId: selectedPluginId,
        content,
        action
      });

      Toast.success('Schema imported successfully!');
      onSuccess();
      onClose();
    } catch (err: any) {
      Toast.error(err.response?.data?.error || err.message || 'Import failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-5xl bg-card border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-border bg-surface flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-md">
              <DatabaseIcon size={18} className="text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Import Database Schema</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>
        
        {/* Body 2-Column Layout */}
        <div className="flex flex-col md:flex-row h-[600px] max-h-[80vh]">
          
          {/* Left Column: Source Selection & Instructions */}
          <div className="w-full md:w-1/3 border-r border-border bg-surface/30 p-6 flex flex-col gap-6 overflow-y-auto">
            <div>
              <label className="text-sm font-semibold text-foreground mb-3 block">1. Select Source Database</label>
              <div className="flex flex-col gap-2">
                {plugins.length === 0 ? (
                  <div className="text-sm text-muted-foreground animate-pulse">Loading plugins...</div>
                ) : (
                  plugins.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPluginId(p.id)}
                      className={`text-left px-4 py-3 rounded-lg border transition-all ${
                        selectedPluginId === p.id 
                          ? 'border-primary bg-primary/5 shadow-sm' 
                          : 'border-border bg-card hover:border-primary/50'
                      }`}
                    >
                      <div className="font-medium text-foreground text-sm">{p.name}</div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {selectedPlugin && (
              <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-left-2 duration-300">
                <div>
                  <label className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <TerminalIcon size={16} className="text-muted-foreground" />
                    2. Extract Schema
                  </label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Run this command on your machine to extract the raw schema definition:
                  </p>
                  <div className="relative group">
                    <pre className="bg-[#1e1e1e] border border-border p-3 rounded-lg text-xs overflow-x-auto text-[#d4d4d4] font-mono whitespace-pre-wrap">
                      {selectedPlugin.importCommand}
                    </pre>
                  </div>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-amber-600 dark:text-amber-500 flex items-center gap-1.5 mb-1">
                    <AlertCircleIcon size={14} />
                    Troubleshooting
                  </h4>
                  <p className="text-[11px] text-amber-700/80 dark:text-amber-500/80 leading-relaxed">
                    {selectedPlugin.troubleshootingGuide}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Editor & Actions */}
          <div className="w-full md:w-2/3 p-6 flex flex-col gap-4 bg-card">
            <div className="flex flex-col gap-2 flex-1 relative">
              <label className="text-sm font-semibold text-foreground flex justify-between items-end">
                <span>3. Paste Raw Schema or Upload File</span>
                <span className="text-xs font-normal text-muted-foreground">Max 1MB</span>
              </label>
              
              <div className="flex items-center gap-2 mb-1">
                <label className="cursor-pointer px-3 py-1.5 text-xs font-medium bg-surface-hover text-foreground border border-border rounded-md hover:bg-surface transition-colors flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  Select File
                  <input 
                    type="file" 
                    accept=".sql,.prisma,.txt,.js,.json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      
                      if (file.size > 1000000) {
                        Toast.error('File is too large. Max size is 1MB.');
                        return;
                      }
                      
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setContent(event.target?.result as string || '');
                        Toast.success('File loaded successfully!');
                      };
                      reader.onerror = () => Toast.error('Failed to read file.');
                      reader.readAsText(file);
                    }}
                  />
                </label>
              </div>

              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex-1 w-full p-4 bg-[#1e1e1e] text-[#d4d4d4] border border-border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none placeholder:text-zinc-600"
                placeholder="Paste the output of the extraction command here or upload a file..."
                spellCheck={false}
              />
            </div>

            <div className="flex flex-col gap-3 py-4 border-t border-border mt-2">
              <label className="text-sm font-semibold text-foreground">Import Strategy</label>
              <div className="flex gap-6 p-4 rounded-lg border border-border bg-surface/30">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="pt-0.5">
                    <input 
                      type="radio" 
                      name="action" 
                      value="append" 
                      checked={action === 'append'} 
                      onChange={() => setAction('append')}
                      className="w-4 h-4 text-primary bg-surface border-border focus:ring-primary focus:ring-2 cursor-pointer"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">Append</span>
                    <span className="text-xs text-muted-foreground">Add to existing diagram</span>
                  </div>
                </label>
                
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="pt-0.5">
                    <input 
                      type="radio" 
                      name="action" 
                      value="replace" 
                      checked={action === 'replace'} 
                      onChange={() => setAction('replace')}
                      className="w-4 h-4 text-primary bg-surface border-border focus:ring-primary focus:ring-2 cursor-pointer"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">Replace All</span>
                    <span className="text-xs text-muted-foreground">Overwrite current canvas</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-medium text-foreground border border-border bg-surface hover:bg-surface-hover hover:text-foreground rounded-lg transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleImport}
                disabled={isLoading || !content.trim() || !selectedPluginId}
                className="px-6 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50 disabled:hover:shadow-none flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Importing...
                  </>
                ) : (
                  'Run Import'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
