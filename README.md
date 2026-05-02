# 讲人话 — 去AI味儿

去除文本中的AI生成痕迹，让文字听起来更自然、更有人味儿。

## 功能

- 粘贴文本或直接拖拽导入 .txt / .md 文件
- 内置 Humanizer-zh 技能系统提示词，自动识别并去除24种AI写作痕迹
- 支持自定义 AI API（默认适配 MiMo API）
- 一键复制改写结果

## 技术栈

- Next.js 14 + TypeScript + Tailwind CSS
- Mastercard 设计系统风格

## 部署到 Vercel

### 1. 上传代码到 GitHub

```bash
git init
git add .
git commit -m "init"
git remote add origin https://github.com/YOUR_USERNAME/jiang-ren-hua.git
git push -u origin main
```

### 2. 在 Vercel 创建项目

1. 访问 [vercel.com](https://vercel.com)，点击 **Add New Project**
2. 导入你的 GitHub 仓库
3. 在 **Environment Variables** 中添加：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `API_URL` | `https://token-plan-sgp.xiaomimimo.com/v1` | MiMo API 地址 |
| `API_KEY` | `your-api-key-here` | 你的 MiMo API Key |
| `MODEL_NAME` | `MiMo-V2.5` | 模型名称 |

4. 点击 **Deploy**

### 3. 本地开发

```bash
npm install
npm run dev
```

打开 http://localhost:3000

## API 说明

接口兼容 OpenAI Chat Completions 格式。默认配置使用 MiMo API：

- Base URL: `https://token-plan-sgp.xiaomimimo.com/v1`
- Model: `MiMo-V2.5`

你也可以在网页的「设置」面板中修改 API 配置，或在 Vercel 环境变量中预设。

## 设计

基于 Mastercard 设计系统：
- Canvas Cream (`#F3F0EE`) 暖色画布背景
- Ink Black (`#141413`) 主色调
- Signal Orange (`#CF4500`) 点缀色
- 圆角药丸形状按钮和导航
- Sofia Sans 字体

## License

MIT
