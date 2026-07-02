# MeterSphere MCP Server (JavaScript)

MeterSphere 测试平台的 MCP Server，通过 [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) 将 MeterSphere 的能力以标准化工具接口暴露给 AI 客户端（如 Claude Code、Claude Desktop、VS Code、Cursor 等）。

## 参考项目
https://github.com/metersphere/metersphere-mcp-server

## 快速导航

- [完整配置流程](#完整配置流程) - 从零开始的详细配置指南
- [功能介绍](#功能) - MCP Server 提供的工具能力
- [客户端配置](#客户端配置) - 各种 AI 客户端的接入方式
- [常见问题](#常见问题) - 配置和使用中的问题解答

---

## 完整配置流程

本节将详细介绍从零开始配置 MeterSphere MCP Server 的完整步骤，包括在 Claude Code 中添加本地 MCP 服务。

### 第一步：获取 MeterSphere API 密钥

1. 登录 MeterSphere 平台
2. 进入 **个人信息设置** → **API Keys** 页面
3. 创建或复制现有的 API Key 信息：
   - **Access Key**：访问密钥
   - **Secret Key**：签名密钥
4. 记录 MeterSphere 服务地址（如：`https://metersphere.xxx.com/`）

> ⚠️ **注意**：API Key 具有账户权限，请妥善保管，不要泄露给他人。

### 第二步：安装项目依赖

克隆或下载项目后，安装依赖：

```bash
# 克隆项目（如果是从仓库获取）
git clone <repository-url>
cd metersphere-mcp-server-js

# 安装依赖
npm install
# 或
yarn install
```

### 第三步：配置环境变量

复制环境变量示例文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入实际配置：

```bash
# MCP Server 运行模式: stdio 或 sse
MCP_TYPE=stdio

# SSE 模式监听端口（仅 SSE 模式需要）
PORT=8001

# MeterSphere 访问密钥 (STDIO 模式必填)
accessKey=your-access-key-here

# MeterSphere 签名密钥/SecretKey (STDIO 模式必填)
signature=your-secret-key-here

# MeterSphere 服务地址 (STDIO 模式必填)
meterSphereUrl=https://your-metersphere-url/

# MeterSphere API 版本 (可选，默认 v2)
MS_VERSION=v2
```

**配置说明**：

| 环境变量 | 必填 | 默认值 | 说明 |
|----------|------|--------|------|
| `MCP_TYPE` | 否 | `stdio` | 运行模式：`stdio`（本地）或 `sse`（网络） |
| `PORT` | 否 | `8000` | SSE 模式监听端口 |
| `accessKey` | **是** | - | MeterSphere 访问密钥 |
| `signature` | **是** | - | MeterSphere 签名密钥 |
| `meterSphereUrl` | **是** | - | MeterSphere 服务完整地址 |
| `MS_VERSION` | 否 | `v2` | API 版本：`v2` 或 `v3` |

### 第四步：在 Claude Code 中添加本地 MCP 服务

Claude Code 支持两种配置方式：**命令行方式**和**配置文件方式**。

#### 方式一：命令行添加（推荐）

使用 Claude Code 的 MCP 管理命令直接添加：

```bash
# 添加 MeterSphere MCP Server
claude mcp add metersphere \
  -e MCP_TYPE=stdio \
  -e accessKey=your-access-key \
  -e signature=your-secret-key \
  -e meterSphereUrl=https://your-metersphere-url/ \
  -- node /absolute/path/to/metersphere-mcp-server-js/src/index.js
```

**参数说明**：
- `metersphere`：MCP Server 名称，可自定义
- `-e`：设置环境变量（多个 `-e` 参数可设置多个变量）
- `--`：分隔符，后面是启动命令
- `/absolute/path/to/...`：必须是**绝对路径**

#### 方式二：配置文件添加

在项目或用户目录的配置文件中添加 MCP Server 配置。

**项目级配置**（仅当前项目可用）：
```bash
# 在项目根目录创建或编辑 .claude/settings.json
mkdir -p .claude
nano .claude/settings.json
```

**用户级配置**（所有项目可用）：
```bash
# 编辑用户全局配置文件
nano ~/.claude/settings.json
```

**配置内容**：

```json
{
  "mcpServers": {
    "metersphere": {
      "command": "/usr/bin/node",
      "args": [
        "/absolute/path/to/metersphere-mcp-server-js/src/index.js"
      ],
      "env": {
        "MCP_TYPE": "stdio",
        "accessKey": "your-access-key",
        "signature": "your-secret-key",
        "meterSphereUrl": "https://your-metersphere-url/",
        "MS_VERSION": "v2"
      }
    }
  }
}
```

**重要提示**：
1. 将 `/absolute/path/to/metersphere-mcp-server-js` 替换为项目的**实际绝对路径**
2. `command` 字段指定 Node.js 可执行文件的路径（可通过 `which node` 获取）
3. 环境变量必须正确配置，否则 MCP Server 无法启动

#### 验证 MCP Server 是否加载成功

重启 Claude Code 后，使用以下命令检查：

```bash
# 查看 MCP Server 列表
claude mcp list

# 测试 MCP Server 连接
claude mcp inspect metersphere
```

如果配置正确，你应该能看到 `metersphere` MCP Server 及其提供的所有工具。

### 第五步：使用 MeterSphere 工具

配置完成后，在 Claude Code 对话中可以直接使用 MeterSphere 功能：

**示例对话**：

```
# 获取用户信息
获取 MeterSphere 当前用户信息

# 查询测试用例
帮我获取 MeterSphere 上关于 OceanBase 的测试用例

# 查看评审列表
获取项目 ID 为 xxx 的评审列表，状态为 PREPARED

# 查看用例详情
查看用例 ID 为 12345 的详细信息
```

**可用的工具列表**：

| 工具名称 | 功能描述 |
|---------|---------|
| `getUser` | 获取当前用户信息、权限和项目 |
| `getCaseList` | 搜索功能用例列表 |
| `getCaseDetail` | 查看用例详细信息 |
| `getApiList` | 获取 API 接口列表 |
| `getReviewList` | 查看用例评审列表 |
| ...更多工具见下方功能介绍 |

---

## 功能

### 用户与 API 管理

| 工具 | 描述 |
|------|------|
| `getUser` | 获取用户基本信息，包括权限和角色、所属组织和项目等 |
| `getApiList` | 获取项目下的 API 列表信息，支持分页、排序、关键词搜索和协议筛选 |
| `getApiDetail` | 通过 API ID 获取单个 API 的详细信息 |

### 用例评审

| 工具 | 描述 |
|------|------|
| `getReviewList` | 获取项目下的用例评审列表，支持分页、关键词搜索和状态筛选 |
| `getReviewDetail` | 通过评审 ID 获取单个用例评审的详细信息 |
| `getReviewDetailCasePage` | 获取评审详情中已关联的功能用例列表，支持分页和关键词搜索 |
| `getReviewModuleTree` | 获取用例评审的模块树结构，用于按模块浏览评审用例 |

### 功能用例

| 工具 | 描述 |
|------|------|
| `getCaseList` | 获取项目下的功能用例列表，支持分页、关键词搜索和模块筛选 |
| `getCaseDetail` | 通过用例 ID 获取单个功能用例的详细信息 |
| `getCaseModuleTree` | 获取功能用例的模块树结构，用于按模块浏览用例 |
| `getCaseModuleCount` | 获取各模块下的功能用例数量统计 |

## 环境要求

- Node.js >= 18.0.0
- npm 或 yarn 包管理器
- MeterSphere 账户和 API Key

## 快速开始

### 最小化配置（5分钟快速上手）

```bash
# 1. 安装依赖
npm install

# 2. 创建配置文件
cp .env.example .env
# 编辑 .env 填入 MeterSphere API Key 和服务地址

# 3. 在 Claude Code 中添加 MCP Server
claude mcp add metersphere \
  -e MCP_TYPE=stdio \
  -e accessKey=你的accessKey \
  -e signature=你的secretKey \
  -e meterSphereUrl=https://你的MeterSphere地址/ \
  -- node $(pwd)/src/index.js

# 4. 重启 Claude Code，开始使用！
```

> 💡 **提示**：`$(pwd)` 会自动替换为当前目录的绝对路径。

---

## 安装

```bash
npm install
```

## 配置

复制 `.env.example` 为 `.env` 并填写配置：

```bash
cp .env.example .env
```

| 环境变量 | 必填 | 默认值 | 说明 |
|----------|------|--------|------|
| `MCP_TYPE` | 否 | `sse` | 运行模式：`stdio` 或 `sse` |
| `PORT` | 否 | `8000` | SSE 模式监听端口 |
| `accessKey` | STDIO 必填 | - | MeterSphere 访问密钥 |
| `signature` | STDIO 必填 | - | MeterSphere 签名密钥（即 SecretKey） |
| `meterSphereUrl` | STDIO 必填 | - | MeterSphere 服务地址 |

## 运行

### STDIO 模式（推荐用于本地客户端）

STDIO 模式适用于本地运行的 AI 客户端（Claude Code、Claude Desktop），通过标准输入输出进行通信。

```bash
# 方式 1：使用 .env 文件中的配置
MCP_TYPE=stdio node src/index.js

# 方式 2：使用 npm 脚本（需先配置 .env）
npm run start:stdio

# 方式 3：命令行直接指定环境变量
MCP_TYPE=stdio \
accessKey=your-key \
signature=your-secret \
meterSphereUrl=http://your-url \
node src/index.js
```

### SSE 模式（推荐用于远程访问）

SSE 模式启动 HTTP 服务器，适用于需要网络访问的客户端。

```bash
# 方式 1：使用默认端口 8000
MCP_TYPE=sse node src/index.js

# 方式 2：指定端口
PORT=9000 MCP_TYPE=sse node src/index.js

# 方式 3：使用 npm 脚本
npm start
```

服务启动后，访问地址：
- SSE 端点：`http://localhost:8000/sse`
- 健康检查：`http://localhost:8000/health`（如果支持）

---

## 客户端配置

### Claude Code（推荐）

Claude Code 是 Anthropic 官方的 CLI 工具，支持通过 STDIO 模式连接 MCP Server。**这是最推荐的配置方式**。

#### 配置方式一：命令行添加（最简单）

```bash
# 基本语法
claude mcp add <server-name> \
  -e ENV_VAR1=value1 \
  -e ENV_VAR2=value2 \
  -- command args...

# MeterSphere MCP Server 示例
claude mcp add metersphere \
  -e MCP_TYPE=stdio \
  -e accessKey=your-access-key \
  -e signature=your-secret-key \
  -e meterSphereUrl=https://metersphere.xxx.com/ \
  -- node /home/user/metersphere-mcp-server-js/src/index.js
```

#### 配置方式二：编辑配置文件

**项目级配置**（推荐，仅当前项目可用）：

创建 `.claude/settings.json`：

```json
{
  "mcpServers": {
    "metersphere": {
      "command": "/usr/bin/node",
      "args": ["/absolute/path/to/metersphere-mcp-server-js/src/index.js"],
      "env": {
        "MCP_TYPE": "stdio",
        "accessKey": "your-access-key",
        "signature": "your-secret-key",
        "meterSphereUrl": "https://your-metersphere-url/",
        "MS_VERSION": "v2"
      }
    }
  }
}
```

**用户级配置**（所有项目可用）：

编辑 `~/.claude/settings.json`，内容同上。

#### 管理 MCP Server

```bash
# 查看所有已配置的 MCP Server
claude mcp list

# 查看特定 MCP Server 详情
claude mcp inspect metersphere

# 删除 MCP Server
claude mcp remove metersphere

# 测试 MCP Server（启动并检查工具列表）
claude mcp test metersphere
```

#### 使用示例

配置完成后，在 Claude Code 中可以直接使用自然语言调用 MeterSphere 功能：

```
用户：获取 MeterSphere 上项目 xxx 的功能用例列表

Claude：[调用 getCaseList 工具] 找到以下用例...

用户：查看用例 ID 为 12345 的详细信息

Claude：[调用 getCaseDetail 工具] 用例详情如下...
```

### Claude Desktop

Claude Desktop 是 Anthropic 的桌面应用程序，配置方式与 Claude Code 类似。

#### 配置步骤

1. 找到配置文件位置：
   - **macOS**：`~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**：`%APPDATA%\Claude\claude_desktop_config.json`
   - **Linux**：`~/.config/Claude/claude_desktop_config.json`

2. 编辑配置文件（如果不存在则创建）：

```json
{
  "mcpServers": {
    "metersphere": {
      "command": "node",
      "args": ["/absolute/path/to/metersphere-mcp-server-js/src/index.js"],
      "env": {
        "MCP_TYPE": "stdio",
        "accessKey": "your-access-key",
        "signature": "your-secret-key",
        "meterSphereUrl": "https://your-metersphere-url/",
        "MS_VERSION": "v2"
      }
    }
  }
}
```

3. 重启 Claude Desktop 应用

4. 在对话中即可使用 MeterSphere 功能

> 💡 **提示**：macOS 用户可以使用 `Cmd + Shift + G` 快速定位到配置目录。

### VS Code / Cursor（SSE 模式）

先启动 SSE 服务：

```bash
npm start
```

然后在 VS Code 或 Cursor 的 MCP 配置中添加：

```json
{
  "metersphere": {
    "type": "sse",
    "url": "http://localhost:8000/sse",
    "headers": {
      "accessKey": "your-access-key",
      "signature": "your-secret-key",
      "meterSphereUrl": "http://your-metersphere-url"
    }
  }
}
```

**配置文件位置**：
- VS Code：`.vscode/mcp.json`（项目级）或用户 `settings.json` 中的 `mcp.servers` 字段
- Cursor：`.cursor/mcp.json`（项目级）或全局 MCP 设置

### 其他支持 MCP 的客户端

任何支持 MCP 协议的客户端均可接入，根据客户端支持的传输模式选择：

- **STDIO 模式**：适用于本地运行的 CLI 类客户端（如 Claude Code、Claude Desktop）
- **SSE 模式**：适用于需要远程连接的客户端（如 Web 端、IDE 插件），需先启动 SSE 服务

## 鉴权机制

MeterSphere MCP Server 使用 MeterSphere 的标准鉴权机制，确保通信安全。

### 签名生成算法

使用 AES/CBC/PKCS5Padding 加密生成签名：

- **明文格式**：`accessKey|UUID|timestamp`
- **加密密钥**：secretKey
- **初始向量(IV)**：accessKey（取前 16 字节）
- **输出格式**：Base64 编码的密文

### 请求流程

1. 客户端生成签名
2. 将签名放在 HTTP Header `signature` 中
3. `accessKey` 单独传递在 Header 中
4. 服务端验证签名有效性和时间戳

> 🔐 **安全提示**：Secret Key 仅用于签名生成，不会在网络上传输，请妥善保管。

---

## 常见问题

### 1. MCP Server 无法启动

**症状**：Claude Code 提示 MCP Server 连接失败

**排查步骤**：

```bash
# 1. 检查 Node.js 版本
node --version  # 应该 >= 18.0.0

# 2. 检查依赖是否安装
cd metersphere-mcp-server-js
npm install

# 3. 手动测试 MCP Server
MCP_TYPE=stdio \
accessKey=your-key \
signature=your-secret \
meterSphereUrl=https://your-url/ \
node src/index.js

# 4. 检查配置文件路径是否为绝对路径
# 错误：node ./src/index.js
# 正确：node /home/user/metersphere-mcp-server-js/src/index.js
```

**常见错误**：
- `command not found: node` - Node.js 未安装或路径错误
- `Cannot find module` - 依赖未安装，执行 `npm install`
- `ECONNREFUSED` - MeterSphere 服务地址错误或无法访问

### 2. API Key 认证失败

**症状**：工具调用返回 401 或 403 错误

**解决方案**：

1. 确认 API Key 是否正确：
   ```bash
   # 检查 .env 文件
   cat .env | grep -E "accessKey|signature"
   ```

2. 确认 MeterSphere 服务地址格式：
   ```
   正确：https://metersphere.example.com/
   错误：https://metersphere.example.com (缺少结尾斜杠)
   错误：metersphere.example.com (缺少协议)
   ```

3. 检查 API Key 是否过期或被禁用：
   - 登录 MeterSphere → 个人设置 → API Keys
   - 查看状态是否为"启用"

### 3. 如何获取 MeterSphere 项目 ID？

**方法一：从 URL 获取**

在 MeterSphere Web 界面打开任意项目页面，URL 格式为：
```
https://your-metersphere-url/#/project/cdcd8dff-f41c-11eb-af56-0242ac1e0a03/...
```

其中 `cdcd8dff-f41c-11eb-af56-0242ac1e0a03` 就是项目 ID。

**方法二：使用 MCP 工具**

```
# 在 Claude Code 中询问
获取 MeterSphere 当前用户信息
```

返回结果中会包含 `lastProjectId` 字段。

### 4. 如何调试 MCP Server？

**启用调试日志**：

```bash
# 设置 DEBUG 环境变量
DEBUG=* MCP_TYPE=stdio node src/index.js

# 或在 .env 中添加
DEBUG=mcp:*
```

**查看 Claude Code 日志**：

```bash
# Claude Code 日志位置
~/.claude/logs/mcp-*.log

# 实时查看日志
tail -f ~/.claude/logs/mcp-*.log
```

### 5. SSE 模式和 STDIO 模式如何选择？

| 特性 | STDIO 模式 | SSE 模式 |
|------|-----------|---------|
| 适用场景 | 本地客户端 | 远程访问、Web 客户端 |
| 网络要求 | 无需网络 | 需要开放端口 |
| 性能 | 更快（无网络开销） | 稍慢（HTTP 通信） |
| 安全性 | 仅本地访问 | 需要配置认证 |
| 推荐客户端 | Claude Code、Claude Desktop | VS Code、Cursor、Web 应用 |

**推荐**：Claude Code 用户优先使用 STDIO 模式。

### 6. 多个项目如何配置不同的 MeterSphere 实例？

可以配置多个 MCP Server，使用不同的名称：

```json
{
  "mcpServers": {
    "metersphere-prod": {
      "command": "node",
      "args": ["/path/to/metersphere-mcp-server-js/src/index.js"],
      "env": {
        "MCP_TYPE": "stdio",
        "meterSphereUrl": "https://prod.metersphere.com/",
        "accessKey": "prod-key",
        "signature": "prod-secret"
      }
    },
    "metersphere-dev": {
      "command": "node",
      "args": ["/path/to/metersphere-mcp-server-js/src/index.js"],
      "env": {
        "MCP_TYPE": "stdio",
        "meterSphereUrl": "https://dev.metersphere.com/",
        "accessKey": "dev-key",
        "signature": "dev-secret"
      }
    }
  }
}
```

使用时指定具体的 Server：
```
从 metersphere-prod 获取测试用例列表
```

### 7. 如何更新 MCP Server？

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 更新依赖
npm install

# 3. 重启 Claude Code 或重新加载配置
claude mcp remove metersphere
claude mcp add metersphere ...
```

### 8. Windows 系统路径问题

Windows 用户需要注意路径格式：

```json
{
  "mcpServers": {
    "metersphere": {
      "command": "node",
      "args": ["C:\\Users\\YourName\\metersphere-mcp-server-js\\src\\index.js"],
      "env": {
        "MCP_TYPE": "stdio",
        "accessKey": "your-key",
        "signature": "your-secret",
        "meterSphereUrl": "https://your-url/"
      }
    }
  }
}
```

- 使用双反斜杠 `\\` 或正斜杠 `/`
- 路径中不要包含中文字符或空格

---

## 测试

```bash
npm test
```

---

## 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/your-feature`
3. 提交更改：`git commit -m 'Add some feature'`
4. 推送分支：`git push origin feature/your-feature`
5. 创建 Pull Request

---

## 许可证

MIT License

---

## 相关资源

- [MeterSphere 官网](https://metersphere.io/)
- [Model Context Protocol 文档](https://modelcontextprotocol.io/)
- [Claude Code 文档](https://docs.anthropic.com/claude-code)
- [MCP SDK 文档](https://github.com/modelcontextprotocol/typescript-sdk)

---

## 技术支持

遇到问题？

1. 查看上方[常见问题](#常见问题)章节
2. 搜索或提交 [Issues](../../issues)
3. 查看 [MeterSphere 官方文档](https://metersphere.io/docs/)
4. 加入 MeterSphere 社区获取帮助
