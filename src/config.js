import 'dotenv/config';

let config = null;

/**
 * 加载配置，从环境变量和 .env 文件读取
 * STDIO 模式下 accessKey/signature/meterSphereUrl 必填
 * SSE 模式下不要求（由请求头注入）
 * MS_VERSION 用于选择 API 版本：v2 或 v3（默认 v3）
 */
export function loadConfig() {
  config = {
    mcpType: process.env.MCP_TYPE || 'stdio',
    port: parseInt(process.env.PORT || '8001', 10),
    accessKey: process.env.accessKey || '',
    secretKey: process.env.signature || '',
    meterSphereUrl: process.env.meterSphereUrl || '',
    msVersion: process.env.MS_VERSION || 'v3',
  };

  if (config.mcpType === 'stdio') {
    if (!config.accessKey || !config.secretKey || !config.meterSphereUrl) {
      console.error('STDIO 模式下 accessKey、signature 和 meterSphereUrl 必须配置');
      process.exit(1);
    }
  }
}

/**
 * 获取当前配置
 * @returns {object} 配置对象
 */
export function getConfig() {
  if (!config) {
    loadConfig();
  }
  return config;
}
