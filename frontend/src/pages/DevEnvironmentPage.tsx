import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import TuneIcon from '@mui/icons-material/Tune';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorIcon from '@mui/icons-material/Error';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { dashboardTokens, dashboardSemanticColors } from '../styles/dashboardDesignSystem';

const FONT = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
const t = dashboardTokens.colors;

type EnvStatus = 'healthy' | 'degraded' | 'down';
type EnvType = 'production' | 'staging' | 'development' | 'testing';

interface EnvVariable { key: string; value: string; secret: boolean }

interface Environment {
  id: string;
  name: string;
  type: EnvType;
  status: EnvStatus;
  region: string;
  services: number;
  lastDeploy: string;
  variables: EnvVariable[];
}

const MOCK_ENVS: Environment[] = [
  {
    id: 'e1',
    name: 'production',
    type: 'production',
    status: 'healthy',
    region: 'us-east-1',
    services: 12,
    lastDeploy: '2 hours ago',
    variables: [
      { key: 'DATABASE_URL', value: 'postgres://****', secret: true },
      { key: 'REDIS_URL',    value: 'redis://****',    secret: true },
      { key: 'LOG_LEVEL',    value: 'warn',            secret: false },
      { key: 'NODE_ENV',     value: 'production',      secret: false },
    ],
  },
  {
    id: 'e2',
    name: 'staging',
    type: 'staging',
    status: 'degraded',
    region: 'eu-west-1',
    services: 9,
    lastDeploy: 'Yesterday',
    variables: [
      { key: 'DATABASE_URL', value: 'postgres://****', secret: true },
      { key: 'LOG_LEVEL',    value: 'info',            secret: false },
      { key: 'NODE_ENV',     value: 'staging',         secret: false },
    ],
  },
  {
    id: 'e3',
    name: 'development',
    type: 'development',
    status: 'healthy',
    region: 'us-west-2',
    services: 6,
    lastDeploy: '3 days ago',
    variables: [
      { key: 'DATABASE_URL', value: 'postgres://localhost:5432/dev', secret: false },
      { key: 'LOG_LEVEL',    value: 'debug',                        secret: false },
      { key: 'NODE_ENV',     value: 'development',                   secret: false },
    ],
  },
  {
    id: 'e4',
    name: 'testing',
    type: 'testing',
    status: 'down',
    region: 'us-east-2',
    services: 4,
    lastDeploy: '1 week ago',
    variables: [
      { key: 'DATABASE_URL', value: 'postgres://test-db:5432/ci', secret: false },
      { key: 'LOG_LEVEL',    value: 'debug',                      secret: false },
      { key: 'CI',           value: 'true',                       secret: false },
    ],
  },
];

const STATUS_COLOR: Record<EnvStatus, string> = {
  healthy:  dashboardSemanticColors.success,
  degraded: dashboardSemanticColors.warning,
  down:     dashboardSemanticColors.danger,
};
const STATUS_BG: Record<EnvStatus, string> = {
  healthy:  'rgba(34,197,94,.12)',
  degraded: 'rgba(245,158,11,.12)',
  down:     'rgba(239,68,68,.12)',
};
const TYPE_COLOR: Record<EnvType, string> = {
  production:  dashboardSemanticColors.danger,
  staging:     dashboardSemanticColors.warning,
  development: dashboardSemanticColors.info,
  testing:     dashboardSemanticColors.purple,
};
const TYPE_BG: Record<EnvType, string> = {
  production:  'rgba(239,68,68,.10)',
  staging:     'rgba(245,158,11,.10)',
  development: 'rgba(0,224,255,.10)',
  testing:     'rgba(139,92,246,.10)',
};

const StatusIcon: React.FC<{ status: EnvStatus }> = ({ status }) => {
  const props = { sx: { fontSize: '.78rem' } };
  if (status === 'healthy')  return <CheckCircleIcon  {...props} />;
  if (status === 'degraded') return <WarningAmberIcon {...props} />;
  return <ErrorIcon {...props} />;
};

const DevEnvironmentPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = MOCK_ENVS.filter((e) =>
    e.name.toLowerCase().includes(query.toLowerCase()) ||
    e.region.toLowerCase().includes(query.toLowerCase()),
  );

  const stats = [
    { label: 'Environments',  value: MOCK_ENVS.length,                                          color: dashboardSemanticColors.info },
    { label: 'Healthy',       value: MOCK_ENVS.filter(e => e.status === 'healthy').length,       color: dashboardSemanticColors.success },
    { label: 'Degraded',      value: MOCK_ENVS.filter(e => e.status === 'degraded').length,      color: dashboardSemanticColors.warning },
    { label: 'Down',          value: MOCK_ENVS.filter(e => e.status === 'down').length,          color: dashboardSemanticColors.danger },
    { label: 'Total Services',value: MOCK_ENVS.reduce((s, e) => s + e.services, 0),              color: dashboardSemanticColors.purple },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, fontFamily: FONT }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.2rem', md: '1.35rem' }, color: t.textPrimary, fontFamily: FONT, letterSpacing: '-.02em' }}>
            Environment
          </Typography>
          <Typography sx={{ color: t.textSecondary, fontSize: '.875rem', mt: 0.3, fontFamily: FONT }}>
            Manage deployment environments, configuration variables, and regional settings.
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          sx={{
            bgcolor: dashboardTokens.colors.brandPrimary,
            color: '#0a0f1a',
            fontWeight: 700,
            fontSize: '.8rem',
            borderRadius: '6px',
            textTransform: 'none',
            boxShadow: 'none',
            '&:hover': { bgcolor: dashboardTokens.colors.brandPrimaryHover, boxShadow: 'none' },
          }}
        >
          New Environment
        </Button>
      </Box>

      {/* Stats */}
      <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5} sx={{ mb: 3 }}>
        {stats.map((s) => (
          <Card key={s.label} sx={{ flex: 1, border: `1px solid ${t.border}`, bgcolor: t.surface, boxShadow: 'none', borderRadius: '8px' }}>
            <CardContent sx={{ p: '12px 16px !important' }}>
              <Typography sx={{ fontSize: '.72rem', fontWeight: 600, color: t.textSecondary, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: FONT }}>
                {s.label}
              </Typography>
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: s.color, lineHeight: 1.2, fontFamily: FONT }}>
                {s.value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Search */}
      <TextField
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name or region…"
        size="small"
        sx={{
          mb: 2, maxWidth: 440, width: '100%',
          '& .MuiOutlinedInput-root': {
            bgcolor: t.surface, color: t.textPrimary, borderRadius: '8px', fontSize: '.875rem',
            '& fieldset': { borderColor: t.border },
            '&:hover fieldset': { borderColor: t.borderStrong },
            '&.Mui-focused fieldset': { borderColor: dashboardTokens.colors.brandPrimary, boxShadow: '0 0 0 3px rgba(0,224,255,0.14)' },
          },
          '& .MuiInputBase-input::placeholder': { color: t.textSecondary, opacity: 1 },
        }}
        InputProps={{
          startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: t.textSecondary, fontSize: '1rem' }} /></InputAdornment>,
        }}
      />

      {/* Cards */}
      <Stack spacing={1.5}>
        {filtered.length === 0 && (
          <Box sx={{ border: `1px dashed ${t.border}`, borderRadius: '10px', p: 4, textAlign: 'center' }}>
            <Typography sx={{ color: t.textSecondary, fontFamily: FONT }}>No environments match your search.</Typography>
          </Box>
        )}
        {filtered.map((env) => {
          const isExpanded = expandedId === env.id;
          return (
            <Card key={env.id} sx={{ border: `1px solid ${t.border}`, bgcolor: t.surface, boxShadow: 'none', borderRadius: '8px' }}>
              <CardContent sx={{ p: '14px 18px !important' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                  {/* Icon */}
                  <Box sx={{ width: 32, height: 32, borderRadius: '7px', bgcolor: `${TYPE_COLOR[env.type]}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TYPE_COLOR[env.type], flexShrink: 0 }}>
                    <TuneIcon sx={{ fontSize: '.95rem' }} />
                  </Box>

                  {/* Name */}
                  <Box sx={{ flex: 1, minWidth: 120 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '.925rem', color: t.textPrimary, fontFamily: FONT, lineHeight: 1.2 }}>
                      {env.name}
                    </Typography>
                    <Typography sx={{ fontSize: '.78rem', color: t.textSecondary, fontFamily: FONT }}>{env.region}</Typography>
                  </Box>

                  {/* Type */}
                  <Chip label={env.type} size="small" sx={{ bgcolor: TYPE_BG[env.type], color: TYPE_COLOR[env.type], fontWeight: 700, fontSize: '.72rem', height: 18, textTransform: 'capitalize', '& .MuiChip-label': { px: 0.75 } }} />

                  {/* Status */}
                  <Chip
                    icon={<StatusIcon status={env.status} />}
                    label={env.status}
                    size="small"
                    sx={{ bgcolor: STATUS_BG[env.status], color: STATUS_COLOR[env.status], fontWeight: 700, fontSize: '.72rem', height: 18, textTransform: 'capitalize', '& .MuiChip-label': { px: 0.75 }, '& .MuiChip-icon': { color: STATUS_COLOR[env.status], fontSize: '.78rem', ml: 0.5 } }}
                  />

                  {/* Services */}
                  <Typography sx={{ fontSize: '.8rem', color: t.textSecondary, whiteSpace: 'nowrap', fontFamily: FONT }}>
                    {env.services} services
                  </Typography>

                  {/* Deploy time */}
                  <Typography sx={{ fontSize: '.8rem', color: t.textSecondary, whiteSpace: 'nowrap', fontFamily: FONT }}>
                    Deployed {env.lastDeploy}
                  </Typography>

                  {/* Actions */}
                  <Stack direction="row" spacing={0.5} sx={{ ml: 'auto' }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setExpandedId(isExpanded ? null : env.id)}
                      sx={{ fontSize: '.72rem', borderRadius: '5px', textTransform: 'none', borderColor: t.border, color: t.textSecondary, '&:hover': { borderColor: t.borderStrong } }}
                    >
                      {isExpanded ? 'Hide vars' : 'View vars'}
                    </Button>
                    <IconButton size="small" sx={{ color: t.textSecondary }}>
                      <MoreHorizIcon sx={{ fontSize: '1rem' }} />
                    </IconButton>
                  </Stack>
                </Box>

                {/* Expanded variables */}
                {isExpanded && (
                  <Box sx={{ mt: 1.5 }}>
                    <Divider sx={{ borderColor: t.border, mb: 1.5 }} />
                    <Typography sx={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: t.textSecondary, mb: 1, fontFamily: FONT }}>
                      Environment Variables
                    </Typography>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          {['Key', 'Value', ''].map((h) => (
                            <TableCell key={h} sx={{ color: t.textSecondary, fontSize: '.7rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', borderColor: t.border, py: 0.75, fontFamily: FONT }}>
                              {h}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {env.variables.map((v) => (
                          <TableRow key={v.key} sx={{ '& td': { borderColor: t.border } }}>
                            <TableCell sx={{ fontWeight: 600, fontSize: '.82rem', color: t.textPrimary, fontFamily: FONT, py: 0.75 }}>
                              {v.key}
                            </TableCell>
                            <TableCell sx={{ fontSize: '.82rem', color: v.secret ? t.textSecondary : t.textPrimary, fontFamily: FONT, py: 0.75 }}>
                              {v.secret ? (
                                <Chip label="secret" size="small" sx={{ bgcolor: 'rgba(239,68,68,.1)', color: dashboardSemanticColors.danger, fontSize: '.68rem', height: 16, '& .MuiChip-label': { px: 0.6 } }} />
                              ) : v.value}
                            </TableCell>
                            <TableCell align="right" sx={{ py: 0.75 }}>
                              <Tooltip title="Copy key">
                                <IconButton size="small" sx={{ color: t.textSecondary }}>
                                  <ContentCopyIcon sx={{ fontSize: '.78rem' }} />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                )}
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </Box>
  );
};

export default DevEnvironmentPage;
