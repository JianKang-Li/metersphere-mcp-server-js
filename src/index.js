#!/usr/bin/env node

import process from 'node:process';
import { loadConfig, getConfig } from './config.js';
import { startStdio } from './transports/stdio.js';
import { startSse } from './transports/sse.js';

loadConfig();
const config = getConfig();

// 全局错误处理器：防止未捕获异常导致进程崩溃（Claude Code 会显示"连接断开"）
process.on('unhandledRejection', (reason) => {
  console.error('未处理的 Promise 拒绝，请检查代码:', reason);
});
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常，请检查代码:', error);
});

if (config.mcpType === 'stdio') {
  startStdio().catch((e) => {
    console.error('启动 STDIO 服务器失败:', e);
    process.exit(1);
  });
} else {
  startSse().catch((e) => {
    console.error('启动 SSE 服务器失败:', e);
    process.exit(1);
  });
}
