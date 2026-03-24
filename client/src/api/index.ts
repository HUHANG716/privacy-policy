const API_BASE = '/api';

export interface PolicyData {
  title: string;
  content: string;
  footer: string;
}

export async function getPolicy(): Promise<PolicyData> {
  const res = await fetch(`${API_BASE}/policy`);
  if (!res.ok) throw new Error('Failed to fetch policy');
  return res.json();
}

export async function getAdminData(): Promise<PolicyData> {
  const token = localStorage.getItem('adminToken');
  const res = await fetch(`${API_BASE}/admin`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Unauthorized');
  return res.json();
}

export async function savePolicy(data: PolicyData): Promise<void> {
  const token = localStorage.getItem('adminToken');
  const res = await fetch(`${API_BASE}/admin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to save');
}

export async function login(password: string): Promise<string> {
  const res = await fetch(`${API_BASE}/admin/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Login failed');
  }
  const data = await res.json();
  return data.token;
}

export function logout(): void {
  localStorage.removeItem('adminToken');
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('adminToken');
}
