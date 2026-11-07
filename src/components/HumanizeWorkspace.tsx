"use client";

import { useCallback, useRef, useState } from "react";
import clsx from "clsx";
import {
  ArrowRight,
  Check,
  Copy,
  FileText,
  RotateCcw,
  Upload,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";
import RewriteLoader from "@/components/RewriteLoader";

const panelEnter = {
  duration: 0.2,
  ease: [0.23, 1, 0.32, 1] as const,
};

function countChars(text: string) {
  return Array.from(text).length;
}

export default function HumanizeWorkspace() {
  const reduce = useReducedMotion();
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const dragDepthRef = useRef(0);

  const handleFile = useCallback(async (file: File) => {
    const name = file.name.toLowerCase();
    setFileName(file.name);

    if (file.type === "text/plain" || name.endsWith(".txt") || name.endsWith(".md")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setInputText((e.target?.result as string) || "");
      };
      reader.onerror = () => {
        setFileName("");
        toast.error("读取文件失败，请重试");
      };
      reader.readAsText(file);
      return;
    }

    if (name.endsWith(".docx") || name.endsWith(".doc")) {
      try {
        const mammoth = await import("mammoth");
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setInputText(result.value);
      } catch {
        setFileName("");
        toast.error(
          name.endsWith(".doc")
            ? "无法解析该 doc 文件。建议先转为 docx 再试。"
            : "无法解析该 docx 文件，请检查文件是否损坏。"
        );
      }
      return;
    }

    setFileName("");
    toast.error("仅支持 .txt / .md / .doc / .docx 文件");
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter") {
      dragDepthRef.current += 1;
      setDragActive(true);
    } else if (e.type === "dragleave") {
      dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
      if (dragDepthRef.current === 0) setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragDepthRef.current = 0;
      setDragActive(false);
      const files = e.dataTransfer.files;
      if (files && files[0]) {
        void handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleHumanize = useCallback(async () => {
    if (isLoading) return;
    if (!inputText.trim()) {
      toast.error("请先输入或导入文本");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    window.dispatchEvent(new Event("ocean:pulse"));
    setIsLoading(true);

    try {
      const response = await fetch("/api/humanize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
        signal: controller.signal,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "请求失败");
      }

      setOutputText(data.result || "");
      if (data.truncated) {
        toast.warning("文本较长，结果可能被截断，建议分段改写");
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      const message = err instanceof Error ? err.message : "网络错误，请稍后重试";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [inputText, isLoading]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      toast.success("已复制");
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("复制失败，请手动选择文本");
    }
  }, [outputText]);

  const handleReset = useCallback(() => {
    abortRef.current?.abort();
    setInputText("");
    setOutputText("");
    setFileName("");
    setCopied(false);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      void handleHumanize();
    }
  };

  return (
    <div
      id="workspace"
      className="flex w-full scroll-mt-24 flex-col gap-4 rounded-2xl border border-line bg-surface/90 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.35)] md:p-5"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <section className="flex min-h-0 flex-col gap-2">
          <div className="flex items-center gap-2">
            <h2 id="source-heading" className="text-sm font-medium text-muted">
              原文
            </h2>
            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted transition-colors duration-160 ease-out hover:bg-page hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <Upload className="h-3.5 w-3.5" strokeWidth={1.75} />
                导入
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.doc,.docx"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files[0]) void handleFile(files[0]);
                }}
                className="hidden"
              />
              {inputText ? (
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted transition-colors duration-160 ease-out hover:bg-page hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
                  清空
                </button>
              ) : null}
            </div>
          </div>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={clsx(
              "relative flex-1 rounded-xl border transition-[border-color,background-color] duration-160 ease-out",
              dragActive ? "border-accent bg-accent/5" : "border-line bg-page/70"
            )}
          >
            <textarea
              id="source-text"
              aria-labelledby="source-heading"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onInput={() => window.dispatchEvent(new Event("ocean:typing"))}
              onKeyDown={onKeyDown}
              placeholder="粘贴文本到这里，或把文件拖进来。支持 txt、md、doc、docx。"
              className="h-72 w-full resize-none rounded-xl bg-transparent p-4 text-sm leading-[1.75] text-ink placeholder:text-muted/70 focus:outline-none md:h-80"
            />
            {fileName ? (
              <div className="absolute bottom-2 left-3 inline-flex max-w-[80%] items-center gap-1 truncate rounded-pill bg-surface px-2 py-0.5 text-xs text-muted">
                <FileText className="h-3 w-3 shrink-0" strokeWidth={1.75} />
                <span className="truncate">{fileName}</span>
              </div>
            ) : null}
          </div>
          <p className="text-xs tabular-nums text-muted">{countChars(inputText)} 字</p>
        </section>

        <section className="flex min-h-0 flex-col gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-medium text-muted">改写结果</h2>
            <div className="ml-auto">
            {outputText ? (
              <button
                type="button"
                onClick={() => void handleCopy()}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted transition-colors duration-160 ease-out hover:bg-page hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-accent" strokeWidth={1.75} />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
                    复制
                  </>
                )}
              </button>
            ) : null}
            </div>
          </div>
          <div
            className="relative flex-1 overflow-hidden rounded-xl border border-line bg-page/70"
            aria-live="polite"
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={reduce ? false : { opacity: 0, transform: "scale(0.96)" }}
                  animate={{ opacity: 1, transform: "scale(1)" }}
                  exit={reduce ? undefined : { opacity: 0, transform: "scale(0.96)" }}
                  transition={panelEnter}
                  className="flex h-72 items-center justify-center md:h-80"
                >
                  <RewriteLoader />
                </motion.div>
              ) : outputText ? (
                <motion.div
                  key="result"
                  initial={reduce ? false : { opacity: 0, transform: "translateY(8px)" }}
                  animate={{ opacity: 1, transform: "translateY(0px)" }}
                  exit={reduce ? undefined : { opacity: 0 }}
                  transition={panelEnter}
                  className="h-72 overflow-auto p-4 md:h-80"
                >
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-[1.75] text-ink">
                    {outputText}
                  </pre>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduce ? undefined : { opacity: 0 }}
                  transition={panelEnter}
                  className="flex h-72 flex-col items-center justify-center gap-2 text-muted/80 md:h-80"
                >
                  <p className="text-xs">改写后的正文会出现在这里</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <p className="text-xs tabular-nums text-muted">
            {outputText ? `${countChars(outputText)} 字` : "等待改写"}
          </p>
        </section>
      </div>

      <div className="flex flex-col items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => void handleHumanize()}
          disabled={isLoading || !inputText.trim()}
          className="inline-flex items-center gap-2 rounded-pill bg-accent px-7 py-3 text-sm font-medium text-surface transition-[transform,opacity,background-color] duration-160 ease-out hover:bg-accent-hover active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isLoading ? "处理中" : "开始改写"}
          {!isLoading ? <ArrowRight className="h-4 w-4" strokeWidth={1.75} /> : null}
        </button>
        <p className="text-xs text-muted">Ctrl 或 Command + Enter</p>
      </div>
    </div>
  );
}
