import type { RootState } from '../store/store';

const BASE_URL = 'http://localhost:3000';

export function apiFetch(
  path: string,
  init: RequestInit,
  getState: () => RootState
) {
  const token = getState().auth.token || localStorage.getItem('token');
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type'))
    headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(`${BASE_URL}${path}`, { ...init, headers });
}
