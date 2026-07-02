import { get, post, postPaged } from '../client/http-client.js';
import { getUrlConstants, isV2 } from '../client/constants.js';
import { fetchAllPagedV2, fetchAllPagedV3 } from '../utils/pagination.js';

/**
 * getApiList MCP 工具实现
 * 获取项目下的 API 列表信息，支持分页、排序、关键词搜索和协议筛选
 * 支持 v2 和 v3 两个版本的 API
 *
 * v3: POST /api/definition/page (分页参数在请求体中)
 * v2: POST /api/definition/list/{goPage}/{pageSize} (分页参数在 URL 中)
 *
 * 支持自动分页：当 pageSize 未设置或为 0 时，自动获取所有数据
 */
export async function getApiList(args) {
  const { projectId, current, pageSize, keyword, protocols } = args;
  const URL_CONSTANTS = getUrlConstants();

  if (!projectId) {
    return {
      content: [{
        type: 'text',
        text: 'Project ID不能为空，可以从 getUser 工具中获取当前用户的项目Id',
      }],
    };
  }

  // 判断是否需要自动分页获取所有数据
  const autoFetchAll = !pageSize;
  const initialPageSize = autoFetchAll ? 100 : (pageSize ?? 10);
  const initialCurrent = current ?? 1;

  if (isV2()) {
    // v2 版本：使用 URL 路径参数分页
    const requestBody = {
      projectId,
    };

    if (keyword) {
      requestBody.name = keyword;
    }
    if (protocols && protocols.length > 0) {
      requestBody.protocol = protocols[0]; // v2 通常只支持单一协议筛选
    }

    if (autoFetchAll) {
      // 自动分页获取所有数据
      return await fetchAllPagedV2(URL_CONSTANTS.API_LIST, requestBody);
    } else {
      // 单页获取
      const result = await postPaged(URL_CONSTANTS.API_LIST, initialCurrent, initialPageSize, requestBody);
      return { content: [{ type: 'text', text: result }] };
    }
  } else {
    // v3 版本：分页参数在请求体中
    const requestBody = {
      current: initialCurrent,
      pageSize: initialPageSize,
      projectId,
      protocols: protocols && protocols.length > 0
        ? protocols
        : ['HTTP', 'MQTT', 'TCP', 'UDP'],
      sort: {},
      combineSearch: {
        searchMode: 'AND',
        conditions: [],
      },
    };

    if (keyword) {
      requestBody.keyword = keyword;
    }

    if (autoFetchAll) {
      // 自动分页获取所有数据
      return await fetchAllPagedV3(URL_CONSTANTS.API_LIST, requestBody);
    } else {
      // 单页获取
      const result = await post(URL_CONSTANTS.API_LIST, requestBody);
      return { content: [{ type: 'text', text: result }] };
    }
  }
}

/**
 * getApiDetail MCP 工具实现
 * 通过 API ID 获取单个 API 的详细信息
 * 支持 v2 和 v3 两个版本的 API
 *
 * v3: GET /api/definition/get-detail/{apiId}
 * v2: GET /api/definition/get/{apiId}
 */
export async function getApiDetail(args) {
  const { apiId } = args;

  if (!apiId) {
    return {
      content: [{
        type: 'text',
        text: 'API ID不能为空，可以从 getApiList 工具中获取API的ID',
      }],
    };
  }

  const URL_CONSTANTS = getUrlConstants();
  const result = await get(URL_CONSTANTS.API_DETAIL + '/' + apiId);
  return { content: [{ type: 'text', text: result }] };
}
