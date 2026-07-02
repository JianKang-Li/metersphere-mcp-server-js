#!/usr/bin/env node

import { loadConfig, getConfig } from './config.js';
import { startStdio } from './transports/stdio.js';
import { startSse } from './transports/sse.js';

loadConfig();
const config = getConfig();

if (config.mcpType === 'stdio') {
  startStdio().catch((e) => {
    console.error('Failed to start STDIO server:', e);
    process.exit(1);
  });
} else {
  startSse().catch((e) => {
    console.error('Failed to start SSE server:', e);
    process.exit(1);
  });
}
