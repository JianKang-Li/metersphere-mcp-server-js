import { get } from '../client/http-client.js';
import { getUrlConstants } from '../client/constants.js';

/**
 * getUser MCP 工具实现
 * 获取用户基本信息，包括权限和角色、所属组织和项目等
 * 支持 v2 和 v3 两个版本的 API
 *
 * 底层调用流程:
 * 1. GET /user/key/validate (v2) 或 /user/api/key/validate (v3) — 身份验证，获取用户 ID
 * 2. GET /user/info/{userId} (v2) 或 /personal/get/{userId} (v3) — 获取用户详细信息
 */
export async function getUser() {
  const URL_CONSTANTS = getUrlConstants();

  // 第一步：验证身份获取 userId
  const validateResult = await get(URL_CONSTANTS.VALIDATE);
  if (!validateResult) {
    return { content: [{ type: 'text', text: '用户验证失败，无法获取用户信息' }] };
  }

  // 解析响应，提取 data 字段（即 userId）
  let resultHolder;
  try {
    resultHolder = JSON.parse(validateResult);
  } catch {
    return { content: [{ type: 'text', text: validateResult }] };
  }

  if (!resultHolder.data) {
    return { content: [{ type: 'text', text: '用户验证失败，无法获取用户信息' }] };
  }

  // 第二步：获取用户详情
  const userDetail = await get(URL_CONSTANTS.USER_DETAIL + resultHolder.data);
  return { content: [{ type: 'text', text: userDetail }] };
}
