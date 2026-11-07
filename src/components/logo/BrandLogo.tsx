/*
  品牌 Logo 三个候选方向（检查点阶段并存，选定后删除落选者）。
  配色语义：暖白 = 人写的部分；青 #67E8F9 = AI 像素（与水母背景同源）；
  橙 #D4501F = 品牌主色 = 提炼出的"人话"。
  注意：方向 B 的笔画为 stroke 写法（浏览器渲染无碍），交付矢量主文件时需轮廓化。
*/

export type LogoVariant = "a" | "b" | "c";

export function BrandLogo({
  variant,
  className,
  style,
  title = "讲人话",
}: {
  variant: LogoVariant;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 256 256"
      role="img"
      aria-labelledby={title ? "brand-logo-title" : undefined}
      className={className}
      style={style}
    >
      {title ? <title id="brand-logo-title">{title}</title> : null}
      {variant === "a" ? (
        <>
          <path
            fill="#E7ECF5"
            d="M128 32 H68 Q32 32 32 68 V152 H68 V72 Q68 68 72 68 H128 Z"
          />
          <path
            fill="#E7ECF5"
            d="M128 224 H188 Q224 224 224 188 V104 H188 V184 Q188 188 184 188 H128 Z"
          />
          <circle fill="#D4501F" cx="128" cy="128" r="32" />
        </>
      ) : null}
      {variant === "b" ? (
        <>
          <rect fill="#67E8F9" x="58" y="38" width="40" height="40" />
          <path
            fill="none"
            stroke="#E7ECF5"
            strokeWidth={40}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M44 122 H114 Q148 122 148 156 V198 L212 134"
          />
        </>
      ) : null}
      {variant === "c" ? (
        <>
          <rect fill="#67E8F9" x="36" y="36" width="56" height="56" />
          <rect fill="#E7ECF5" x="108" y="108" width="56" height="56" rx="16" />
          <circle fill="#D4501F" cx="192" cy="192" r="28" />
        </>
      ) : null}
    </svg>
  );
}

/** favicon / 收藏夹用的单色版本：橙色圆角底 + 全白符号（三个方向共用逻辑） */
export function BrandFaviconTile({
  variant,
  className,
  style,
}: {
  variant: LogoVariant;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg viewBox="0 0 256 256" role="img" aria-label="讲人话" className={className} style={style}>
      <rect width="256" height="256" rx="56" fill="#D4501F" />
      {variant === "a" ? (
        <>
          <path
            fill="#FFFFFF"
            d="M124 52 H72 Q44 52 44 80 V148 H76 V88 Q76 84 80 84 H124 Z"
          />
          <path
            fill="#FFFFFF"
            d="M132 204 H184 Q212 204 212 176 V108 H180 V172 Q180 176 176 176 H132 Z"
          />
          <circle fill="#FFFFFF" cx="128" cy="128" r="30" />
        </>
      ) : null}
      {variant === "b" ? (
        <>
          <rect fill="#FFFFFF" x="62" y="42" width="38" height="38" />
          <path
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={38}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M48 124 H116 Q148 124 148 156 V196 L210 136"
          />
        </>
      ) : null}
      {variant === "c" ? (
        <>
          <rect fill="#FFFFFF" x="44" y="44" width="52" height="52" />
          <rect fill="#FFFFFF" x="110" y="110" width="52" height="52" rx="14" />
          <circle fill="#FFFFFF" cx="188" cy="188" r="26" />
        </>
      ) : null}
    </svg>
  );
}
