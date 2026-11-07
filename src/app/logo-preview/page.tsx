import type { Metadata } from "next";
import { BrandFaviconTile, BrandLogo, type LogoVariant } from "@/components/logo/BrandLogo";

export const metadata: Metadata = {
  title: "Logo 预览 — 讲人话",
  robots: { index: false, follow: false },
};

const VARIANTS: { key: LogoVariant; name: string; idea: string }[] = [
  { key: "a", name: "A · 引号句号", idea: "CJK 直角引号「」收一颗句号：被引用的话，只剩能读的那句" },
  { key: "b", name: "B · 言字旁", idea: "言字旁一笔人写笔画，AI 只剩一个像素方点（青色）" },
  { key: "c", name: "C · 方块成人", idea: "方块蒸发成圆：青（AI）→ 白 → 橙（人话）" },
];

function HeaderBar({ variant }: { variant: LogoVariant }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-page/75 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
        <a href="#top" className="flex items-center gap-2.5 text-sm font-medium text-ink">
          <BrandLogo variant={variant} className="h-7 w-7" />
          讲人话
        </a>
        <nav className="flex items-center gap-6 text-sm text-muted">
          <span className="hidden sm:inline">改写</span>
          <span>会改掉什么</span>
        </nav>
      </div>
    </header>
  );
}

export default function LogoPreviewPage() {
  return (
    <div className="min-h-dvh bg-page text-ink">
      <div className="mx-auto max-w-6xl px-5 py-10 md:px-8">
        <p className="font-mono text-xs text-accent">LOGO CHECKPOINT</p>
        <h1 className="mt-2 text-2xl font-medium md:text-3xl">三个方向 · 真实语境预览</h1>
        <p className="mt-2 max-w-xl text-sm leading-[1.75] text-muted">
          上排是深色头部实际效果，下排是尺寸阶梯（64 / 32 / 16px）与 favicon 底色方案。
        </p>

        <div className="mt-10 flex flex-col gap-12">
          {VARIANTS.map((v) => (
            <section key={v.key} className="overflow-hidden rounded-2xl border border-line bg-surface/60">
              <HeaderBar variant={v.key} />
              <div className="p-5 md:p-6">
                <h2 className="text-lg font-medium">{v.name}</h2>
                <p className="mt-1 text-sm leading-[1.75] text-muted">{v.idea}</p>

                <div className="mt-5 flex flex-wrap items-end gap-8">
                  <div className="flex items-end gap-6 rounded-xl border border-line bg-page/70 px-6 py-5">
                    {[64, 32, 16].map((s) => (
                      <div key={s} className="flex flex-col items-center gap-2">
                        <BrandLogo variant={v.key} style={{ width: s, height: s }} className="shrink-0" />
                        <span className="font-mono text-[10px] text-muted">{s}px</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-end gap-6 rounded-xl border border-line bg-page/70 px-6 py-5">
                    {[64, 32, 16].map((s) => (
                      <div key={s} className="flex flex-col items-center gap-2">
                        <BrandFaviconTile
                          variant={v.key}
                          style={{ width: s, height: s }}
                          className="shrink-0"
                        />
                        <span className="font-mono text-[10px] text-muted">{s}px</span>
                      </div>
                    ))}
                    <div className="flex flex-col items-center gap-2">
                      <BrandFaviconTile variant={v.key} className="h-16 w-16 rounded-[14px]" />
                      <span className="font-mono text-[10px] text-muted">桌面图标</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
