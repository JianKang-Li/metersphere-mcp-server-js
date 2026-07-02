import { get, post, postPaged } from '../client/http-client.js';
import { getUrlConstants, isV2 } from '../client/constants.js';
import { fetchAllPagedV2, fetchAllPagedV3 } from '../utils/pagination.js';

/**
 * getCaseList MCP 工具实现
 * 获取项目下的功能用例列表，支持分页、关键词搜索和模块筛选
 * 支持 v2 和 v3 两个版本的 API
 *
 * v3: POST /functional/case/page (分页参数在请求体中)
 * v2: POST /test/case/list/{goPage}/{pageSize} (分页参数在 URL 中)
 *
 * 支持自动分页：当 fetchAll=true 或 pageSize 未设置/为 0 时，自动获取所有数据
 */
export async function getCaseList(args) {
  const { projectId, current, pageSize, keyword, moduleId, moduleIds, fetchAll } = args;
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
  // fetchAll=true 明确要求获取全部，或者 pageSize 未设置/为 0 时自动获取全部
  const autoFetchAll = fetchAll === true || !pageSize;
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
    if (moduleId) {
      requestBody.nodeId = moduleId;
    }
    if (moduleIds && moduleIds.length > 0) {
      requestBody.nodeIds = moduleIds;
    }

    if (autoFetchAll) {
      // 自动分页获取所有数据
      return await fetchAllPagedV2(URL_CONSTANTS.FUNCTIONAL_CASE_LIST, requestBody);
    } else {
      // 单页获取
      const result = await postPaged(URL_CONSTANTS.FUNCTIONAL_CASE_LIST, initialCurrent, initialPageSize, requestBody);
      return { content: [{ type: 'text', text: result }] };
    }
  } else {
    // v3 版本：分页参数在请求体中
    const requestBody = {
      current: initialCurrent,
      pageSize: initialPageSize,
      projectId,
      sort: {},
      combineSearch: {
        searchMode: 'AND',
        conditions: [],
      },
    };

    if (keyword) {
      requestBody.keyword = keyword;
    }
    if (moduleId) {
      requestBody.moduleId = moduleId;
    }
    if (moduleIds && moduleIds.length > 0) {
      requestBody.moduleIds = moduleIds;
    }

    if (autoFetchAll) {
      // 自动分页获取所有数据
      return await fetchAllPagedV3(URL_CONSTANTS.FUNCTIONAL_CASE_LIST, requestBody);
    } else {
      // 单页获取
      const result = await post(URL_CONSTANTS.FUNCTIONAL_CASE_LIST, requestBody);
      return { content: [{ type: 'text', text: result }] };
    }
  }
}

/**
 * getCaseDetail MCP 工具实现
 * 通过用例 ID 获取单个功能用例的详细信息
 * 支持 v2 和 v3 两个版本的 API
 *
 * v3: GET /functional/case/detail/{caseId}
 * v2: GET /test/case/get/{caseId}
 */
export async function getCaseDetail(args) {
  const { caseId } = args;

  if (!caseId) {
    return {
      content: [{
        type: 'text',
        text: 'Case ID不能为空，可以从 getCaseList 工具中获取用例的ID',
      }],
    };
  }

  const URL_CONSTANTS = getUrlConstants();
  const result = await get(URL_CONSTANTS.FUNCTIONAL_CASE_DETAIL + '/' + caseId);
  return { content: [{ type: 'text', text: result }] };
}

/**
 * getCaseModuleTree MCP 工具实现
 * 获取功能用例的模块树结构，用于按模块浏览用例
 * 支持 v2 和 v3 两个版本的 API
 *
 * v3: POST /functional/case/module/tree
 * v2: GET /case/node/list/{projectId}
 */
export async function getCaseModuleTree(args) {
  const { projectId } = args;
  const URL_CONSTANTS = getUrlConstants();

  if (!projectId) {
    return {
      content: [{
        type: 'text',
        text: 'Project ID不能为空，可以从 getUser 工具中获取当前用户的项目Id',
      }],
    };
  }

  if (isV2()) {
    // v2 版本：GET 请求，projectId 在 URL 中
    const result = await get(URL_CONSTANTS.FUNCTIONAL_CASE_MODULE_TREE + '/' + projectId);
    return { content: [{ type: 'text', text: result }] };
  } else {
    // v3 版本：POST 请求，projectId 在请求体中
    const requestBody = { projectId };
    const result = await post(URL_CONSTANTS.FUNCTIONAL_CASE_MODULE_TREE, requestBody);
    return { content: [{ type: 'text', text: result }] };
  }
}

/**
 * getCaseModuleCount MCP 工具实现
 * 获取各模块下的功能用例数量统计
 * 支持 v2 和 v3 两个版本的 API
 *
 * v3: POST /functional/case/module/count
 * v2: GET /case/node/trashCount/{projectId} (替代方案，获取回收站数量)
 */
export async function getCaseModuleCount(args) {
  const { projectId } = args;
  const URL_CONSTANTS = getUrlConstants();

  if (!projectId) {
    return {
      content: [{
        type: 'text',
        text: 'Project ID不能为空，可以从 getUser 工具中获取当前用户的项目Id',
      }],
    };
  }

  if (isV2()) {
    // v2 版本：没有直接的模块数量统计接口，使用 trashCount 替代
    // 注意：trashCount 只返回回收站数量，不是模块统计
    const result = await get(URL_CONSTANTS.FUNCTIONAL_CASE_MODULE_COUNT + '/' + projectId);
    return { content: [{ type: 'text', text: result }] };
  } else {
    // v3 版本：POST 请求
    const requestBody = { projectId };
    const result = await post(URL_CONSTANTS.FUNCTIONAL_CASE_MODULE_COUNT, requestBody);
    return { content: [{ type: 'text', text: result }] };
  }
}
