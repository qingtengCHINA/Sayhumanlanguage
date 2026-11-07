# 讲人话 — 去AI味儿

去除文本中的 AI 生成痕迹，让文字听起来更自然、更有人味儿。

## 功能

- 粘贴文本或拖拽导入 .txt / .md / .docx 文件
- 内置 Humanizer-zh 系统提示词，自动识别并去除 24 种 AI 写作痕迹
- 一键复制改写结果
- 零配置开箱即用（API Key 由服务端环境变量管理，用户无需任何设置）

## 技术栈

- Next.js 14 + TypeScript + Tailwind CSS
- Oases API 网关（claude-haiku-5-5）
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

在点击 Deploy 之前，展开 **Environment Variables**，添加以下变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `API_KEY` | 你的 Oases API Key | 网关会替换为对应的模型服务商 |
| `MODEL_NAME` | `claude-haiku-5-5` | 模型名称（可选，默认即此值） |

> API Key 仅存储在服务端，前端不会暴露任何敏感信息。

### 4. 点击 Deploy

等 1-2 分钟部署完成，Vercel 会分配一个 `xxx.vercel.app` 域名。

### 5. 自动部署

之后每次 `git push`，Vercel 会自动重新部署。

## 部署到 Cloudflare Workers（可选，国内可达性更好）

```bash
npm install
npm run deploy   # 首次会引导 wrangler login
```

然后在 Cloudflare 控制台：

1. Workers & Pages → `jiang-ren-hua` → Settings → **Variables and Secrets** → 添加 `API_KEY`（类型选 Secret）
2. Settings → **Domains & Routes** → Add Custom Domain → 填子域名（如 `say.qingtengstudio.com`），要求主域名托管在 Cloudflare DNS
3. 也可以在 Workers Builds 里连接 GitHub 仓库实现推送自动部署（构建命令 `npx opennextjs-cloudflare build`）

Vercel 部署仍然保留，两个平台可以并行。

## 本地开发

```bash
npm install
npm run dev
```

本地开发需要创建 `.env.local` 文件：

```
API_KEY=你的Oases API Key
MODEL_NAME=claude-haiku-5-5
```

打开 http://localhost:3000

## API 说明

后端走 Oases 统一网关（OpenAI Chat Completions 兼容协议）：

- Endpoint: `https://api.oases.dev/v1/chat/completions`
- Model: `claude-haiku-5-5`

切换其他模型只需修改 `MODEL_NAME` 环境变量。

## 防护

- 每 IP 每分钟最多 10 次请求（内存限流）
- 输入文本上限 20000 字
- 上游请求 90 秒超时
- 结果被 `max_tokens` 截断时前端会提示

## 设计

基于 Mastercard 设计系统：

- Canvas Cream 暖色画布背景
- Ink Black 主色调
- Signal Orange 点缀色
- 圆角药丸形状按钮和导航
- Geist 字体 + 系统中文字体

## License

MIT
