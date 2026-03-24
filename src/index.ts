import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { SignJWT, jwtVerify } from 'jose'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = new Hono()

const DATA_FILE = join(__dirname, '../data.json')
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
)

const defaultData = {
  title: '隐私协议',
  content: `# 隐私政策

最后更新：2026年3月24日

我们高度重视您的隐私保护。本隐私政策旨在向您说明我们如何收集、使用、存储和保护您的个人信息。

## 信息收集

我们收集的信息包括：
- 基本个人信息（姓名、邮箱等）
- 使用数据和日志信息
- 设备信息和IP地址

## 信息使用

我们使用收集的信息用于：
- 提供和改进我们的服务
- 保护账号安全
- 履行法律义务

## 信息保护

我们采用行业标准的安全措施保护您的数据，防止未经授权的访问、使用或泄露。

## 联系我们

如您对本隐私政策有任何疑问，请联系我们。`,
  footer: '© 2026 All Rights Reserved.'
}

function getData() {
  if (!existsSync(DATA_FILE)) {
    writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2))
  }
  return JSON.parse(readFileSync(DATA_FILE, 'utf-8'))
}

function saveData(data: typeof defaultData) {
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
}

// Middleware
app.use('*', cors())

// Public routes
app.get('/api/policy', (c) => {
  const data = getData()
  return c.json(data)
})

// Login endpoint
app.post('/api/admin/login', async (c) => {
  const { password } = await c.req.json()

  if (password !== ADMIN_PASSWORD) {
    return c.json({ error: '密码错误' }, 401)
  }

  const token = await new SignJWT({ sub: 'admin', role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET)

  return c.json({ token })
})

// Auth middleware
async function authenticate(c: any, next: any) {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: '未授权' }, 401)
  }
  const token = authHeader.split(' ')[1]
  try {
    await jwtVerify(token, JWT_SECRET)
    await next()
  } catch {
    return c.json({ error: '令牌无效' }, 401)
  }
}

// Protected admin routes
app.use('/api/admin/*', authenticate)

app.get('/api/admin', (c) => {
  const data = getData()
  return c.json(data)
})

app.post('/api/admin', async (c) => {
  const { title, content, footer } = await c.req.json()

  if (!title || !content) {
    return c.json({ error: '标题和内容不能为空' }, 400)
  }

  saveData({ title, content, footer: footer || '' })
  return c.json({ success: true })
})

// Serve static files from client/dist
app.get('*', async (c) => {
  const path = c.req.path
  if (path.startsWith('/api')) {
    return c.text('Not Found', 404)
  }
  try {
    const fs = await import('fs')
    const distPath = join(__dirname, '../client/dist', path === '/' ? 'index.html' : path)
    if (fs.existsSync(distPath)) {
      const file = fs.readFileSync(distPath)
      const ext = path.split('.').pop()
      const contentType = ext === 'js' ? 'application/javascript' : ext === 'css' ? 'text/css' : 'text/html'
      return c.newResponse(file, { headers: { 'Content-Type': contentType } })
    }
    // Try index.html for SPA routing
    const indexPath = join(__dirname, '../client/dist/index.html')
    if (fs.existsSync(indexPath)) {
      return c.newResponse(fs.readFileSync(indexPath), { headers: { 'Content-Type': 'text/html' } })
    }
    return c.text('Not Found', 404)
  } catch {
    return c.text('Not Found', 404)
  }
})

const port = parseInt(process.env.PORT || '3001', 10)
console.log(`🚀 服务运行中：http://localhost:${port}`)
console.log(`📄 前台页面：http://localhost:${port}/`)
console.log(`🔐 管理后台：http://localhost:${port}/admin`)
console.log(`🔑 默认管理员密码：admin123`)

serve({
  fetch: app.fetch,
  port,
})
