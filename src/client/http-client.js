import { generateSignature } from './auth.js';
import { getServerConfig } from './server-config.js';

/**
 * MeterSphere HTTP 客户端
 * 封装对 MeterSphere 后端的所有 HTTP 调用，自动附加鉴权头
 * 与 Java 版 MsHttpClient.java 逻辑一致
 * 支持 v2 和 v3 两个版本的 API
 */

const CONTENT_TYPE_JSON = 'application/json';
const TIMEOUT_MS = 10000;

/**
 * 构建完整的 URL
 * @param {string} endpoint - API 端点路径
 * @returns {string} 完整 URL
 */
export function buildUrl(endpoint) {
  const config = getServerConfig();
  if (!config || !config.meterSphereAddress) {
    throw new Error('服务器配置不能为空');
  }
  const base = config.meterSphereAddress.replace(/\/+$/, '');
  const path = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
  return base + path;
}

/**
 * 构建带分页参数的 URL（用于 v2 版本 API）
 * v2 版本使用 URL 路径参数: /list/{goPage}/{pageSize}
 * @param {string} endpoint - API 端点路径（不含分页参数）
 * @param {number} goPage - 页码（从1开始）
 * @param {number} pageSize - 每页大小
 * @returns {string} 完整 URL
 */
export function buildPagedUrl(endpoint, goPage, pageSize) {
  const page = goPage ?? 1;
  const size = pageSize ?? 10;
  return buildUrl(`${endpoint}/${page}/${size}`);
}

/**
 * 获取鉴权请求头
 * @returns {object} 包含 accessKey 和 signature 的请求头对象
 */
function getAuthHeaders() {
  const config = getServerConfig();
  if (!config) {
    throw new Error('服务器配置不存在');
  }
  if (!config.meterSphereAddress || !config.accessKey || !config.secretKey) {
    throw new Error('服务地址、AccessKey或SecretKey不能为空');
  }
  return {
    accessKey: config.accessKey,
    signature: generateSignature(config.accessKey, config.secretKey),
  };
}

/**
 * 处理 HTTP 响应
 * @param {Response} res - fetch Response 对象
 * @returns {Promise<string>} 响应内容或错误信息
 */
async function handleResponse(res) {
  const body = await res.text();
  if (res.status === 200) {
    return body || '未查到任何数据';
  } else if (res.status >= 400 && res.status < 500) {
    return `参数错误，HTTP状态码：${res.status}，错误信息：${body}`;
  } else {
    return `连接失败，HTTP状态码：${res.status}`;
  }
}

/**
 * 发送 GET 请求
 * @param {string} endpoint - API 端点路径
 * @returns {Promise<string>} 响应内容或错误信息
 */
export async function get(endpoint) {
  try {
    const url = buildUrl(endpoint);
    const authHeaders = getAuthHeaders();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: CONTENT_TYPE_JSON,
        'Content-Type': CONTENT_TYPE_JSON,
        ...authHeaders,
      },
      signal: controller.signal,
    });
    clearTimeout(timer);
    return await handleResponse(res);
  } catch (e) {
    return '请求失败: ' + e.message;
  }
}

/**
 * 发送 POST 请求
 * @param {string} endpoint - API 端点路径
 * @param {object} body - 请求体对象
 * @returns {Promise<string>} 响应内容或错误信息
 */
export async function post(endpoint, body) {
  try {
    const url = buildUrl(endpoint);
    const authHeaders = getAuthHeaders();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: CONTENT_TYPE_JSON,
        'Content-Type': CONTENT_TYPE_JSON,
        ...authHeaders,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    clearTimeout(timer);
    return await handleResponse(res);
  } catch (e) {
    return '请求失败: ' + e.message;
  }
}

/**
 * 发送带分页参数的 POST 请求（用于 v2 版本 API）
 * v2 版本分页参数通过 URL 路径传递: /list/{goPage}/{pageSize}
 * @param {string} endpoint - API 端点路径（不含分页参数）
 * @param {number} goPage - 页码（从1开始）
 * @param {number} pageSize - 每页大小
 * @param {object} body - 请求体对象
 * @returns {Promise<string>} 响应内容或错误信息
 */
export async function postPaged(endpoint, goPage, pageSize, body) {
  try {
    const url = buildPagedUrl(endpoint, goPage, pageSize);
    const authHeaders = getAuthHeaders();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: CONTENT_TYPE_JSON,
        'Content-Type': CONTENT_TYPE_JSON,
        ...authHeaders,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    clearTimeout(timer);
    return await handleResponse(res);
  } catch (e) {
    return '请求失败: ' + e.message;
  }
}
