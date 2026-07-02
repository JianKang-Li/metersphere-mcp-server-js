import { setServerConfig } from '../client/server-config.js';

/**
 * SSE 模式鉴权中间件
 * 与 Java 版 ApiKeyFilter.java 逻辑一致
 * 仅对 /sse 端点进行验证，从请求头提取 AK/SK/URL 并注入到 ServerConfig
 */
export function apiKeyFilter(req, res, next) {
  // 仅对 /sse 端点进行验证
  if (req.url === '/sse' || req.url?.split('?')[0] === '/sse') {
    // HTTP 请求头名称在 Node.js http 模块中自动转为小写
    const accessKey = req.headers['accesskey'];
    const signature = req.headers['signature'];
    const meterSphereUrl = req.headers['metersphereurl'];

    if (!accessKey || !signature) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '缺少API访问密钥或签名' }));
      return;
    }

    // Java 版中 signature 请求头的值实际是 secretKey
    setServerConfig({
      accessKey,
      secretKey: signature,
      meterSphereAddress: meterSphereUrl || '',
    });
  }
  next();
}
