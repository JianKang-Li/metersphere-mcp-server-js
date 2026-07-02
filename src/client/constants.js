/**
 * MeterSphere API 端点常量
 * 支持通过环境变量 MS_VERSION 切换 v2 和 v3 两套 API
 * MS_VERSION=v2 使用 MeterSphere 2.x 版本接口
 * MS_VERSION=v3 使用 MeterSphere 3.x 版本接口（默认）
 */

/**
 * MeterSphere v2.x API 端点
 */
export const MS_V2_CONSTANTS = {
  /** 身份验证，返回用户 ID */
  VALIDATE: '/api/user/key/validate',
  /** 获取用户详情 */
  USER_DETAIL: '/api/user/info?userId=',

  // ---- API 定义 ----
  /** 分页获取 API 列表 (URL路径参数: /list/{goPage}/{pageSize}) */
  API_LIST: '/api/api/definition/list',
  /** 获取 API 详情 */
  API_DETAIL: '/api/api/definition/get',

  // ---- 用例评审 ----
  /** 分页获取用例评审列表 (URL路径参数: /list/{goPage}/{pageSize}) */
  CASE_REVIEW_LIST: '/track/test/case/review/list',
  /** 获取用例评审详情 */
  CASE_REVIEW_DETAIL: '/track/test/case/review/get',
  /** 评审详情-分页获取已关联用例列表 (URL路径参数: /list/{goPage}/{pageSize}) */
  CASE_REVIEW_DETAIL_CASE_PAGE: '/track/test/review/case/list',
  /** 获取评审模块树 */
  CASE_REVIEW_MODULE_TREE: '/track/case/node/list/review',

  // ---- 功能用例 ----
  /** 分页获取功能用例列表 (URL路径参数: /list/{goPage}/{pageSize}) */
  FUNCTIONAL_CASE_LIST: '/track/test/case/list',
  /** 获取功能用例详情 */
  FUNCTIONAL_CASE_DETAIL: '/track/test/case/get',
  /** 获取功能用例模块树 */
  FUNCTIONAL_CASE_MODULE_TREE: '/track/case/node/list',
  /** 获取功能用例模块数量（v2 没有直接对应接口，使用 trashCount 替代） */
  FUNCTIONAL_CASE_MODULE_COUNT: '/track/case/node/trashCount',
};

/**
 * MeterSphere v3.x API 端点
 */
export const MS_V3_CONSTANTS = {
  /** 身份验证，返回用户 ID */
  VALIDATE: '/api/user/api/key/validate',
  /** 获取用户详情 */
  USER_DETAIL: '/api/personal/get/',
  /** 分页获取 API 列表 */
  API_LIST: '/api/api/definition/page',
  /** 获取 API 详情 */
  API_DETAIL: '/api/api/definition/get-detail',

  // ---- 用例评审 ----
  /** 分页获取用例评审列表 */
  CASE_REVIEW_LIST: '/api/case/review/page',
  /** 获取用例评审详情 */
  CASE_REVIEW_DETAIL: '/api/case/review/detail',
  /** 评审详情-分页获取已关联用例列表 */
  CASE_REVIEW_DETAIL_CASE_PAGE: '/api/case/review/detail/page',
  /** 获取评审模块树 */
  CASE_REVIEW_MODULE_TREE: '/api/case/review/module/tree',

  // ---- 功能用例 ----
  /** 分页获取功能用例列表 */
  FUNCTIONAL_CASE_LIST: '/api/functional/case/page',
  /** 获取功能用例详情 */
  FUNCTIONAL_CASE_DETAIL: '/api/functional/case/detail',
  /** 获取功能用例模块树 */
  FUNCTIONAL_CASE_MODULE_TREE: '/api/functional/case/module/tree',
  /** 获取功能用例模块数量 */
  FUNCTIONAL_CASE_MODULE_COUNT: '/api/functional/case/module/count',
};

/**
 * 根据环境变量 MS_VERSION 获取对应的 API 端点常量
 * @returns {typeof MS_V2_CONSTANTS | typeof MS_V3_CONSTANTS}
 */
export function getUrlConstants() {
  const version = process.env.MS_VERSION || 'v3';
  if (version === 'v2') {
    return MS_V2_CONSTANTS;
  }
  return MS_V3_CONSTANTS;
}

/**
 * 判断当前是否为 v2 版本
 * @returns {boolean}
 */
export function isV2() {
  return (process.env.MS_VERSION || 'v3') === 'v2';
}

// 默认导出 v3 版本以保持向后兼容
export default MS_V3_CONSTANTS;
