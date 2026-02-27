export const dashboardTokens = {
  colors: {
    background: 'var(--dashboard-background)',
    surface: 'var(--dashboard-surface)',
    surfaceSubtle: 'var(--dashboard-surface-subtle)',
    surfaceHover: 'var(--dashboard-surface-hover)',
    border: 'var(--dashboard-border)',
    borderStrong: 'var(--dashboard-border-strong)',
    textPrimary: 'var(--dashboard-text-primary)',
    textSecondary: 'var(--dashboard-text-secondary)',
    textTertiary: 'var(--dashboard-text-tertiary)',
    brandPrimary: '#008080',
    brandPrimaryHover: '#006b6b',
    white: '#FFFFFF',
  },
  radius: {
    sm: 1,
    md: 1,
  },
} as const;

export const dashboardSemanticColors = {
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#008080',
  infoAlt: '#006b6b',
  purple: '#8B5CF6',
  orange: '#F97316',
  cyan: '#008080',
  teal: '#00C8E5',
  pink: '#EC4899',
  critical: '#DC2626',
} as const;

export const dashboardStatusColors = {
  invoice: {
    draft: dashboardSemanticColors.purple,
    open: dashboardSemanticColors.warning,
    paid: dashboardSemanticColors.success,
    void: dashboardTokens.colors.textSecondary,
    uncollectable: dashboardSemanticColors.danger,
  },
  domain: {
    active: dashboardSemanticColors.success,
    pending: dashboardSemanticColors.warning,
    expired: dashboardSemanticColors.danger,
    suspended: dashboardSemanticColors.danger,
    transferring: dashboardSemanticColors.info,
    deleting: dashboardTokens.colors.textSecondary,
    error: dashboardSemanticColors.danger,
  },
  ssl: {
    active: dashboardSemanticColors.success,
    pending: dashboardSemanticColors.warning,
    expired: dashboardSemanticColors.danger,
    revoked: dashboardTokens.colors.textSecondary,
    error: dashboardSemanticColors.danger,
  },
  monitoringService: {
    operational: dashboardSemanticColors.success,
    degraded: dashboardSemanticColors.warning,
    partial_outage: dashboardSemanticColors.orange,
    major_outage: dashboardSemanticColors.danger,
    maintenance: dashboardSemanticColors.purple,
  },
  incidentSeverity: {
    sev1: dashboardSemanticColors.danger,
    sev2: dashboardSemanticColors.orange,
    sev3: dashboardSemanticColors.warning,
    sev4: dashboardSemanticColors.info,
  },
  incidentStatus: {
    open: dashboardSemanticColors.danger,
    investigating: dashboardSemanticColors.orange,
    identified: dashboardSemanticColors.warning,
    monitoring: dashboardSemanticColors.info,
    resolved: dashboardSemanticColors.success,
    postmortem: dashboardSemanticColors.purple,
  },
  alertState: {
    firing: dashboardSemanticColors.danger,
    resolved: dashboardSemanticColors.success,
    silenced: dashboardSemanticColors.purple,
  },
  logLevel: {
    INFO: dashboardSemanticColors.info,
    WARNING: dashboardSemanticColors.warning,
    ERROR: dashboardSemanticColors.danger,
    DEBUG: dashboardSemanticColors.purple,
    CRITICAL: dashboardSemanticColors.critical,
  },
  plan: {
    free: dashboardTokens.colors.textSecondary,
    starter: dashboardSemanticColors.info,
    professional: dashboardSemanticColors.purple,
    enterprise: dashboardSemanticColors.warning,
  },
  service: {
    compute: dashboardSemanticColors.info,
    storage: dashboardSemanticColors.success,
    database: dashboardSemanticColors.purple,
    networking: dashboardSemanticColors.warning,
    containers: dashboardSemanticColors.orange,
    email: dashboardSemanticColors.cyan,
    dns: dashboardSemanticColors.pink,
    api: dashboardSemanticColors.teal,
  },
} as const;

export const computeCatalogPalette = {
  logos: {
    debian: '#A80030',
    ubuntu: '#E95420',
    linuxMint: '#87CF3E',
    kali: '#268BEE',
    mxLinux: '#4A90D9',
    deepin: '#0098D8',
    zorin: '#15A6F0',
    elementary: '#64BAFF',
    popos: '#48B9C7',
    antix: '#6B7280',
    pureos: '#5B3A8E',
    parrot: '#05A6E3',
    bodhi: '#4CAF50',
    peppermint: '#E44426',
    centos: '#9B0000',
    windows: '#0078D4',
  },
  badges: {
    recommended: '#10B981',
    latest: '#10B981',
    stable: '#10B981',
    new: '#6366F1',
    security: '#6366F1',
    enterprise: '#6B7280',
    eol: '#EF4444',
    eolSoon: '#F59E0B',
    flavorBadge: '#6366F1',
  },
} as const;

export const computeUiTokens = {
  accentStrong: '#008080',
  accentSoftLight: 'rgba(0,128,128,.08)',
  accentSoftDark: 'rgba(0,128,128,.18)',
  darkPanel: '#111827',
  successStrong: '#10B981',
  successHover: '#059669',
  successSoft: 'rgba(16,185,129,.12)',
  violetSoft: 'rgba(0,128,128,.12)',
  neutralStrong: '#0A0F1F',
  neutralBody: '#374151',
  neutralMuted: '#9CA3AF',
  surfaceSubtle: '#FAFAFA',
  borderHover: '#94A3B8',
} as const;

export const atonixBrandTokens = {
  colorPrimary: '#0A0F1F',
  colorPrimaryContrast: '#FFFFFF',
  colorAccent: '#008080',
  colorAccentHover: '#006b6b',
  colorTextPrimary: '#FFFFFF',
  colorTextSecondary: '#A0A8B5',
  colorBorder: '#1F2937',
  colorSurface: '#111827',
  radiusSmall: '2px',
  radiusNone: '0px',
} as const;

export const dashboardPageSx = {
  bgcolor: dashboardTokens.colors.background,
} as const;

export const dashboardCardSx = {
  border: `1px solid ${dashboardTokens.colors.border}`,
  boxShadow: 'none',
  borderRadius: dashboardTokens.radius.md,
  bgcolor: dashboardTokens.colors.surface,
} as const;

export const dashboardPrimaryButtonSx = {
  bgcolor: dashboardTokens.colors.brandPrimary,
  textTransform: 'none',
  fontWeight: 500,
  '&:hover': {
    bgcolor: dashboardTokens.colors.brandPrimaryHover,
  },
} as const;

export const dashboardSecondaryButtonSx = {
  borderColor: dashboardTokens.colors.borderStrong,
  color: dashboardTokens.colors.textPrimary,
  textTransform: 'none',
} as const;
