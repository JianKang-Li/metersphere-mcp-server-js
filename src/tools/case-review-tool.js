import { get, post, postPaged } from '../client/http-client.js';
import { getUrlConstants, isV2 } from '../client/constants.js';
import { fetchAllPagedV2, fetchAllPagedV3 } from '../utils/pagination.js';

/**
 * getReviewList MCP 工具实现
 * 获取项目下的用例评审列表，支持分页、关键词搜索和状态筛选
 * 支持 v2 和 v3 两个版本的 API
 *
 * v3: POST /case/review/page (分页参数在请求体中)
 * v2: POST /test/case/review/list/{goPage}/{pageSize} (分页参数在 URL 中)
 *
 * 支持自动分页：当 pageSize 未设置或为 0 时，自动获取所有数据
 */
export async function getReviewList(args) {
  const { projectId, current, pageSize, keyword, status, reviewId } = args;
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
    if (status) {
      requestBody.status = status;
    }
    if (reviewId) {
      requestBody.id = reviewId;
    }

    if (autoFetchAll) {
      // 自动分页获取所有数据
      return await fetchAllPagedV2(URL_CONSTANTS.CASE_REVIEW_LIST, requestBody);
    } else {
      // 单页获取
      const result = await postPaged(URL_CONSTANTS.CASE_REVIEW_LIST, initialCurrent, initialPageSize, requestBody);
      return { content: [{ type: 'text', text: result }] };
    }
  } else {
    // v3 版本：分页参数在请求体中
    const requestBody = {
      current: initialCurrent,
      pageSize: initialPageSize,
      projectId,
      sort: {},
    };

    if (keyword) {
      requestBody.keyword = keyword;
    }
    if (status) {
      requestBody.status = status;
    }
    if (reviewId) {
      requestBody.reviewId = reviewId;
    }

    if (autoFetchAll) {
      // 自动分页获取所有数据
      return await fetchAllPagedV3(URL_CONSTANTS.CASE_REVIEW_LIST, requestBody);
    } else {
      // 单页获取
      const result = await post(URL_CONSTANTS.CASE_REVIEW_LIST, requestBody);
      return { content: [{ type: 'text', text: result }] };
    }
  }
}

/**
 * getReviewDetail MCP 工具实现
 * 通过评审 ID 获取单个用例评审的详细信息
 * 支持 v2 和 v3 两个版本的 API
 *
 * v3: GET /case/review/detail/{reviewId}
 * v2: GET /test/case/review/get/{reviewId}
 */
export async function getReviewDetail(args) {
  const { reviewId } = args;

  if (!reviewId) {
    return {
      content: [{
        type: 'text',
        text: 'Review ID不能为空，可以从 getReviewList 工具中获取评审的ID',
      }],
    };
  }

  const URL_CONSTANTS = getUrlConstants();
  const result = await get(URL_CONSTANTS.CASE_REVIEW_DETAIL + '/' + reviewId);
  return { content: [{ type: 'text', text: result }] };
}

/**
 * getReviewDetailCasePage MCP 工具实现
 * 获取评审详情中已关联的功能用例列表，支持分页和关键词搜索
 * 支持 v2 和 v3 两个版本的 API
 *
 * v3: POST /case/review/detail/page (分页参数在请求体中)
 * v2: POST /test/review/case/list/{goPage}/{pageSize} (分页参数在 URL 中)
 *
 * 支持自动分页：当 pageSize 未设置或为 0 时，自动获取所有数据
 */
export async function getReviewDetailCasePage(args) {
  const { reviewId, projectId, current, pageSize, keyword, moduleIds } = args;

  if (!reviewId) {
    return {
      content: [{
        type: 'text',
        text: 'Review ID不能为空，可以从 getReviewList 工具中获取评审的ID',
      }],
    };
  }

  const URL_CONSTANTS = getUrlConstants();

  // 判断是否需要自动分页获取所有数据
  const autoFetchAll = !pageSize;
  const initialPageSize = autoFetchAll ? 100 : (pageSize ?? 10);
  const initialCurrent = current ?? 1;

  if (isV2()) {
    // v2 版本：使用 URL 路径参数分页
    const requestBody = {
      reviewId,
    };

    if (projectId) {
      requestBody.projectId = projectId;
    }
    if (keyword) {
      requestBody.name = keyword;
    }
    if (moduleIds && moduleIds.length > 0) {
      requestBody.nodeIds = moduleIds;
    }

    if (autoFetchAll) {
      // 自动分页获取所有数据
      return await fetchAllPagedV2(URL_CONSTANTS.CASE_REVIEW_DETAIL_CASE_PAGE, requestBody);
    } else {
      // 单页获取
      const result = await postPaged(URL_CONSTANTS.CASE_REVIEW_DETAIL_CASE_PAGE, initialCurrent, initialPageSize, requestBody);
      return { content: [{ type: 'text', text: result }] };
    }
  } else {
    // v3 版本：分页参数在请求体中
    const requestBody = {
      reviewId,
      current: initialCurrent,
      pageSize: initialPageSize,
      sort: {},
    };

    if (projectId) {
      requestBody.projectId = projectId;
    }
    if (keyword) {
      requestBody.keyword = keyword;
    }
    if (moduleIds && moduleIds.length > 0) {
      requestBody.moduleIds = moduleIds;
    }

    if (autoFetchAll) {
      // 自动分页获取所有数据
      return await fetchAllPagedV3(URL_CONSTANTS.CASE_REVIEW_DETAIL_CASE_PAGE, requestBody);
    } else {
      // 单页获取
      const result = await post(URL_CONSTANTS.CASE_REVIEW_DETAIL_CASE_PAGE, requestBody);
      return { content: [{ type: 'text', text: result }] };
    }
  }
}

/**
 * getReviewModuleTree MCP 工具实现
 * 获取用例评审的模块树结构，用于按模块浏览评审用例
 * 支持 v2 和 v3 两个版本的 API
 *
 * v3: POST /case/review/module/tree
 * v2: GET /case/node/list/review/{reviewId}
 */
export async function getReviewModuleTree(args) {
  const { projectId, reviewId } = args;
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
    // v2 版本：GET 请求，reviewId 在 URL 中
    if (reviewId) {
      const result = await get(URL_CONSTANTS.CASE_REVIEW_MODULE_TREE + '/' + reviewId);
      return { content: [{ type: 'text', text: result }] };
    } else {
      // 如果没有 reviewId，使用 projectId 获取所有模块
      const result = await get('/case/node/list/' + projectId);
      return { content: [{ type: 'text', text: result }] };
    }
  } else {
    // v3 版本：POST 请求
    const requestBody = {
      projectId,
    };

    if (reviewId) {
      requestBody.reviewId = reviewId;
    }

    const result = await post(URL_CONSTANTS.CASE_REVIEW_MODULE_TREE, requestBody);
    return { content: [{ type: 'text', text: result }] };
  }
}
