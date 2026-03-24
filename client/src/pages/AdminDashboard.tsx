import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { marked } from 'marked';
import { getAdminData, savePolicy, logout, isAuthenticated, PolicyData } from '../api';

marked.setOptions({
  breaks: true,
  gfm: true,
});

export default function AdminDashboard() {
  const [data, setData] = useState<PolicyData>({ title: '', content: '', footer: '' });
  const [saveStatus, setSaveStatus] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/admin');
      return;
    }

    getAdminData()
      .then((policy) => {
        setData(policy);
        setLoading(false);
      })
      .catch(() => {
        logout();
        navigate('/admin');
      });
  }, [navigate]);

  const updatePreview = useCallback(() => {
    setSaveStatus('● 未保存');
  }, []);

  const handleChange = (field: keyof PolicyData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
    updatePreview();
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg({ type: '', text: '' });
    setSaveStatus('◐ 保存中...');

    try {
      await savePolicy(data);
      setMsg({ type: 'success', text: '✅ 保存成功' });
      setSaveStatus('✓ 已保存');
    } catch {
      setMsg({ type: 'error', text: '❌ 保存失败，请重试' });
      setSaveStatus('✗ 保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  const extractDate = (content: string) => {
    const dateMatch = content.match(/最后更新[：:]\s*(\d{4}[-/年]\d{1,2}[-/月]\d{1,2}[日]?)/);
    return dateMatch ? `最后更新：${dateMatch[1]}` : '';
  };

  if (loading) {
    return (
      <div className="login-container">
        <div className="login-card">
          <p style={{ color: '#8b949e', textAlign: 'center' }}>加载中...</p>
        </div>
      </div>
    );
  }

  const previewContent = data.content.replace(
    /^.*最后更新[：:]\s*\d{4}[-/年]\d{1,2}[-/月]\d{1,2}[日]?.*$/m,
    ''
  );

  return (
    <>
      <div className="admin-header">
        <h1>🛡️ 隐私协议管理后台</h1>
        <div className="header-actions" style={{ display: 'flex', gap: '12px' }}>
          <a href="/" target="_blank" rel="noopener noreferrer" className="btn-secondary">
            预览页面 ↗
          </a>
          <button onClick={handleLogout} className="btn-secondary">
            退出登录
          </button>
        </div>
      </div>

      <div className="admin-container">
        <div className="editor-section">
          <div className="panel">
            <div className="panel-header">
              <span>📝 编辑器</span>
              <span className="badge">Markdown</span>
            </div>
            <div className="form-group">
              <label>页面标题</label>
              <input
                type="text"
                value={data.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="输入页面标题"
              />
            </div>
            <div className="form-group">
              <label>协议内容</label>
              <textarea
                value={data.content}
                onChange={(e) => handleChange('content', e.target.value)}
                placeholder="输入协议内容，支持 Markdown 格式"
              />
            </div>
            <div className="form-group">
              <label>页脚文字</label>
              <input
                type="text"
                value={data.footer}
                onChange={(e) => handleChange('footer', e.target.value)}
                placeholder="输入页脚版权信息"
              />
            </div>
          </div>

          <div className="panel preview-panel">
            <div className="panel-header">
              <span>👁️ 实时预览</span>
              <span className="badge">即时更新</span>
            </div>
            <div className="panel-body">
              <h1 className="preview-title">{data.title || '标题'}</h1>
              <div className="preview-updated">{extractDate(data.content)}</div>
              <div
                className="preview-content"
                dangerouslySetInnerHTML={{
                  __html: marked.parse(previewContent) as string,
                }}
              />
              <div className="preview-footer">{data.footer}</div>
            </div>
          </div>
        </div>

        <div className="actions-bar">
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            <span>{saving ? '⏳' : '💾'}</span>
            {saving ? '保存中...' : '保存更改'}
          </button>
          <div className={`save-status ${saveStatus.includes('已保存') ? 'saved' : saveStatus.includes('保存中') ? 'saving' : ''}`}>
            {saveStatus}
          </div>
          <div className={`msg ${msg.type}`}>{msg.text}</div>
        </div>

        <div className="tips">
          <h3>💡 Markdown 语法提示</h3>
          <div className="tips-grid">
            <code># 一级标题</code>
            <code>## 二级标题</code>
            <code>**粗体**</code>
            <code>*斜体*</code>
            <code>- 列表项</code>
            <code>1. 有序列表</code>
            <code>[链接](URL)</code>
            <code>`行内代码`</code>
            <code>--- 分割线</code>
          </div>
        </div>
      </div>
    </>
  );
}
