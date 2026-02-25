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
import GroupsIcon from '@mui/icons-material/Groups';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { dashboardTokens, dashboardSemanticColors } from '../styles/dashboardDesignSystem';

const FONT = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

interface Group {
  id: string;
  name: string;
  description: string;
  members: number;
  services: string[];
  access: 'private' | 'internal' | 'public';
  updatedAt: string;
}

const MOCK_GROUPS: Group[] = [
  {
    id: 'g1',
    name: 'platform-core',
    description: 'Core infrastructure and platform ownership',
    members: 8,
    services: ['payment-service', 'api-gateway', 'auth-service'],
    access: 'private',
    updatedAt: '2 hours ago',
  },
  {
    id: 'g2',
    name: 'frontend-squad',
    description: 'Web frontend, design system and CDN deployments',
    members: 5,
    services: ['web-frontend', 'cdn-worker'],
    access: 'internal',
    updatedAt: 'Yesterday',
  },
  {
    id: 'g3',
    name: 'data-engineering',
    description: 'Data pipelines, Kafka, and analytics infra',
    members: 6,
    services: ['events-worker', 'kafka-consumer', 'spark-jobs'],
    access: 'internal',
    updatedAt: '3 days ago',
  },
  {
    id: 'g4',
    name: 'security-ops',
    description: 'Encryption key management, compliance and audit',
    members: 3,
    services: ['kms-proxy', 'audit-logger'],
    access: 'private',
    updatedAt: '1 week ago',
  },
  {
    id: 'g5',
    name: 'open-api-team',
    description: 'Public API management, SDKs and developer portal',
    members: 4,
    services: ['dev-portal', 'sdk-ci'],
    access: 'public',
    updatedAt: '5 days ago',
  },
];

const ACCESS_COLOR: Record<Group['access'], string> = {
  private:  dashboardSemanticColors.danger,
  internal: dashboardSemanticColors.warning,
  public:   dashboardSemanticColors.success,
};

const ACCESS_BG: Record<Group['access'], string> = {
  private:  'rgba(239,68,68,.12)',
  internal: 'rgba(245,158,11,.12)',
  public:   'rgba(34,197,94,.12)',
};

const AccessIcon: React.FC<{ access: Group['access'] }> = ({ access }) =>
  access === 'private'
    ? <LockIcon sx={{ fontSize: '.78rem' }} />
    : <LockOpenIcon sx={{ fontSize: '.78rem' }} />;

const DevGroupsPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const t = dashboardTokens.colors;

  const filtered = MOCK_GROUPS.filter(
    (g) =>
      g.name.toLowerCase().includes(query.toLowerCase()) ||
      g.description.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, fontFamily: FONT }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box>
          <Typography
            sx={{ fontWeight: 800, fontSize: { xs: '1.2rem', md: '1.35rem' }, color: t.textPrimary, fontFamily: FONT, letterSpacing: '-.02em' }}
          >
            Groups
          </Typography>
          <Typography sx={{ color: t.textSecondary, fontSize: '.875rem', mt: 0.3, fontFamily: FONT }}>
            Organise team members, services, and access policies into logical groups.
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
          New Group
        </Button>
      </Box>

      {/* Stats bar */}
      <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5} sx={{ mb: 3 }}>
        {[
          { label: 'Total Groups', value: MOCK_GROUPS.length, color: dashboardSemanticColors.info },
          { label: 'Private',      value: MOCK_GROUPS.filter(g => g.access === 'private').length,  color: dashboardSemanticColors.danger },
          { label: 'Internal',     value: MOCK_GROUPS.filter(g => g.access === 'internal').length, color: dashboardSemanticColors.warning },
          { label: 'Public',       value: MOCK_GROUPS.filter(g => g.access === 'public').length,   color: dashboardSemanticColors.success },
          { label: 'Total Members',value: MOCK_GROUPS.reduce((s, g) => s + g.members, 0),          color: dashboardSemanticColors.purple },
        ].map((stat) => (
          <Card
            key={stat.label}
            sx={{
              flex: 1,
              border: `1px solid ${t.border}`,
              bgcolor: t.surface,
              boxShadow: 'none',
              borderRadius: '8px',
            }}
          >
            <CardContent sx={{ p: '12px 16px !important' }}>
              <Typography sx={{ fontSize: '.72rem', fontWeight: 600, color: t.textSecondary, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: FONT }}>
                {stat.label}
              </Typography>
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: stat.color, lineHeight: 1.2, fontFamily: FONT }}>
                {stat.value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Search */}
      <TextField
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search groups by name or description…"
        size="small"
        sx={{
          mb: 2,
          maxWidth: 480,
          width: '100%',
          '& .MuiOutlinedInput-root': {
            bgcolor: t.surface,
            color: t.textPrimary,
            borderRadius: '8px',
            fontSize: '.875rem',
            '& fieldset': { borderColor: t.border },
            '&:hover fieldset': { borderColor: t.borderStrong },
            '&.Mui-focused fieldset': {
              borderColor: dashboardTokens.colors.brandPrimary,
              boxShadow: `0 0 0 3px rgba(0,224,255,0.14)`,
            },
          },
          '& .MuiInputBase-input::placeholder': { color: t.textSecondary, opacity: 1 },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: t.textSecondary, fontSize: '1rem' }} />
            </InputAdornment>
          ),
        }}
      />

      {/* Table */}
      <Card sx={{ border: `1px solid ${t.border}`, bgcolor: t.surface, boxShadow: 'none', borderRadius: '8px' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: t.surfaceSubtle }}>
              {['Group', 'Description', 'Members', 'Services', 'Access', 'Updated', ''].map((h) => (
                <TableCell
                  key={h}
                  sx={{
                    color: t.textSecondary,
                    fontSize: '.72rem',
                    fontWeight: 700,
                    letterSpacing: '.07em',
                    textTransform: 'uppercase',
                    borderColor: t.border,
                    py: 1.25,
                    fontFamily: FONT,
                  }}
                >
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4, color: t.textSecondary, borderColor: t.border }}>
                  No groups match your search.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((group, idx) => (
                <TableRow
                  key={group.id}
                  sx={{
                    bgcolor: idx % 2 === 0 ? 'transparent' : t.surfaceSubtle,
                    '&:hover': { bgcolor: t.surfaceHover },
                    '& td': { borderColor: t.border },
                  }}
                >
                  {/* Name */}
                  <TableCell sx={{ py: 1.25 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 28, height: 28, borderRadius: '6px',
                          bgcolor: 'rgba(0,224,255,0.12)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: dashboardTokens.colors.brandPrimary, flexShrink: 0,
                        }}
                      >
                        <GroupsIcon sx={{ fontSize: '.9rem' }} />
                      </Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '.875rem', color: t.textPrimary, fontFamily: FONT }}>
                        {group.name}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Description */}
                  <TableCell sx={{ color: t.textSecondary, fontSize: '.82rem', maxWidth: 240, fontFamily: FONT }}>
                    {group.description}
                  </TableCell>

                  {/* Members */}
                  <TableCell>
                    <Chip
                      label={group.members}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(139,92,246,.14)',
                        color: dashboardSemanticColors.purple,
                        fontWeight: 700,
                        fontSize: '.72rem',
                        height: 18,
                        '& .MuiChip-label': { px: 0.75 },
                      }}
                    />
                  </TableCell>

                  {/* Services */}
                  <TableCell>
                    <Stack direction="row" gap={0.5} flexWrap="wrap">
                      {group.services.slice(0, 2).map((s) => (
                        <Chip
                          key={s}
                          label={s}
                          size="small"
                          sx={{
                            bgcolor: t.surfaceSubtle,
                            color: t.textSecondary,
                            border: `1px solid ${t.border}`,
                            fontSize: '.68rem',
                            height: 18,
                            '& .MuiChip-label': { px: 0.75 },
                          }}
                        />
                      ))}
                      {group.services.length > 2 && (
                        <Tooltip title={group.services.slice(2).join(', ')}>
                          <Chip
                            label={`+${group.services.length - 2}`}
                            size="small"
                            sx={{
                              bgcolor: t.surfaceSubtle,
                              color: t.textTertiary,
                              fontSize: '.68rem',
                              height: 18,
                              '& .MuiChip-label': { px: 0.75 },
                            }}
                          />
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>

                  {/* Access */}
                  <TableCell>
                    <Chip
                      icon={<AccessIcon access={group.access} />}
                      label={group.access}
                      size="small"
                      sx={{
                        bgcolor: ACCESS_BG[group.access],
                        color: ACCESS_COLOR[group.access],
                        fontWeight: 700,
                        fontSize: '.72rem',
                        height: 18,
                        textTransform: 'capitalize',
                        '& .MuiChip-label': { px: 0.75 },
                        '& .MuiChip-icon': { color: ACCESS_COLOR[group.access], fontSize: '.72rem', ml: 0.5 },
                      }}
                    />
                  </TableCell>

                  {/* Updated */}
                  <TableCell sx={{ color: t.textSecondary, fontSize: '.8rem', whiteSpace: 'nowrap', fontFamily: FONT }}>
                    {group.updatedAt}
                  </TableCell>

                  {/* Actions */}
                  <TableCell align="right">
                    <IconButton size="small" sx={{ color: t.textSecondary }}>
                      <MoreHorizIcon sx={{ fontSize: '1rem' }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <Divider sx={{ borderColor: t.border }} />
        <Box sx={{ px: 2, py: 1.25, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: '.78rem', color: t.textSecondary, fontFamily: FONT }}>
            {filtered.length} of {MOCK_GROUPS.length} groups
          </Typography>
        </Box>
      </Card>
    </Box>
  );
};

export default DevGroupsPage;
