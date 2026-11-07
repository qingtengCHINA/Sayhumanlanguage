import type { Metadata } from "next";
import DitherMind from "@/components/DitherMind";

export const metadata: Metadata = {
  title: "Mind 测试 — 讲人话",
  robots: { index: false, follow: false },
};

export default function MindTestPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-page p-8">
      <div className="w-full max-w-md rounded-2xl border border-line bg-surface/90 p-6">
        <div className="flex h-80 items-center justify-center">
          <DitherMind />
        </div>
      </div>
    </div>
  );
}
