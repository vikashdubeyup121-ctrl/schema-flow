import { useState, useEffect } from 'react';
import { apiClient } from '@/shared/api/client';
import { Toast } from '@/shared/stores/toast.store';

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
      apiClient.get('/api/v1/parser/plugins').then((res) => {
        if (res.data.success) {
          setPlugins(res.data.data);
          if (res.data.data.length > 0) {
            setSelectedPluginId(res.data.data[0].id);
          }
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedPlugin = plugins.find(p => p.id === selectedPluginId);

  const handleImport = async () => {
    if (!content.trim()) {
      Toast.error('Please paste your schema content.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiClient.post(`/api/v1/parser/import/${diagramId}`, {
        pluginId: selectedPluginId,
        content,
        action
      });

      if (res.data.success) {
        Toast.success('Schema imported successfully!');
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      Toast.error(err.response?.data?.error || err.message || 'Import failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl p-6 bg-card border border-border rounded-lg shadow-xl flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-foreground">Import Database Schema</h2>
        
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-muted-foreground">Source Type</label>
          <select 
            value={selectedPluginId} 
            onChange={(e) => setSelectedPluginId(e.target.value)}
            className="h-10 px-3 bg-surface border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {plugins.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {selectedPlugin && (
          <div className="p-3 bg-primary/10 border border-primary/20 rounded-md">
            <h3 className="text-xs font-semibold text-primary mb-1">Step 1: Extract Schema</h3>
            <p className="text-xs text-primary/80 mb-2">Run the following command or follow these instructions to extract your schema:</p>
            <pre className="bg-background border border-border p-2 rounded text-xs overflow-x-auto text-muted-foreground">
              {selectedPlugin.importCommand}
            </pre>
          </div>
        )}

        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-sm font-medium text-muted-foreground">Step 2: Paste Schema</label>
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-48 p-3 bg-surface border border-border rounded-md text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            placeholder="Paste your schema here..."
          />
        </div>

        {selectedPlugin && (
          <div className="text-xs text-muted-foreground">
            <strong>Troubleshooting:</strong> {selectedPlugin.troubleshootingGuide}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-muted-foreground">Import Strategy</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input 
                type="radio" 
                name="action" 
                value="append" 
                checked={action === 'append'} 
                onChange={() => setAction('append')}
                className="accent-primary"
              />
              Append to existing diagram
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input 
                type="radio" 
                name="action" 
                value="replace" 
                checked={action === 'replace'} 
                onChange={() => setAction('replace')}
                className="accent-primary"
              />
              Replace entire diagram
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-border mt-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-hover rounded-md transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleImport}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Importing...' : 'Import Schema'}
          </button>
        </div>
      </div>
    </div>
  );
}
