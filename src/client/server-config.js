/**
 * ServerConfig 单例状态管理
 * SSE 模式下每次请求注入新配置，STDIO 模式下启动时一次性注入
 * Node.js 单线程，无需并发控制
 */

let serverConfig = null;

/**
 * 设置服务配置
 * @param {object} config - { accessKey, secretKey, meterSphereAddress }
 */
export function setServerConfig(config) {
  serverConfig = config;
}

/**
 * 获取当前服务配置
 * @returns {object|null}
 */
export function getServerConfig() {
  return serverConfig;
}
