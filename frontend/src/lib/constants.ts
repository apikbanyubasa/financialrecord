export const APP_CONFIG = {
  name: 'FinancialRecord',
  tagline: 'AI-Powered Personal Finance & Smart Budgeting Platform',
  version: '1.0.0',
};

export const USER_NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Transaksi', href: '/transactions', icon: 'Receipt' },
  { label: 'Kantong Pos', href: '/wallets', icon: 'Wallet' },
  { label: 'Limit Budget', href: '/budgets', icon: 'PieChart' },
  { label: 'Pengaturan', href: '/settings', icon: 'Settings' },
];

export const ADMIN_NAV_ITEMS = [
  { label: 'Dashboard Admin', href: '/admin/dashboard', icon: 'BarChart3' },
  { label: 'Manajemen User', href: '/admin/users', icon: 'Users' },
  { label: 'AI & Token Monitor', href: '/admin/ai-monitoring', icon: 'Cpu' },
  { label: 'Master Kategori', href: '/admin/categories', icon: 'Tags' },
  { label: 'Audit Logs', href: '/admin/audit-logs', icon: 'ShieldAlert' },
];
