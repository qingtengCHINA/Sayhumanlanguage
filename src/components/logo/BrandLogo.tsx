/*
  品牌 logo：言字旁（讠）—— 一笔人写笔画，AI 只剩一个像素方点。
  配色语义：暖白笔画 = 人写的话；青色方点 = AI 痕迹（与水母背景同源）。
  注意：笔画为 stroke 写法，浏览器渲染一致；如需印刷/雕刻主文件，请在矢量编辑器中轮廓化。
*/

export function BrandLogo({
  className,
  style,
  title = "讲人话",
}: {
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
      <rect fill="#67E8F9" x="58" y="38" width="40" height="40" />
      <path
        fill="none"
        stroke="#E7ECF5"
        strokeWidth={40}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M44 122 H114 Q148 122 148 156 V198 L212 134"
      />
    </svg>
  );
}
