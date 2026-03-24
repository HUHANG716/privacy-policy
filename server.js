const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Default data
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
};

// Initialize data file
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2));
}

// Read data
function getData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

// Save data
function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// API Routes
app.get('/api/policy', (req, res) => {
  const data = getData();
  res.json(data);
});

app.get('/api/admin', (req, res) => {
  const data = getData();
  res.json(data);
});

app.post('/api/admin', (req, res) => {
  const { title, content, footer } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: '标题和内容不能为空' });
  }
  saveData({ title, content, footer: footer || '' });
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`服务运行中：http://localhost:${PORT}`);
  console.log(`前台页面：http://localhost:${PORT}/public/index.html`);
  console.log(`管理后台：http://localhost:${PORT}/public/admin.html`);
});
