# Zalo MiniApp H5 代理补丁包

这个补丁用于你的 Vercel 项目，解决：
1) **CORS**：浏览器跨域被拦（`No 'Access-Control-Allow-Origin'`）。
2) **CSP/Eval**：某些库需要 `eval()` 被 CSP 禁止。

## 文件说明
- `api/bsp.js`：Serverless 代理，把同域 `/api/bsp` 转发到 `https://api.next.bspapp.com/client`。
- `vercel.json`：
  - 先放行 `/api/**`，避免被 SPA 路由重写；
  - 添加 CSP 头，允许 `'unsafe-eval'` 并允许在 Zalo WebView 内嵌。

## 使用
1. 把本压缩包**解压**，把 `api` 文件夹和 `vercel.json` 复制到你仓库 **根目录**（和 `index.html` 同级）。
2. 在代码里把原先请求 `https://api.next.bspapp.com/client` 的位置，改成请求 **`/api/bsp`**。
3. 提交到 GitHub，Vercel 会自动重新部署；或在 Vercel 面板点击 **Redeploy**。
4. 打开浏览器 DevTools，确认网络请求是 `POST /api/bsp` 且返回 200。

## 可选：修改目标地址
如果你的真实接口不是 `/client`，修改 `api/bsp.js` 里的 `target` 变量即可。