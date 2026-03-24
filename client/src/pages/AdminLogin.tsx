import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = await login(password);
      localStorage.setItem('adminToken', token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>🛡️ 管理后台</h1>
        <p>请输入管理员密码登录</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="password">密码</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              autoFocus
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <div className="login-link">
          <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
            ← 返回前台
          </a>
        </div>
      </div>
    </div>
  );
}
