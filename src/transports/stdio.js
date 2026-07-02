import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createMcpServer } from '../server.js';
import { setServerConfig } from '../client/server-config.js';
import { getConfig } from '../config.js';

/**
 * STDIO 传输模式启动
 * 启动时从环境变量注入配置
 */
export async function startStdio() {
  const config = getConfig();

  // STDIO 模式：启动时从环境变量注入配置
  setServerConfig({
    accessKey: config.accessKey,
    secretKey: config.secretKey,
    meterSphereAddress: config.meterSphereUrl,
  });

  const server = createMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // 用 stderr 避免干扰 MCP 协议（STDIO 模式下 stdout 被 MCP 占用）
  console.error('MeterSphere MCP Server (STDIO) started');
}
