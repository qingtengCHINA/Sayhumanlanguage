import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  // 单页工具站：无需 ISR/缓存增量再生成，默认配置即可
});
