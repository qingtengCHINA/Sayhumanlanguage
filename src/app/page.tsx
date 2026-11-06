import AmbientWaves from "@/components/AmbientWaves";
import HeroIntro from "@/components/HeroIntro";
import HumanizeWorkspace from "@/components/HumanizeWorkspace";

export default function Home() {
  return (
    <div className="relative min-h-dvh bg-page">
      <AmbientWaves />

      <div className="relative z-10">
        <a
          href="#workspace"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2 focus:text-sm"
        >
          跳到改写区
        </a>

        <header className="glass sticky top-0 z-40 border-b border-line/70 bg-page/75 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
            <a href="#top" className="flex items-center gap-2 text-sm font-medium text-ink">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent text-[11px] font-semibold text-surface">
                话
              </span>
              讲人话
            </a>
            <nav className="flex items-center gap-6 text-sm text-muted">
              <a
                href="#workspace"
                className="hidden transition-colors duration-160 ease-out hover:text-ink sm:inline"
              >
                改写
              </a>
              <a href="#how" className="transition-colors duration-160 ease-out hover:text-ink">
                会改掉什么
              </a>
            </nav>
          </div>
        </header>

        <main id="top">
          <section className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-6xl flex-col justify-start px-5 pb-16 pt-10 md:px-8">
            <div className="grid w-full items-center gap-10 lg:grid-cols-12 lg:gap-12">
              <HeroIntro />
              <div className="lg:col-span-7">
                <HumanizeWorkspace />
              </div>
            </div>
          </section>

          <section
            id="how"
            className="mx-auto max-w-6xl scroll-mt-24 border-t border-line/80 px-5 pb-24 pt-16 md:px-8"
          >
            <h2 className="text-2xl font-medium leading-[1.25] text-ink md:text-3xl">
              会改掉什么
            </h2>
            <p className="mt-3 max-w-xl text-base leading-[1.75] text-muted">
              按 Humanizer-zh 的痕迹清单重写，只交回正文，不附评分。
            </p>

            <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-6">
              <article className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-6 md:col-span-4">
                <div>
                  <p className="font-mono text-xs text-accent">对照</p>
                  <h3 className="mt-2 text-lg font-medium text-ink">套话进，句子出</h3>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <blockquote className="rounded-xl bg-page p-4 text-sm leading-[1.75] text-muted">
                    此外，本次更新作为公司致力于创新的证明，提供了无缝、直观和强大的体验。
                  </blockquote>
                  <blockquote className="rounded-xl border border-accent/25 bg-page p-4 text-sm leading-[1.75] text-ink">
                    更新加了批处理和离线模式。测试用户多数反馈任务完成更快。
                  </blockquote>
                </div>
              </article>

              <article className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-6 md:col-span-2">
                <div>
                  <p className="font-mono text-xs text-muted">导入</p>
                  <h3 className="mt-2 text-lg font-medium text-ink">拖进文件即可</h3>
                  <p className="mt-2 text-sm leading-[1.75] text-muted">
                    纯文本、Markdown、Word。解析在浏览器里完成。
                  </p>
                </div>
                <p className="mt-6 font-mono text-xs text-ink">.txt · .md · .doc · .docx</p>
              </article>

              <article className="rounded-2xl border border-line bg-surface p-6 md:col-span-2">
                <h3 className="text-lg font-medium text-ink">痕迹清单</h3>
                <p className="mt-2 text-sm leading-[1.75] text-muted">
                  三段式、破折号、宣传腔、模糊归因，以及另外二十来种。
                </p>
              </article>

              <article className="rounded-2xl border border-line bg-surface p-6 md:col-span-2">
                <h3 className="text-lg font-medium text-ink">密钥不进页面</h3>
                <p className="mt-2 text-sm leading-[1.75] text-muted">
                  模型请求走服务端。浏览器只提交原文。
                </p>
              </article>

              <article className="rounded-2xl bg-ink p-6 text-surface md:col-span-2">
                <h3 className="text-lg font-medium">直接复制</h3>
                <p className="mt-2 text-sm leading-[1.75] text-surface/70">
                  结果区只有改写后的文章，没有总结，没有分数。
                </p>
              </article>
            </div>
          </section>
        </main>

        <footer className="bg-ink py-12 text-surface">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-5 text-center md:px-8">
            <p className="flex items-center gap-2 text-sm font-medium">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent text-[11px] text-surface">
                话
              </span>
              讲人话
            </p>
            <p className="text-xs leading-[1.7] text-surface/55">
              基于{" "}
              <a
                href="https://github.com/op7418/Humanizer-zh"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-surface/30 underline-offset-2 hover:text-surface"
              >
                Humanizer-zh
              </a>
              ，由{" "}
              <a
                href="https://qingtengstudio.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-surface/30 underline-offset-2 hover:text-surface"
              >
                QingTengStudio
              </a>{" "}
              制作
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
