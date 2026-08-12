'use client';

import { useState, useEffect } from 'react';
import { Bot, Save, Loader2, Sparkles, Database, Shield, Zap } from 'lucide-react';
import client from '@/shared/lib/api/client';

export default function AISettingsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    client.get('/ai/settings')
      .then(res => {
        const data = res.data?.data || res.data;
        if (data?.config) setConfig(data.config);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await client.put('/ai/settings', config);
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-indigo-600" />
          Enterprise AI Platform
        </h1>
        <p className="text-gray-500 mt-2">Configure models, tools, and RAG settings for your tenant.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Model Configuration */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2"><Bot className="w-5 h-5 text-blue-500" /> Provider & Model</h2>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">AI Provider</label>
            <select 
              value={config?.provider || 'gemini'}
              onChange={e => setConfig({...config, provider: e.target.value})}
              className="w-full p-2 border rounded-md"
            >
              <option value="gemini">Google Gemini</option>
              <option value="openai">OpenAI</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Model Selection</label>
            <select 
              value={config?.model || 'gemini-1.5-flash'}
              onChange={e => setConfig({...config, model: e.target.value})}
              className="w-full p-2 border rounded-md"
            >
              {config?.provider === 'openai' ? (
                <>
                  <option value="gpt-4o-mini">GPT-4o Mini (Fast)</option>
                  <option value="gpt-4o">GPT-4o (Reasoning)</option>
                </>
              ) : (
                <>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fast)</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro (Reasoning)</option>
                </>
              )}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">API Key (BYOK)</label>
            <input 
              type="password"
              placeholder="Leave blank to use shared key"
              value={config?.apiKey || ''}
              onChange={e => setConfig({...config, apiKey: e.target.value})}
              className="w-full p-2 border rounded-md"
            />
            <p className="text-xs text-gray-500">Keys are encrypted at rest.</p>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2"><Shield className="w-5 h-5 text-emerald-500" /> Capabilities</h2>
          
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium text-gray-900">Enable AI Platform</p>
              <p className="text-sm text-gray-500">Master toggle for all AI features</p>
            </div>
            <input type="checkbox" checked={config?.isAiEnabled ?? true} onChange={e => setConfig({...config, isAiEnabled: e.target.checked})} className="w-5 h-5" />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium text-gray-900 flex items-center gap-2">
                <Database className="w-4 h-4" /> RAG (Knowledge Base)
              </p>
              <p className="text-sm text-gray-500">Allow AI to read internal documents</p>
            </div>
            <input type="checkbox" checked={config?.useRag ?? true} onChange={e => setConfig({...config, useRag: e.target.checked})} className="w-5 h-5" />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium text-gray-900 flex items-center gap-2">
                <Zap className="w-4 h-4" /> CRM Tool Calling
              </p>
              <p className="text-sm text-gray-500">Allow AI to fetch live data & take actions</p>
            </div>
            <input type="checkbox" checked={config?.useTools ?? true} onChange={e => setConfig({...config, useTools: e.target.checked})} className="w-5 h-5" />
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-all shadow-md"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
}
