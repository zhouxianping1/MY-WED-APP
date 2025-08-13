// /api/bsp.js
// Vercel Serverless 代理：把同域 /api/bsp 的请求转发到 https://api.next.bspapp.com/client
// 作用：绕过浏览器 CORS，支持 GET/POST/OPTIONS，并透传常用头部。

export default async function handler(req, res) {
  const target = 'https://api.next.bspapp.com/client'; // 如需其它 BSP 路径，在此修改

  // 预检请求直接放行
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.status(204).end();
    return;
  }

  // 仅转发常用的安全头
  const headers = new Headers();
  const allowList = ['content-type', 'authorization', 'x-requested-with'];
  for (const [k, v] of Object.entries(req.headers || {})) {
    if (allowList.includes(k.toLowerCase())) headers.set(k, v);
  }

  const init = {
    method: req.method,
    headers,
    body: ['GET','HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body ?? {})
  };

  try {
    const r = await fetch(target, init);
    const text = await r.text();

    // 加上跨域放行头（对浏览器友好）
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Expose-Headers', '*');

    // 透传后端的 content-type
    const ct = r.headers.get('content-type') || 'application/json; charset=utf-8';
    res.setHeader('Content-Type', ct);
    res.status(r.status).send(text);
  } catch (e) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(502).json({ error: 'proxy_failed', message: String(e) });
  }
}