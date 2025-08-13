/**
 * assets/proxy.js
 * 目的：把发往 https://api.next.bspapp.com/client/** 的请求改写为 /api/bsp/**，
 * 这样浏览器 -> 你的域名（同源） -> Vercel Serverless 代理 -> 真实后端
 * 避免 CORS & CSP 问题。
 */
(function () {
  var TARGET = "https://api.next.bspapp.com/client";
  var PROXY  = "/api/bsp";

  function toProxy(url) {
    try {
      if (typeof url === "string" && url.indexOf(TARGET) === 0) {
        var tail = url.slice(TARGET.length);
        return PROXY + tail;
      }
    } catch (e) {}
    return url;
  }

  // 1) 劫持 fetch
  if (typeof window.fetch === "function") {
    var _fetch = window.fetch;
    window.fetch = function (input, init) {
      try {
        if (typeof input === "string") {
          input = toProxy(input);
        } else if (input && input.url) {
          var u = toProxy(input.url);
          if (u !== input.url) {
            // 重新构造一个 Request，避免某些浏览器只读属性问题
            input = new Request(u, input);
          }
        }
      } catch (e) {}
      return _fetch.call(this, input, init);
    };
  }

  // 2) 劫持 XHR
  if (typeof window.XMLHttpRequest === "function") {
    var _open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url) {
      url = toProxy(url);
      return _open.apply(this, [method, url].concat([].slice.call(arguments, 2)));
    };
  }
})();