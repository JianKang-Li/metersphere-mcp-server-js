import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getUser } from './tools/user-tool.js';
import { getApiList, getApiDetail } from './tools/api-tool.js';
import { getReviewList, getReviewDetail, getReviewDetailCasePage, getReviewModuleTree } from './tools/case-review-tool.js';
import { getCaseList, getCaseDetail, getCaseModuleTree, getCaseModuleCount } from './tools/functional-case-tool.js';

/**
 * 创建 McpServer 实例并注册所有工具
 * 工具描述与 Java 版 @Tool(description=...) 注解完全一致
 * @returns {McpServer}
 */
export function createMcpServer() {
  const server = new McpServer({
    name: 'metersphere-mcp-server',
    version: 'v2/v3',
  });

  // 注册 getUser 工具（无参数）
  server.tool(
    'getUser',
    '用户基本信息获取工具，获取用户相关信息，包括权限和角色，所属组织和项目等',
    {},
    async () => {
      try {
        return await getUser();
      } catch (e) {
        return {
          content: [{ type: 'text', text: '获取用户信息失败: ' + e.message }],
          isError: true,
        };
      }
    }
  );

  // 注册 getApiList 工具
  server.tool(
    'getApiList',
    'API列表获取工具，获取项目下的API列表信息，支持分页、排序、关键词搜索和协议筛选',
    {
      projectId: z.string().describe('项目ID'),
      current: z.number().optional().describe('当前页码，默认为1'),
      pageSize: z.number().optional().describe('每页大小，默认为10'),
      keyword: z.string().optional().describe('搜索关键词'),
      protocols: z.array(z.string()).optional().describe('API协议类型，如HTTP、TCP 等'),
    },
    async (args) => {
      try {
        return await getApiList(args);
      } catch (e) {
        return {
          content: [{ type: 'text', text: '获取API列表失败: ' + e.message }],
          isError: true,
        };
      }
    }
  );

  // 注册 getApiDetail 工具
  server.tool(
    'getApiDetail',
    'API详情获取工具，通过API ID获取单个API的详细信息',
    {
      apiId: z.string().describe('API ID'),
    },
    async (args) => {
      try {
        return await getApiDetail(args);
      } catch (e) {
        return {
          content: [{ type: 'text', text: '获取API详情失败: ' + e.message }],
          isError: true,
        };
      }
    }
  );

  // 注册 getReviewList 工具
  server.tool(
    'getReviewList',
    '用例评审列表获取工具，获取项目下的用例评审列表，支持分页、关键词搜索和状态筛选',
    {
      projectId: z.string().describe('项目ID'),
      current: z.number().optional().describe('当前页码，默认为1'),
      pageSize: z.number().optional().describe('每页大小，默认为10'),
      keyword: z.string().optional().describe('搜索关键词'),
      status: z.string().optional().describe('评审状态，如 PREPARED、UNDERWAY、COMPLETED'),
      reviewId: z.string().optional().describe('评审ID，用于精确筛选'),
    },
    async (args) => {
      try {
        return await getReviewList(args);
      } catch (e) {
        return {
          content: [{ type: 'text', text: '获取评审列表失败: ' + e.message }],
          isError: true,
        };
      }
    }
  );

  // 注册 getReviewDetail 工具
  server.tool(
    'getReviewDetail',
    '用例评审详情获取工具，通过评审ID获取单个用例评审的详细信息',
    {
      reviewId: z.string().describe('评审ID'),
    },
    async (args) => {
      try {
        return await getReviewDetail(args);
      } catch (e) {
        return {
          content: [{ type: 'text', text: '获取评审详情失败: ' + e.message }],
          isError: true,
        };
      }
    }
  );

  // 注册 getReviewDetailCasePage 工具
  server.tool(
    'getReviewDetailCasePage',
    '评审关联用例列表获取工具，获取评审详情中已关联的功能用例列表，支持分页和关键词搜索',
    {
      reviewId: z.string().describe('评审ID'),
      projectId: z.string().optional().describe('项目ID'),
      current: z.number().optional().describe('当前页码，默认为1'),
      pageSize: z.number().optional().describe('每页大小，默认为10'),
      keyword: z.string().optional().describe('搜索关键词'),
      moduleIds: z.array(z.string()).optional().describe('模块ID列表，按模块筛选用例'),
    },
    async (args) => {
      try {
        return await getReviewDetailCasePage(args);
      } catch (e) {
        return {
          content: [{ type: 'text', text: '获取评审关联用例列表失败: ' + e.message }],
          isError: true,
        };
      }
    }
  );

  // 注册 getReviewModuleTree 工具
  server.tool(
    'getReviewModuleTree',
    '评审模块树获取工具，获取用例评审的模块树结构，用于按模块浏览评审用例',
    {
      projectId: z.string().describe('项目ID'),
      reviewId: z.string().optional().describe('评审ID，传入时获取该评审下的模块树'),
    },
    async (args) => {
      try {
        return await getReviewModuleTree(args);
      } catch (e) {
        return {
          content: [{ type: 'text', text: '获取评审模块树失败: ' + e.message }],
          isError: true,
        };
      }
    }
  );

  // 注册 getCaseList 工具
  server.tool(
    'getCaseList',
    '功能用例列表获取工具，获取项目下的功能用例列表，支持分页、关键词搜索和模块筛选',
    {
      projectId: z.string().describe('项目ID'),
      current: z.number().optional().describe('当前页码，默认为1'),
      pageSize: z.number().optional().describe('每页大小，默认为10。设为0或不传则自动获取全部'),
      keyword: z.string().optional().describe('搜索关键词'),
      moduleId: z.string().optional().describe('模块ID，按单个模块筛选'),
      moduleIds: z.array(z.string()).optional().describe('模块ID列表，按多个模块筛选'),
      fetchAll: z.boolean().optional().describe('是否获取全部数据，设为true时自动分页获取所有用例'),
    },
    async (args) => {
      try {
        return await getCaseList(args);
      } catch (e) {
        return {
          content: [{ type: 'text', text: '获取功能用例列表失败: ' + e.message }],
          isError: true,
        };
      }
    }
  );

  // 注册 getCaseDetail 工具
  server.tool(
    'getCaseDetail',
    '功能用例详情获取工具，通过用例ID获取单个功能用例的详细信息',
    {
      caseId: z.string().describe('用例ID'),
    },
    async (args) => {
      try {
        return await getCaseDetail(args);
      } catch (e) {
        return {
          content: [{ type: 'text', text: '获取功能用例详情失败: ' + e.message }],
          isError: true,
        };
      }
    }
  );

  // 注册 getCaseModuleTree 工具
  server.tool(
    'getCaseModuleTree',
    '功能用例模块树获取工具，获取功能用例的模块树结构，用于按模块浏览用例',
    {
      projectId: z.string().describe('项目ID'),
    },
    async (args) => {
      try {
        return await getCaseModuleTree(args);
      } catch (e) {
        return {
          content: [{ type: 'text', text: '获取功能用例模块树失败: ' + e.message }],
          isError: true,
        };
      }
    }
  );

  // 注册 getCaseModuleCount 工具
  server.tool(
    'getCaseModuleCount',
    '功能用例模块数量获取工具，获取各模块下的功能用例数量统计',
    {
      projectId: z.string().describe('项目ID'),
    },
    async (args) => {
      try {
        return await getCaseModuleCount(args);
      } catch (e) {
        return {
          content: [{ type: 'text', text: '获取功能用例模块数量失败: ' + e.message }],
          isError: true,
        };
      }
    }
  );

  return server;
}
