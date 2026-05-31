/**
 * Client API centralisé.
 * Toutes les requêtes passent par /api (proxifié vers le backend PHP par Vite),
 * avec credentials:'include' pour transporter le cookie de session.
 */

const BASE = '/api';

async function request(path, { method = 'GET', body, params } = {}) {
  let url = `${BASE}${path}`;
  if (params) {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
    ).toString();
    if (qs) url += `?${qs}`;
  }

  const opts = {
    method,
    credentials: 'include',
    headers: {},
  };
  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(url, opts);
  let data = null;
  const text = await res.text();
  if (text) {
    try { data = JSON.parse(text); } catch { data = text; }
  }

  if (!res.ok) {
    const message = (data && data.error) ? data.error : `Erreur ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  get:  (path, params)      => request(path, { method: 'GET', params }),
  post: (path, body)        => request(path, { method: 'POST', body }),
  put:  (path, body)        => request(path, { method: 'PUT', body }),
  del:  (path, body)        => request(path, { method: 'DELETE', body }),
};

export default api;
