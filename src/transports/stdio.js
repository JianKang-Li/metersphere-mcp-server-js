import process from 'node:process';
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

  // 监听 stdin 关闭（Claude Code 断开连接时触发），确保进程正常退出
  // 不监听 close 事件：SDK 的 readline 结束后 stdin 处于 'ended' 状态
  // 但 process.stdin 还有一个 ref 阻止事件循环退出
  // 注册 end 事件确保进程可以被自然回收
  process.stdin.on('end', () => {
    console.error('STDIO 连接已关闭，进程退出');
    process.exit(0);
  });

  // 信号处理：收到终止信号时优雅退出
  const shutdown = () => {
    console.error('收到终止信号，MeterSphere MCP Server 退出');
    process.exit(0);
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}
