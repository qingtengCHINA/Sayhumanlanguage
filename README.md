# 讲人话 — 去AI味儿

去除文本中的 AI 生成痕迹，让文字听起来更自然、更有人味儿。

## 功能

- 粘贴文本或拖拽导入 .txt / .md 文件
- 内置 Humanizer-zh 系统提示词，自动识别并去除 24 种 AI 写作痕迹
- 一键复制改写结果
- 零配置开箱即用（API Key 由服务端环境变量管理，用户无需任何设置）

## 技术栈

- Next.js 14 + TypeScript + Tailwind CSS
- MiMo API（小米 MiMo-V2.5 模型）
- Mastercard 设计系统风格（暖色画布、药丸按钮、圆角卡片）

## 部署到 Vercel

### 1. Push 到 GitHub

```bash
git init
git add .
git commit -m "init"
git remote add origin https://github.com/YOUR_USERNAME/jiang-ren-hua.git
git push -u origin main
```

### 2. 在 Vercel 导入项目

1. 访问 [vercel.com](https://vercel.com)，用 GitHub 账号登录
2. 点击 **Add New → Project**，导入你的仓库

### 3. 配置环境变量

在点击 Deploy 之前，展开 **Environment Variables**，添加以下三个变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `API_URL` | `https://token-plan-sgp.xiaomimimo.com/v1` | MiMo API 地址 |
| `API_KEY` | 你的 API Key | 从 [MiMo 平台](https://platform.xiaomimimo.com) 获取 |
| `MODEL_NAME` | `MiMo-V2.5` | 模型名称 |

> API Key 仅存储在服务端，前端不会暴露任何敏感信息。

### 4. 点击 Deploy

等 1-2 分钟部署完成，Vercel 会分配一个 `xxx.vercel.app` 域名。

### 5. 自动部署

之后每次 `git push`，Vercel 会自动重新部署。

## 本地开发

```bash
npm install
npm run dev
```

本地开发需要创建 `.env.local` 文件：

```
API_URL=https://token-plan-sgp.xiaomimimo.com/v1
API_KEY=你的API Key
MODEL_NAME=MiMo-V2.5
```

打开 http://localhost:3000

## API 说明

后端接口兼容 OpenAI Chat Completions 格式，默认使用 MiMo API：

- Base URL: `https://token-plan-sgp.xiaomimimo.com/v1`
- Model: `MiMo-V2.5`

切换其他 OpenAI 兼容的模型只需修改环境变量即可。

## 设计

基于 Mastercard 设计系统：

- Canvas Cream (`#F3F0EE`) 暖色画布背景
- Ink Black (`#141413`) 主色调
- Signal Orange (`#CF4500`) 点缀色
- 圆角药丸形状按钮和导航
- Sofia Sans 字体

## License

MIT
