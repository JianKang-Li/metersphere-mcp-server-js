import http from 'node:http';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { createMcpServer } from '../server.js';
import { apiKeyFilter } from '../middleware/api-key-filter.js';
import { getConfig } from '../config.js';

/**
 * SSE 传输模式启动
 * 使用 Node.js 内置 http 模块创建服务器
 * 手动管理 sessionId → transport 映射
 */
export async function startSse() {
  const config = getConfig();
  const port = config.port;

  // sessionId -> { server, transport }
  const sessions = new Map();

  const httpServer = http.createServer(async (req, res) => {
    // 应用鉴权中间件
    apiKeyFilter(req, res, async () => {
      const urlPath = req.url?.split('?')[0];

      if (req.method === 'GET' && urlPath === '/sse') {
        // 建立 SSE 连接
        const server = createMcpServer();
        const transport = new SSEServerTransport('/message', res);
        sessions.set(transport.sessionId, { server, transport });

        // 连接关闭时清理
        server.server.onclose = () => {
          sessions.delete(transport.sessionId);
        };

        await server.connect(transport);
      } else if (req.method === 'POST' && urlPath === '/message') {
        // 处理客户端 POST 消息
        const sessionId = req.headers['mcp-session-id'];
        const session = sessions.get(sessionId);
        if (session) {
          await session.transport.handlePostMessage(req, res);
        } else {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'No session found' }));
        }
      } else {
        res.writeHead(404);
        res.end();
      }
    });
  });

  httpServer.listen(port, () => {
    console.error(`MeterSphere MCP Server (SSE) listening on port ${port}`);
  });
}
