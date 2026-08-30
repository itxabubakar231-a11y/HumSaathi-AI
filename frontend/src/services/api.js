const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

async function request(path, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('humsaathi_auth_token') : null;
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers,
    },
    ...options,
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.success === false) {
    const errorMsg = body.error || body.detail || (body.message ? body.message : `Request failed: ${response.status}`);
    throw new Error(errorMsg);
  }
  return body.data !== undefined ? body.data : body;
}

export const api = {
  health: () => request('/api/health'),
  signupUser: (body) => request('/api/users/signup', { method: 'POST', body: JSON.stringify(body) }),
  loginUser: (body) => request('/api/users/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request('/api/users/me'),
  logoutUser: () => request('/api/users/logout', { method: 'POST', body: '{}' }),
  setupUser: (body) => request('/api/users/setup', { method: 'POST', body: JSON.stringify(body) }),
  getUser: (userId) => request(`/api/users/${userId}`),
  selectPersona: (userId, persona) => request(`/api/users/${userId}/persona`, { method: 'PATCH', body: JSON.stringify({ persona }) }),
  updateSensory: (userId, prefs) => request(`/api/users/${userId}/sensory`, { method: 'PATCH', body: JSON.stringify(prefs) }),
  updateLanguage: (userId, language) => request(`/api/users/${userId}/language`, { method: 'PATCH', body: JSON.stringify({ language }) }),
  getAssessmentQuestions: (userId) => request(`/api/assessment/${userId}/questions`),
  submitAssessment: (userId, responses) => request(`/api/assessment/${userId}/submit`, { method: 'POST', body: JSON.stringify({ responses }) }),
  getLatestAssessment: (userId) => request(`/api/assessment/${userId}/latest`),
  getActivity: (id, params) => {
    const qs = params ? new URLSearchParams(params).toString() : '';
    return request(`/api/activities/${id}${qs ? `?${qs}` : ''}`);
  },
  getActivities: (params) => {
    const qs = params ? new URLSearchParams(params).toString() : '';
    return request(`/api/activities${qs ? `?${qs}` : ''}`);
  },
  submitAttempt: (userId, body) => request(`/api/attempts/${userId}/submit`, { method: 'POST', body: JSON.stringify(body) }),
  getDashboard: (userId) => request(`/api/dashboard/${userId}`),
  getProgress: (userId) => request(`/api/dashboard/${userId}/progress`),
  recommend: (userId) => request(`/api/dashboard/${userId}/recommend`, { method: 'POST', body: '{}' }),
  getParentView: (userId, pin) => request(`/api/dashboard/${userId}/parent`, { method: 'POST', body: JSON.stringify({ pin }) }),
  getScenarios: (params) => {
    const qs = params ? new URLSearchParams(params).toString() : '';
    return request(`/api/conversations/scenarios${qs ? `?${qs}` : ''}`);
  },
  getScenario: (id) => request(`/api/conversations/scenarios/${id}`),
  getSession: (sessionId) => request(`/api/conversations/session/${sessionId}`),
  startConversation: (body) => request('/api/conversations/start', { method: 'POST', body: JSON.stringify(body) }),
  sendMessage: (sessionId, body) => request(`/api/conversations/${sessionId}/message`, { method: 'POST', body: JSON.stringify(body) }),
  endConversation: (sessionId) => request(`/api/conversations/${sessionId}/end`, { method: 'POST', body: '{}' }),
  evaluateConversation: (body) => request('/api/evaluation/conversation', { method: 'POST', body: JSON.stringify(body) }),
  getEvaluation: (sessionId) => request(`/api/evaluation/${sessionId}`),
  getUserSessions: (userId) => request(`/api/conversations/sessions/${userId}`),
  getSkillModules: (persona, language) => request(`/api/skills/modules/${persona}${language ? `?language=${language}` : ''}`),
  getSkillModule: (moduleId, language, difficulty) => {
    const params = new URLSearchParams();
    if (language) params.append('language', language);
    if (difficulty) params.append('difficulty', difficulty);
    const qs = params.toString();
    return request(`/api/skills/module/${moduleId}${qs ? `?${qs}` : ''}`);
  },
  evaluateSkillSolution: (body) => request('/api/skills/evaluate', { method: 'POST', body: JSON.stringify(body) }),

  // ==========================================
  // Admin API Endpoints
  // ==========================================
  adminGetDashboard: () => request('/api/admin/dashboard'),
  adminGetUsers: (params) => {
    const cleanParams = Object.fromEntries(Object.entries(params || {}).filter(([_, v]) => v !== undefined && v !== null && v !== ''));
    const qs = new URLSearchParams(cleanParams).toString();
    return request(`/api/admin/users${qs ? `?${qs}` : ''}`);
  },
  adminGetUser: (userId) => request(`/api/admin/users/${userId}`),
  adminUpdateUserStatus: (userId, isActive) => request(`/api/admin/users/${userId}/status`, { method: 'PATCH', body: JSON.stringify({ isActive }) }),
  adminUpdateUserPersona: (userId, persona) => request(`/api/admin/users/${userId}/persona`, { method: 'PATCH', body: JSON.stringify({ persona }) }),
  adminDeleteUser: (userId) => request(`/api/admin/users/${userId}`, { method: 'DELETE' }),
  adminGetScenarios: (params) => {
    const cleanParams = Object.fromEntries(Object.entries(params || {}).filter(([_, v]) => v !== undefined && v !== null && v !== ''));
    const qs = new URLSearchParams(cleanParams).toString();
    return request(`/api/admin/scenarios${qs ? `?${qs}` : ''}`);
  },
  adminUpdateScenario: (scenarioId, payload) => request(`/api/admin/scenarios/${scenarioId}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  adminGetAnalytics: () => request('/api/admin/analytics'),
  adminGetPermissions: () => request('/api/admin/permissions'),
  adminGrantPermission: (userId, permissionId) => request('/api/admin/permissions/grant', { method: 'POST', body: JSON.stringify({ userId, permissionId }) }),
  adminRevokePermission: (userId, permissionId) => request('/api/admin/permissions/revoke', { method: 'POST', body: JSON.stringify({ userId, permissionId }) }),
  adminGetAuditLogs: (params) => {
    const cleanParams = Object.fromEntries(Object.entries(params || {}).filter(([_, v]) => v !== undefined && v !== null && v !== ''));
    const qs = new URLSearchParams(cleanParams).toString();
    return request(`/api/admin/audit-logs${qs ? `?${qs}` : ''}`);
  },
  adminGetAiMonitoring: () => request('/api/admin/ai-monitoring'),
  adminGetSystemStatus: () => request('/api/admin/system-status'),
};
