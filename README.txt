# Zalo MiniApp / Vercel 代理打包

## 目录
- `assets/proxy.js`：前端补丁，把 `https://api.next.bspapp.com/client/**` 改写为 `/api/bsp/**`
- `api/bsp/[[...path]].js`：Vercel Serverless 代理（支持任意子路径），把 `/api/bsp/**` 转发到真实后端
- `vercel.json`：站点级 Header（CORS + CSP 放宽）

## 使用步骤
1. 把这些文件按原目录复制到你的 GitHub 仓库（根目录）。
2. 编辑你仓库的 `index.html`（或入口 HTML），确保 **在 `assets/index.js` 之前** 插入：
   ```html
   <script src="./assets/proxy.js"></script>
   <script type="module" crossorigin src="./assets/index.js"></script>
   ```
3. 推送到 GitHub，Vercel 会自动重新部署。
4. 打开站点，F12 -> Network：确认原本指向
   `https://api.next.bspapp.com/client/**` 的请求被改写为
   `https://你的域名/api/bsp/**`，且不再有 CORS/CSP 报错。

### 自定义后端地址（可选）
若不是 `https://api.next.bspapp.com/client`，在 Vercel 项目里设置环境变量：

- Key：`BSP_API_URL`
- Value：`https://你的后端根地址`（以 `/client` 结尾的话效果等同于默认值）

## 常见问题
- **空白页 / eval 被拦**：已在 `vercel.json` 里放宽 CSP（包含 `unsafe-eval`），同时前端统一经由同源 `/api/bsp/**` 发起请求。
- **仍报 4xx/5xx**：在 `api/bsp/[[...path]].js` 里按需添加要透传的请求头，或把 `target` 打印出来检查实际转发路径。