"use client";

import dynamic from "next/dynamic";

const LineWaves = dynamic(() => import("@/components/LineWaves"), {
  ssr: false,
});

export default function AmbientWaves() {
  return (
    <LineWaves
      speed={0.12}
      innerLineCount={22}
      outerLineCount={28}
      warpIntensity={0.7}
      rotation={-38}
      edgeFadeWidth={0.12}
      colorCycleSpeed={0.4}
      brightness={0.07}
      color1="#CFCCC4"
      color2="#B8431F"
      color3="#5E5B55"
      enableMouseInteraction={true}
      mouseInfluence={1.2}
    />
  );
}
