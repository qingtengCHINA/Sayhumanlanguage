'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, ArrowRight, Sparkles, RotateCcw, Copy, Check, Wand2 } from 'lucide-react';
import mammoth from 'mammoth';
import LineWaves from '@/components/LineWaves';
import ShinyText from '@/components/ShinyText';

export default function Home() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
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

  const handleFile = async (file: File) => {
    const name = file.name.toLowerCase();
    setFileName(file.name);

    if (file.type === 'text/plain' || name.endsWith('.txt') || name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setInputText(text);
      };
      reader.readAsText(file);
    } else if (name.endsWith('.docx')) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setInputText(result.value);
      } catch {
        setError('无法解析该 docx 文件，请检查文件是否损坏');
        setTimeout(() => setError(''), 4000);
        setFileName('');
      }
    } else if (name.endsWith('.doc')) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setInputText(result.value);
      } catch {
        setError('无法解析该 doc 文件。建议先转换为 docx 格式后重试');
        setTimeout(() => setError(''), 4000);
        setFileName('');
      }
    } else {
      setError('仅支持 .txt / .md / .doc / .docx 文件');
      setTimeout(() => setError(''), 3000);
      setFileName('');
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
        body: JSON.stringify({ text: inputText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '请求失败');
      }

      setOutputText(data.result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '网络错误，请稍后重试';
      setError(message);
      setTimeout(() => setError(''), 5000);
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
    setFileName('');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-canvas">
      {/* LineWaves Background */}
      <LineWaves
        speed={0.15}
        innerLineCount={24}
        outerLineCount={30}
        warpIntensity={0.8}
        rotation={-45}
        edgeFadeWidth={0.1}
        colorCycleSpeed={0.5}
        brightness={0.08}
        color1="#D1CDC7"
        color2="#9A3A0A"
        color3="#696969"
        enableMouseInteraction={true}
        mouseInfluence={1.5}
      />

      {/* Content Layer */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="mx-auto max-w-4xl px-4 pt-20 pb-10">
          <div className="text-center">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/60 backdrop-blur-sm px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-signal-light"></span>
              <span className="text-xs font-bold uppercase tracking-widest text-slate" style={{ letterSpacing: '0.04em' }}>
                AI 文本去味器
              </span>
            </div>
            <h1
              className="text-5xl font-medium text-ink sm:text-6xl"
              style={{ lineHeight: '1', letterSpacing: '-0.02em' }}
            >
              讲人话
            </h1>
            <p className="mt-4 text-lg" style={{ lineHeight: '1.4' }}>
              <ShinyText
                text="给你的文章去AI味儿"
                speed={3}
                delay={1}
                color="#141413"
                shineColor="#F37338"
                spread={120}
                direction="left"
              />
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
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate hover:bg-white/60 transition-colors"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    导入文件
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.md,.doc,.docx"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  {inputText && (
                    <button
                      onClick={handleReset}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate hover:bg-white/60 transition-colors"
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
                    : 'border-dust bg-white/80 backdrop-blur-sm'
                }`}
              >
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="粘贴文本到这里，或拖拽文件到此处..."
                  className="h-80 w-full resize-none rounded-lg bg-transparent p-4 text-sm text-ink placeholder:text-dust focus:outline-none"
                  style={{ lineHeight: '1.6' }}
                />
                {!inputText && (
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 text-dust">
                    <FileText className="h-8 w-8" />
                    <p className="text-xs">支持 .txt / .md / .doc / .docx</p>
                  </div>
                )}
                {fileName && (
                  <div className="absolute bottom-2 left-3 inline-flex items-center gap-1 rounded-full bg-bone px-2 py-0.5 text-xs text-slate">
                    <FileText className="h-3 w-3" />
                    {fileName}
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
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate hover:bg-white/60 transition-colors"
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
              <div className="relative flex-1 rounded-lg border border-dust bg-white/80 backdrop-blur-sm">
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
                基于{' '}
                <a
                  href="https://github.com/op7418/Humanizer-zh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-white transition-colors"
                >
                  Humanizer-zh
                </a>
                {' '}技能 · 去除 AI 写作痕迹
              </p>
              <p className="text-xs text-slate">
                Made By{' '}
                <a
                  href="https://qingtengstudio.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-white transition-colors"
                >
                  QingTengStudio
                </a>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
