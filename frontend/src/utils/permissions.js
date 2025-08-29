// 角色权限映射
const rolePermissions = {
  'Scrum Master': [
    'view_all',
    'manage_sprints',
    'manage_team',
    'manage_backlog',
    'manage_tasks',
    'manage_reports',
    'manage_releases'
  ],
  'Product Owner': [
    'view_all',
    'manage_backlog',
    'manage_stories',
    'manage_epics',
    'manage_releases',
    'approve_stories'
  ],
  'Developer': [
    'view_assigned',
    'update_tasks',
    'create_bugs',
    'update_bugs',
    'view_documents'
  ],
  'Designer': [
    'view_assigned',
    'update_tasks',
    'create_documents',
    'update_documents'
  ],
  'Tester': [
    'view_assigned',
    'create_bugs',
    'update_bugs',
    'view_documents'
  ],
  'Stakeholder': [
    'view_reports',
    'view_releases',
    'view_documents'
  ]
};

// 检查用户是否有特定权限
export const hasPermission = (userRole, permission) => {
  if (!userRole || !permission) return false;
  
  // 如果用户角色不在预定义的角色中，返回false
  if (!rolePermissions[userRole]) return false;
  
  return rolePermissions[userRole].includes(permission);
};

// 检查用户是否有多个权限中的任意一个
export const hasAnyPermission = (userRole, permissions) => {
  if (!userRole || !permissions || !permissions.length) return false;
  
  return permissions.some(permission => hasPermission(userRole, permission));
};

// 检查用户是否有所有指定的权限
export const hasAllPermissions = (userRole, permissions) => {
  if (!userRole || !permissions || !permissions.length) return false;
  
  return permissions.every(permission => hasPermission(userRole, permission));
};

// 获取用户所有权限
export const getUserPermissions = (userRole) => {
  if (!userRole || !rolePermissions[userRole]) return [];
  
  return rolePermissions[userRole];
};