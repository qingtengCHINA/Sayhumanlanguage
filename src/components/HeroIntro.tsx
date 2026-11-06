"use client";

import { motion, useReducedMotion } from "motion/react";
import ShinyText from "@/components/ShinyText";

const enter = { duration: 0.5, ease: [0.23, 1, 0.32, 1] as const };

export default function HeroIntro() {
  const reduce = useReducedMotion();

  return (
    <div className="flex flex-col items-start lg:col-span-5">
      <motion.p
        initial={reduce ? false : { opacity: 0, transform: "translateY(12px)" }}
        animate={{ opacity: 1, transform: "translateY(0px)" }}
        transition={enter}
        className="text-sm text-muted"
      >
        文本去味
      </motion.p>
      <motion.h1
        initial={reduce ? false : { opacity: 0, transform: "translateY(16px)" }}
        animate={{ opacity: 1, transform: "translateY(0px)" }}
        transition={{ ...enter, delay: reduce ? 0 : 0.08 }}
        className="mt-3 text-balance text-4xl font-medium leading-[1.15] text-ink md:text-5xl"
      >
        讲人话
      </motion.h1>
      <motion.p
        initial={reduce ? false : { opacity: 0, transform: "translateY(16px)" }}
        animate={{ opacity: 1, transform: "translateY(0px)" }}
        transition={{ ...enter, delay: reduce ? 0 : 0.16 }}
        className="mt-4 max-w-md text-base leading-[1.75] text-muted md:text-lg"
      >
        <ShinyText
          text="去掉套话、三段式和宣传腔，留下能读的句子。"
          speed={3}
          delay={1.2}
          color="#5E5B55"
          shineColor="#B8431F"
          spread={120}
          direction="left"
        />
      </motion.p>
      <motion.div
        initial={reduce ? false : { opacity: 0, transform: "translateY(16px)" }}
        animate={{ opacity: 1, transform: "translateY(0px)" }}
        transition={{ ...enter, delay: reduce ? 0 : 0.24 }}
        className="mt-8 flex flex-wrap items-center gap-3"
      >
        <a
          href="#workspace"
          className="inline-flex items-center justify-center rounded-pill bg-accent px-5 py-2.5 text-sm font-medium text-surface transition-[transform,background-color] duration-160 ease-out hover:bg-accent-hover active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          开始改写
        </a>
        <a
          href="#how"
          className="inline-flex items-center justify-center rounded-pill border border-line bg-surface/70 px-5 py-2.5 text-sm font-medium text-ink transition-[transform,background-color] duration-160 ease-out hover:bg-surface active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          会改掉什么
        </a>
      </motion.div>
    </div>
  );
}
