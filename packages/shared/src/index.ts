export const basePermissions = [
  'comments.create',
  'comments.manage_own',
  'engagement.manage_own',
  'reports.create',
] as const;
export const rolePermissions = {
  USER: [...basePermissions],
  CONTENT_MANAGER: [
    ...basePermissions,
    'documents.create',
    'documents.update',
    'documents.delete',
    'documents.publish',
    'taxonomy.manage',
  ],
  MODERATOR: [...basePermissions, 'moderation.review', 'moderation.action'],
  SEO_SPECIALIST: [...basePermissions, 'seo.edit', 'analytics.read'],
  SUPER_ADMIN: [
    ...basePermissions,
    'documents.create',
    'documents.update',
    'documents.delete',
    'documents.publish',
    'taxonomy.manage',
    'moderation.review',
    'moderation.action',
    'seo.edit',
    'analytics.read',
    'users.manage',
    'roles.assign',
    'permissions.manage',
    'audit.read',
    'settings.manage',
  ],
} as const;
export const permissionKeys = [...new Set(Object.values(rolePermissions).flat())];
export const coreAdminPermissions = [
  'users.manage',
  'roles.assign',
  'permissions.manage',
  'audit.read',
  'settings.manage',
];
