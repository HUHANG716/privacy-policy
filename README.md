# Privacy Policy App

基于 Hono + React TypeScript 的隐私协议管理应用。

## 快速开始

### 1. 安装依赖

```bash
cd privacy-policy
npm install
cd client && npm install
cd ..
```

### 2. 启动开发服务器

**方式一：同时启动前后端**
```bash
# 终端1：启动后端 (Hono)
npm run dev:server

# 终端2：启动前端 (Vite)
npm run dev:client
```

访问：
- 前台页面：http://localhost:5173
- 管理后台：http://localhost:5173/admin

**方式二：仅启动后端（使用构建后的静态文件）**
```bash
npm run build  # 构建前端
npm run start  # 启动后端（端口3000）
```

### 3. 管理员登录

- 访问：http://localhost:3000/admin
- 默认密码：`admin123`

可通过环境变量修改密码：
```bash
ADMIN_PASSWORD=your-password npm run start
```

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PORT` | `3000` | 服务器端口 |
| `ADMIN_PASSWORD` | `admin123` | 管理员密码 |
| `JWT_SECRET` | `your-super-secret-jwt-key-change-in-production` | JWT 密钥（生产环境请修改） |

## API 接口

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | `/api/policy` | 否 | 获取隐私协议数据 |
| POST | `/api/admin/login` | 否 | 管理员登录 |
| GET | `/api/admin` | JWT | 获取完整数据 |
| POST | `/api/admin` | JWT | 保存数据 |

## 数据结构

`data.json` 结构：

```json
{
  "title": "隐私协议",
  "content": "# Markdown 内容...",
  "footer": "© 2026 All Rights Reserved."
}
```

## 技术栈

- **后端**：Hono v4 + TypeScript + tsx
- **前端**：React 18 + TypeScript + Vite + React Router
- **认证**：JWT (jose)
- **样式**：CSS Variables + 暗色模式支持
