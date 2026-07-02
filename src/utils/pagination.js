import { post, postPaged } from '../client/http-client.js';

/**
 * 自动分页获取公共模块
 * 抽取各 tool 中重复的自动分页逻辑，统一处理 v2/v3 两套分页方式
 *
 * v2: 分页参数通过 URL 路径传递（/list/{goPage}/{pageSize}）
 * v3: 分页参数在请求体中（current/pageSize）
 *
 * 每页固定 100 条，循环获取所有页后合并为完整响应
 */

const PAGE_SIZE = 100;

/**
 * 构造 MCP 文本响应
 * @param {string} text - 响应文本
 * @returns {object} MCP 标准响应对象
 */
function textResponse(text) {
  return { content: [{ type: 'text', text }] };
}

/**
 * 解析分页响应，提取数据与总条数
 * 响应格式：{ success, data: { listObject, itemCount } }
 * @param {string} result - HTTP 响应文本
 * @returns {{ ok: boolean, items: Array, totalCount: number, raw: string }}
 *   ok 为 false 时表示失败或非 JSON 响应，调用方应直接返回 raw
 */
function parsePageResult(result) {
  let data;
  try {
    data = JSON.parse(result);
  } catch {
    // 非 JSON 响应（如网络错误的纯文本 '请求失败: xxx'），直接透传
    return { ok: false, items: [], totalCount: 0, raw: result };
  }

  if (!data.success || !data.data) {
    return { ok: false, items: [], totalCount: 0, raw: result };
  }

  return {
    ok: true,
    items: data.data.listObject || [],
    totalCount: data.data.itemCount || 0,
    raw: result,
  };
}

/**
 * 构造合并后的完整响应
 * 字段结构与 MeterSphere 单页响应保持一致
 * @param {Array} allItems - 所有页合并后的数据
 * @returns {object} MCP 文本响应
 */
function buildFullResponse(allItems) {
  const fullResponse = {
    success: true,
    message: null,
    data: {
      listObject: allItems,
      itemCount: allItems.length,
      pageSize: PAGE_SIZE,
      currentPage: 1,
      pageCount: 1,
    },
  };
  return textResponse(JSON.stringify(fullResponse));
}

/**
 * 自动分页获取所有数据（v2 版本）
 * v2 分页参数通过 URL 路径传递: /list/{goPage}/{pageSize}
 * @param {string} endpoint - API 端点路径（不含分页参数）
 * @param {object} requestBody - 请求体
 * @returns {Promise<object>} 包含所有数据的 MCP 响应
 */
export async function fetchAllPagedV2(endpoint, requestBody) {
  const allItems = [];
  let currentPage = 1;
  let totalPages = 1;

  do {
    const result = await postPaged(endpoint, currentPage, PAGE_SIZE, requestBody);
    const parsed = parsePageResult(result);
    if (!parsed.ok) {
      // 失败或非 JSON 响应，直接返回原始内容
      return textResponse(result);
    }

    allItems.push(...parsed.items);

    // 从第一次请求中获取总页数
    if (currentPage === 1) {
      totalPages = Math.ceil(parsed.totalCount / PAGE_SIZE);
    }

    currentPage++;
  } while (currentPage <= totalPages);

  return buildFullResponse(allItems);
}

/**
 * 自动分页获取所有数据（v3 版本）
 * v3 分页参数在请求体中: current/pageSize
 * @param {string} endpoint - API 端点路径
 * @param {object} requestBodyTemplate - 请求体模板（不含分页参数）
 * @returns {Promise<object>} 包含所有数据的 MCP 响应
 */
export async function fetchAllPagedV3(endpoint, requestBodyTemplate) {
  const allItems = [];
  let currentPage = 1;
  let totalPages = 1;

  do {
    const requestBody = {
      ...requestBodyTemplate,
      current: currentPage,
      pageSize: PAGE_SIZE,
    };

    const result = await post(endpoint, requestBody);
    const parsed = parsePageResult(result);
    if (!parsed.ok) {
      // 失败或非 JSON 响应，直接返回原始内容
      return textResponse(result);
    }

    allItems.push(...parsed.items);

    // 从第一次请求中获取总页数
    if (currentPage === 1) {
      totalPages = Math.ceil(parsed.totalCount / PAGE_SIZE);
    }

    currentPage++;
  } while (currentPage <= totalPages);

  return buildFullResponse(allItems);
}
