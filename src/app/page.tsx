'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, ArrowRight, Sparkles, RotateCcw, Copy, Check, Wand2, X } from 'lucide-react';

export default function Home() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiUrl, setApiUrl] = useState('https://token-plan-sgp.xiaomimimo.com/v1');
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('MiMo-V2.5');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  }, []);

  const handleFile = (file: File) => {
    if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setInputText(text);
      };
      reader.readAsText(file);
    } else {
      setError('仅支持 .txt 和 .md 文件');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleHumanize = async () => {
    if (!inputText.trim()) {
      setError('请先输入或导入文本');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setIsLoading(true);
    setError('');
    setOutputText('');

    try {
      const response = await fetch('/api/humanize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '请求失败');
      }

      setOutputText(data.result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "网络错误，请稍后重试";
      setError(message);
      setTimeout(() => setError(""), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setInputText('');
    setOutputText('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-canvas">
      {/* Floating Nav Pill */}
      <nav className="sticky top-6 z-50 mx-auto max-w-4xl px-4">
        <div className="flex items-center justify-between rounded-pill bg-white px-6 py-3 shadow-[rgba(0,0,0,0.04)_0px_4px_24px_0px]">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-signal">
              <Wand2 className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-medium tracking-tight text-ink" style={{ letterSpacing: '-0.02em' }}>
              讲人话
            </span>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-slate hover:bg-bone transition-colors"
          >
            设置
          </button>
        </div>
      </nav>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mx-auto max-w-4xl px-4 mt-4">
          <div className="rounded-lg bg-white p-6 shadow-[rgba(0,0,0,0.04)_0px_4px_24px_0px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-ink">API 设置</h3>
              <button onClick={() => setShowSettings(false)} className="text-slate hover:text-ink">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate mb-1">API URL</label>
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  className="w-full rounded-md border border-dust bg-canvas px-4 py-2 text-sm text-ink focus:border-signal focus:outline-none"
                  placeholder="https://token-plan-sgp.xiaomimimo.com/v1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate mb-1">Model</label>
                <input
                  type="text"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="w-full rounded-md border border-dust bg-canvas px-4 py-2 text-sm text-ink focus:border-signal focus:outline-none"
                  placeholder="MiMo-V2.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate mb-1">API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full rounded-md border border-dust bg-canvas px-4 py-2 text-sm text-ink focus:border-signal focus:outline-none"
                  placeholder="输入你的 API Key"
                />
                <p className="mt-1 text-xs text-slate">你也可以在 Vercel 环境变量中设置 API_KEY</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="mx-auto max-w-4xl px-4 pt-16 pb-8">
        <div className="text-center">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-bone px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-signal-light"></span>
            <span className="text-xs font-bold uppercase tracking-widest text-slate" style={{ letterSpacing: '0.04em' }}>
              AI 文本去味器
            </span>
          </div>
          <h1
            className="text-5xl font-medium text-ink sm:text-6xl"
            style={{ lineHeight: '1', letterSpacing: '-0.02em' }}
          >
            让文字
            <br />
            更像人写的
          </h1>
          <p className="mt-4 text-base text-slate" style={{ lineHeight: '1.4' }}>
            去除 AI 生成痕迹，让内容自然、真实、有灵魂
          </p>
        </div>
      </section>

      {/* Error Toast */}
      {error && (
        <div className="mx-auto max-w-4xl px-4 mb-4">
          <div className="rounded-md bg-signal/10 border border-signal/20 px-4 py-3 text-sm text-signal">
            {error}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 pb-24">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Input Area */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate">原文</span>
              <div className="flex gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate hover:bg-bone transition-colors"
                >
                  <Upload className="h-3.5 w-3.5" />
                  导入文件
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md"
                  onChange={handleFileInput}
                  className="hidden"
                />
                {inputText && (
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate hover:bg-bone transition-colors"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    清空
                  </button>
                )}
              </div>
            </div>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative flex-1 rounded-lg border transition-colors ${
                dragActive
                  ? 'border-signal bg-signal/5'
                  : 'border-dust bg-white'
              }`}
            >
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="粘贴文本到这里，或拖拽 .txt / .md 文件到此处..."
                className="h-80 w-full resize-none rounded-lg bg-transparent p-4 text-sm text-ink placeholder:text-dust focus:outline-none"
                style={{ lineHeight: '1.6' }}
              />
              {!inputText && (
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 text-dust">
                  <FileText className="h-8 w-8" />
                  <p className="text-xs">支持 .txt / .md 文件</p>
                </div>
              )}
            </div>
          </div>

          {/* Output Area */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate">改写结果</span>
              {outputText && (
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate hover:bg-bone transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-green-600" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      复制
                    </>
                  )}
                </button>
              )}
            </div>
            <div className="relative flex-1 rounded-lg border border-dust bg-lifted">
              {isLoading ? (
                <div className="flex h-80 flex-col items-center justify-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-signal/10">
                    <Sparkles className="h-5 w-5 animate-pulse text-signal" />
                  </div>
                  <p className="text-sm text-slate">正在去除 AI 味儿...</p>
                </div>
              ) : outputText ? (
                <div className="h-80 overflow-auto p-4">
                  <pre className="whitespace-pre-wrap text-sm text-ink" style={{ lineHeight: '1.6', fontFamily: 'inherit' }}>
                    {outputText}
                  </pre>
                </div>
              ) : (
                <div className="flex h-80 flex-col items-center justify-center gap-2 text-dust">
                  <Wand2 className="h-8 w-8" />
                  <p className="text-xs">结果将显示在这里</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleHumanize}
            disabled={isLoading || !inputText.trim()}
            className="inline-flex items-center gap-2 rounded-pill bg-ink px-8 py-3 text-base font-medium text-canvas transition-all hover:bg-charcoal disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ letterSpacing: '-0.03em' }}
          >
            {isLoading ? (
              <>
                <Sparkles className="h-4 w-4 animate-spin" />
                处理中...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                开始改写
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-ink py-12">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-signal">
                <Wand2 className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm font-medium text-white">讲人话</span>
            </div>
            <p className="text-xs text-slate" style={{ lineHeight: '1.4' }}>
              基于 Humanizer-zh 技能 · 去除 AI 写作痕迹
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
