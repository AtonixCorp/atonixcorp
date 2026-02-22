// AtonixCorp Cloud – Compute / Deploy Server Page

import React, { useState } from 'react';
import {
  Box, Typography, Stack, Button, Chip, IconButton,
  TextField, Radio, RadioGroup, FormControlLabel,
  Stepper, Step, StepLabel, StepConnector,
  stepConnectorClasses, Tooltip, Alert, CircularProgress,
  Divider, Paper,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import CheckIcon          from '@mui/icons-material/Check';
import RocketLaunchIcon   from '@mui/icons-material/RocketLaunch';
import StorageIcon        from '@mui/icons-material/Storage';
import MemoryIcon         from '@mui/icons-material/Memory';
import SpeedIcon          from '@mui/icons-material/Speed';
import NetworkCheckIcon   from '@mui/icons-material/NetworkCheck';
import AddIcon            from '@mui/icons-material/Add';
import RemoveIcon         from '@mui/icons-material/Remove';
import PublicIcon         from '@mui/icons-material/Public';
import LockIcon           from '@mui/icons-material/Lock';
import InfoOutlinedIcon   from '@mui/icons-material/InfoOutlined';

// ── Types ─────────────────────────────────────────────────────────────────────
interface OSVersion {
  id: string;
  version: string;
  badge?: string;
  badgeColor?: string;
}

interface OSGroup {
  groupId: string;
  family: string;
  name: string;
  logo: string;
  logoColor: string;
  description: string;
  badge?: string;
  badgeColor?: string;
  versions: OSVersion[];
}

// Keep legacy type alias for review step lookup
type OS = OSGroup & { id: string; version: string; };

interface Flavor {
  id: string;
  name: string;
  vcpu: number;
  ram_gb: number;
  disk_gb: number;
  bandwidth_tb: number;
  price_mo: number;
  badge?: string;
  recommended?: boolean;
}

// ── OS catalogue (grouped) ──────────────────────────────────────────────────
const OS_GROUPS: OSGroup[] = [
  // ── Debian family ──────────────────────────────────────────────────────────
  { groupId: 'debian',      family: 'Debian',     name: 'Debian',        logo: 'Deb',  logoColor: '#A80030', badge: 'Recommended', badgeColor: '#10B981', description: 'Rock-solid, minimal, universal OS — the mother of all Debian distros', versions: [
    { id: 'debian-13', version: '13 Trixie',   badge: 'New',      badgeColor: '#6366F1' },
    { id: 'debian-12', version: '12 Bookworm', badge: 'Stable',   badgeColor: '#10B981' },
    { id: 'debian-11', version: '11 Bullseye' },
    { id: 'debian-10', version: '10 Buster',  badge: 'EOL',      badgeColor: '#EF4444' },
  ]},
  { groupId: 'ubuntu',      family: 'Ubuntu',     name: 'Ubuntu',        logo: 'Ubu',  logoColor: '#E95420', description: 'Most popular Linux distro, backed by Canonical', versions: [
    { id: 'ubuntu-2404', version: '24.04 LTS', badge: 'Latest',   badgeColor: '#10B981' },
    { id: 'ubuntu-2204', version: '22.04 LTS' },
    { id: 'ubuntu-2004', version: '20.04 LTS', badge: 'EOL Soon', badgeColor: '#F59E0B' },
  ]},
  { groupId: 'linuxmint',   family: 'Linux Mint', name: 'Linux Mint',    logo: 'Mint', logoColor: '#87CF3E', description: 'User-friendly desktop-oriented Ubuntu derivative', versions: [
    { id: 'linuxmint-22', version: '22 Wilma' },
    { id: 'linuxmint-21', version: '21 Vera'  },
  ]},
  { groupId: 'kali',        family: 'Kali',       name: 'Kali Linux',    logo: 'Kali', logoColor: '#268BEE', badge: 'Security', badgeColor: '#6366F1', description: 'Advanced penetration testing & security auditing distro', versions: [
    { id: 'kali-2024', version: '2024.4' },
    { id: 'kali-2023', version: '2023.4' },
  ]},
  { groupId: 'mxlinux',     family: 'MX Linux',   name: 'MX Linux',      logo: 'MX',   logoColor: '#4A90D9', description: 'Antipatterns-free, cooperative development Linux', versions: [
    { id: 'mxlinux-23', version: '23 Libretto' },
  ]},
  { groupId: 'deepin',      family: 'Deepin',     name: 'Deepin',        logo: 'Dpe',  logoColor: '#0098D8', description: 'Beautiful, intuitive Chinese Linux distribution', versions: [
    { id: 'deepin-23', version: '23' },
  ]},
  { groupId: 'zorin',       family: 'Zorin',      name: 'Zorin OS',      logo: 'Zrn',  logoColor: '#15A6F0', description: 'Windows-familiar interface, built on Ubuntu LTS', versions: [
    { id: 'zorin-17', version: '17' },
    { id: 'zorin-16', version: '16' },
  ]},
  { groupId: 'elementary',  family: 'Elementary', name: 'Elementary OS', logo: 'eos',  logoColor: '#64BAFF', description: 'macOS-inspired, privacy-first Ubuntu derivative', versions: [
    { id: 'elementaryos-8', version: '8 Circe' },
  ]},
  { groupId: 'popos',       family: 'Pop!_OS',    name: 'Pop!_OS',       logo: 'Pop',  logoColor: '#48B9C7', description: 'System76 developer-focused Ubuntu variant', versions: [
    { id: 'popos-2204', version: '22.04 LTS' },
  ]},
  { groupId: 'antix',       family: 'antiX',      name: 'antiX',         logo: 'aX',   logoColor: '#6B7280', description: 'Fast, lightweight, systemd-free Debian derivative', versions: [
    { id: 'antix-23', version: '23 Arditi del Popolo' },
  ]},
  { groupId: 'pureos',      family: 'PureOS',     name: 'PureOS',        logo: 'Pur',  logoColor: '#5B3A8E', description: 'Privacy-respecting, FSF-endorsed Debian derivative', versions: [
    { id: 'pureos-10', version: '10 Byzantium' },
  ]},
  { groupId: 'parrot',      family: 'Parrot',     name: 'Parrot OS',     logo: 'Par',  logoColor: '#05A6E3', badge: 'Security', badgeColor: '#6366F1', description: 'Security & forensics-oriented Debian fork', versions: [
    { id: 'parrotos-6', version: '6.2' },
    { id: 'parrotos-5', version: '5.3' },
  ]},
  { groupId: 'bodhi',       family: 'Bodhi',      name: 'Bodhi Linux',   logo: 'Boh',  logoColor: '#4CAF50', description: 'Lightweight, elegantly minimal Ubuntu derivative', versions: [
    { id: 'bodhi-7', version: '7.0' },
  ]},
  { groupId: 'peppermint',  family: 'Peppermint', name: 'Peppermint OS', logo: 'Pep',  logoColor: '#e44426', description: 'Cloud-oriented Debian lightweight desktop OS', versions: [
    { id: 'peppermint-11', version: '11' },
  ]},
  // ── Other ──────────────────────────────────────────────────────────────────
  { groupId: 'centos',      family: 'RHEL',       name: 'CentOS',        logo: 'CeS',  logoColor: '#9B0000', badge: 'Enterprise', badgeColor: '#6B7280', description: 'Enterprise-grade RHEL upstream tracking distro', versions: [
    { id: 'centos-stream-9', version: 'Stream 9' },
    { id: 'centos-stream-8', version: 'Stream 8' },
  ]},
  { groupId: 'windows',     family: 'Windows',    name: 'Windows Server',logo: 'Win',  logoColor: '#0078D4', description: 'Microsoft Windows Server — Datacenter & Standard editions', versions: [
    { id: 'windows-2022', version: 'Server 2022', badge: 'Latest', badgeColor: '#10B981' },
    { id: 'windows-2019', version: 'Server 2019' },
    { id: 'windows-2016', version: 'Server 2016' },
  ]},
];

// Flat map used only for review-step lookup
const OS_FLAT: { id: string; name: string; version: string; logoColor: string }[] =
  OS_GROUPS.flatMap(g => g.versions.map(v => ({ id: v.id, name: g.name, version: v.version, logoColor: g.logoColor })));

// ── Flavors ───────────────────────────────────────────────────────────────────
const FLAVORS: Flavor[] = [
  { id: 'nano',    name: 'Nano',    vcpu: 1,  ram_gb: 0.5, disk_gb: 10,  bandwidth_tb: 0.5, price_mo: 4    },
  { id: 'micro',   name: 'Micro',   vcpu: 1,  ram_gb: 1,   disk_gb: 25,  bandwidth_tb: 1,   price_mo: 6    },
  { id: 'small',   name: 'Small',   vcpu: 1,  ram_gb: 2,   disk_gb: 50,  bandwidth_tb: 2,   price_mo: 12   },
  { id: 'medium',  name: 'Medium',  vcpu: 2,  ram_gb: 4,   disk_gb: 80,  bandwidth_tb: 4,   price_mo: 24,  recommended: true },
  { id: 'large',   name: 'Large',   vcpu: 4,  ram_gb: 8,   disk_gb: 160, bandwidth_tb: 5,   price_mo: 48   },
  { id: 'xlarge',  name: 'X-Large', vcpu: 8,  ram_gb: 16,  disk_gb: 320, bandwidth_tb: 6,   price_mo: 96   },
  { id: '2xlarge', name: '2X-Large',vcpu: 16, ram_gb: 32,  disk_gb: 640, bandwidth_tb: 8,   price_mo: 192, badge: 'High Perf' },
  { id: 'gpu',     name: 'GPU-1x',  vcpu: 8,  ram_gb: 32,  disk_gb: 320, bandwidth_tb: 10,  price_mo: 299, badge: 'GPU' },
];

const REGIONS = [
  { id: 'af-south-1', label: 'Africa — Johannesburg',   flag: '🇿🇦' },
  { id: 'eu-west-1',  label: 'Europe — Frankfurt',       flag: '🇩🇪' },
  { id: 'ap-south-1', label: 'Asia — Singapore',         flag: '🇸🇬' },
  { id: 'us-east-1',  label: 'US East — New York',       flag: '🇺🇸' },
  { id: 'us-west-1',  label: 'US West — Los Angeles',    flag: '🇺🇸' },
];

// ── Styled stepper connector ──────────────────────────────────────────────────
const StepConnectorStyled = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: { top: 16 },
  [`&.${stepConnectorClasses.active} .${stepConnectorClasses.line}`]:    { borderColor: '#18366A' },
  [`&.${stepConnectorClasses.completed} .${stepConnectorClasses.line}`]: { borderColor: '#18366A' },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,.1)' : '#E5E7EB',
    borderTopWidth: 2,
  },
}));

const StepIconStyled = ({ active, completed, icon, isDark }: { active?: boolean; completed?: boolean; icon: React.ReactNode; isDark: boolean }) => (
  <Box sx={{
    width: 34, height: 34, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    bgcolor: completed ? '#18366A' : active ? '#18366A' : (isDark ? 'rgba(255,255,255,.08)' : '#E5E7EB'),
    border: `2px solid ${active || completed ? '#18366A' : 'transparent'}`,
    transition: 'all .2s',
  }}>
    {completed
      ? <CheckIcon sx={{ fontSize: '.9rem', color: '#fff' }} />
      : <Typography sx={{ fontSize: '.8rem', fontWeight: 700, color: active ? '#fff' : (isDark ? 'rgba(255,255,255,.4)' : '#9CA3AF') }}>{icon}</Typography>
    }
  </Box>
);

// ── Section wrapper ───────────────────────────────────────────────────────────
function SSection({ title, subtitle, children, isDark }: { title: string; subtitle?: string; children: React.ReactNode; isDark: boolean }) {
  return (
    <Box mb={4}>
      <Typography fontWeight={800} fontSize="1rem" color={isDark ? '#ffffff' : '#0A0F1F'} mb={.25}>{title}</Typography>
      {subtitle && <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,.5)' : '#6B7280', mb: 2 }}>{subtitle}</Typography>}
      {children}
    </Box>
  );
}

// ── OS card (with inline version dropdown) ──────────────────────────────────
function OSCard({ group, selectedVersionId, onSelect, isDark }: {
  group: OSGroup;
  selectedVersionId: string;
  onSelect: (id: string) => void;
  isDark: boolean;
}) {
  const border    = isDark ? 'rgba(255,255,255,.08)' : '#E5E7EB';
  const textSec   = isDark ? 'rgba(255,255,255,.45)' : '#9CA3AF';
  // The group is 'active' if any of its versions is the selected one
  const activeVer = group.versions.find(v => v.id === selectedVersionId);
  const isGroupActive = !!activeVer;
  // Local state: which version tab is highlighted (defaults to first version)
  const [hoveredVer, setHoveredVer] = useState<string>(group.versions[0].id);
  const displayVer = activeVer ?? group.versions.find(v => v.id === hoveredVer) ?? group.versions[0];

  return (
    <Box sx={{
      borderRadius: '12px', overflow: 'hidden',
      border: `2px solid ${isGroupActive ? '#18366A' : border}`,
      bgcolor: isGroupActive
        ? isDark ? 'rgba(24,54,106,.18)' : 'rgba(24,54,106,.04)'
        : isDark ? 'rgba(255,255,255,.03)' : '#FAFAFA',
      transition: 'border-color .12s',
      '&:hover': { borderColor: isGroupActive ? '#18366A' : isDark ? 'rgba(255,255,255,.22)' : '#94A3B8' },
    }}>
      {/* ── Header row ── */}
      <Box sx={{ p: '14px 14px 10px', display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
        <Box sx={{ width: 40, height: 40, borderRadius: '9px', bgcolor: `${group.logoColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Typography sx={{ fontFamily: 'monospace', fontSize: '.72rem', fontWeight: 800, color: group.logoColor }}>{group.logo}</Typography>
        </Box>
        <Box flex={1} minWidth={0}>
          <Box display="flex" alignItems="center" gap={.6} flexWrap="wrap">
            <Typography fontWeight={700} fontSize=".9rem" color={isDark ? '#ffffff' : '#0A0F1F'}>{group.name}</Typography>
            {group.badge && (
              <Chip size="small" label={group.badge} sx={{ height: 14, fontSize: '.58rem', fontWeight: 700, bgcolor: `${group.badgeColor}18`, color: group.badgeColor }} />
            )}
            {isGroupActive && (
              <Box sx={{ ml: 'auto', width: 18, height: 18, bgcolor: '#18366A', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CheckIcon sx={{ fontSize: '.7rem', color: '#fff' }} />
              </Box>
            )}
          </Box>
          <Typography variant="caption" sx={{ color: textSec, lineHeight: 1.4, display: 'block', mt: .25 }}>
            {group.description}
          </Typography>
        </Box>
      </Box>

      {/* ── Version pills ── */}
      <Box sx={{ px: 1.5, pb: 1.5, display: 'flex', gap: .6, flexWrap: 'wrap' }}>
        {group.versions.map(v => {
          const isSelected = v.id === selectedVersionId;
          const isHovered  = v.id === hoveredVer;
          return (
            <Box
              key={v.id}
              onClick={e => { e.stopPropagation(); onSelect(v.id); }}
              onMouseEnter={() => !activeVer && setHoveredVer(v.id)}
              sx={{
                display: 'flex', alignItems: 'center', gap: .5,
                px: 1.25, py: .45, borderRadius: '20px', cursor: 'pointer',
                border: `1.5px solid ${
                  isSelected
                    ? '#18366A'
                    : isHovered && !activeVer
                      ? isDark ? 'rgba(255,255,255,.25)' : '#94A3B8'
                      : border
                }`,
                bgcolor: isSelected
                  ? '#18366A'
                  : isHovered && !activeVer
                    ? isDark ? 'rgba(255,255,255,.06)' : 'rgba(24,54,106,.04)'
                    : 'transparent',
                transition: 'all .1s',
              }}
            >
              <Typography sx={{
                fontSize: '.72rem', fontWeight: isSelected ? 700 : 500, lineHeight: 1,
                color: isSelected ? '#fff' : isDark ? 'rgba(255,255,255,.8)' : '#374151',
              }}>
                {v.version}
              </Typography>
              {v.badge && (
                <Chip size="small" label={v.badge}
                  sx={{ height: 13, fontSize: '.55rem', fontWeight: 700, pointerEvents: 'none',
                    bgcolor: isSelected ? 'rgba(255,255,255,.2)' : `${v.badgeColor}18`,
                    color:   isSelected ? '#fff' : v.badgeColor,
                  }} />
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

// ── Flavor card ───────────────────────────────────────────────────────────────
function FlavorCard({ fl, selected, onClick, isDark }: { fl: Flavor; selected: boolean; onClick: () => void; isDark: boolean }) {
  const border = isDark ? 'rgba(255,255,255,.08)' : '#E5E7EB';
  return (
    <Box onClick={onClick} sx={{
      p: 2, cursor: 'pointer', borderRadius: '10px', position: 'relative',
      border: `2px solid ${selected ? '#18366A' : border}`,
      bgcolor: selected ? (isDark ? 'rgba(24,54,106,.18)' : 'rgba(24,54,106,.04)') : (isDark ? 'rgba(255,255,255,.03)' : '#FAFAFA'),
      transition: 'all .12s',
      '&:hover': { border: `2px solid ${selected ? '#18366A' : (isDark ? 'rgba(255,255,255,.2)' : '#94A3B8')}` },
    }}>
      {fl.recommended && (
        <Chip size="small" label="Recommended" sx={{ position: 'absolute', top: 8, right: 8, height: 16, fontSize: '.6rem', fontWeight: 700, bgcolor: 'rgba(16,185,129,.12)', color: '#10B981' }} />
      )}
      {fl.badge && !fl.recommended && (
        <Chip size="small" label={fl.badge} sx={{ position: 'absolute', top: 8, right: 8, height: 16, fontSize: '.6rem', fontWeight: 700, bgcolor: 'rgba(99,102,241,.12)', color: '#6366F1' }} />
      )}
      {selected && (
        <Box sx={{ position: 'absolute', top: 8, left: 8, width: 18, height: 18, bgcolor: '#18366A', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckIcon sx={{ fontSize: '.72rem', color: '#fff' }} />
        </Box>
      )}
      <Box textAlign="center" mb={1.25} mt={selected ? .5 : 0}>
        <Typography fontWeight={800} fontSize="1rem" color={isDark ? '#ffffff' : '#0A0F1F'}>{fl.name}</Typography>
        <Typography fontWeight={800} fontSize="1.4rem" color="#18366A">${fl.price_mo}<Typography component="span" variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,.4)' : '#9CA3AF' }}>/mo</Typography></Typography>
      </Box>
      <Divider sx={{ borderColor: isDark ? 'rgba(255,255,255,.07)' : '#F3F4F6', mb: 1.25 }} />
      <Stack spacing={.6}>
        {[
          { icon: <SpeedIcon sx={{ fontSize: '.88rem' }} />,       label: `${fl.vcpu} vCPU${fl.vcpu > 1 ? 's' : ''}` },
          { icon: <MemoryIcon sx={{ fontSize: '.88rem' }} />,      label: `${fl.ram_gb < 1 ? `${fl.ram_gb * 1024} MB` : `${fl.ram_gb} GB`} RAM` },
          { icon: <StorageIcon sx={{ fontSize: '.88rem' }} />,     label: `${fl.disk_gb} GB NVMe SSD` },
          { icon: <NetworkCheckIcon sx={{ fontSize: '.88rem' }} />,label: `${fl.bandwidth_tb} TB transfer` },
        ].map(row => (
          <Box key={row.label} display="flex" alignItems="center" gap={.75}>
            <Box sx={{ color: isDark ? 'rgba(255,255,255,.4)' : '#9CA3AF' }}>{row.icon}</Box>
            <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,.7)' : '#374151', fontWeight: 500 }}>{row.label}</Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

// ── Step 1 — Choose Image ─────────────────────────────────────────────────────
function StepImage({ selectedOS, onSelect, isDark }: { selectedOS: string; onSelect: (id: string) => void; isDark: boolean }) {
  const [tab,    setTab]    = useState<'debian' | 'other' | 'windows'>('debian');
  const [search, setSearch] = useState('');
  const border = isDark ? 'rgba(255,255,255,.08)' : '#E5E7EB';

  const DEBIAN_FAMILIES = ['Debian','Ubuntu','Linux Mint','Kali','MX Linux','Deepin','Zorin','Elementary','Pop!_OS','antiX','PureOS','Parrot','Bodhi','Peppermint'];

  const matchSearch = (g: OSGroup) =>
    !search ||
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.versions.some(v => v.version.toLowerCase().includes(search.toLowerCase()));

  const debGroups   = OS_GROUPS.filter(g => DEBIAN_FAMILIES.includes(g.family) && matchSearch(g));
  const otherGroups = OS_GROUPS.filter(g => !DEBIAN_FAMILIES.includes(g.family) && g.family !== 'Windows' && matchSearch(g));
  const winGroups   = OS_GROUPS.filter(g => g.family === 'Windows' && matchSearch(g));

  const visibleGroups = tab === 'debian' ? debGroups : tab === 'windows' ? winGroups : otherGroups;

  const TABS: { key: typeof tab; label: string; count: number }[] = [
    { key: 'debian',  label: 'Debian Family', count: debGroups.length   },
    { key: 'other',   label: 'Other Linux',   count: otherGroups.length },
    { key: 'windows', label: 'Windows',       count: winGroups.length   },
  ];

  return (
    <SSection title="Select an Operating System" subtitle="Choose the base image for your server. All images are pre-hardened and include cloud-init." isDark={isDark}>
      {/* Search */}
      <TextField size="small" placeholder="Search distros or versions…" value={search} onChange={e => setSearch(e.target.value)}
        sx={{ mb: 2.5, width: 260, '& .MuiOutlinedInput-root': { bgcolor: isDark ? 'rgba(255,255,255,.05)' : '#F9FAFB', borderRadius: '8px', '& fieldset': { borderColor: border } }, '& .MuiInputBase-input': { color: isDark ? '#fff' : '#0A0F1F', fontSize: '.85rem' } }} />

      {/* Tabs */}
      <Box display="flex" gap={.75} mb={2.5} flexWrap="wrap">
        {TABS.map(t => (
          <Box key={t.key} onClick={() => setTab(t.key)} sx={{
            display: 'flex', alignItems: 'center', gap: .6, px: 1.5, py: .6, borderRadius: '8px', cursor: 'pointer',
            bgcolor: tab === t.key ? '#18366A' : isDark ? 'rgba(255,255,255,.07)' : '#F3F4F6',
            border: `1.5px solid ${tab === t.key ? '#18366A' : border}`,
            transition: 'all .12s',
          }}>
            <Typography sx={{ fontSize: '.78rem', fontWeight: tab === t.key ? 700 : 500, color: tab === t.key ? '#fff' : isDark ? 'rgba(255,255,255,.7)' : '#374151' }}>{t.label}</Typography>
            <Box sx={{ px: .6, py: .1, borderRadius: '10px', bgcolor: tab === t.key ? 'rgba(255,255,255,.2)' : isDark ? 'rgba(255,255,255,.1)' : '#E5E7EB', minWidth: 20, textAlign: 'center' }}>
              <Typography sx={{ fontSize: '.62rem', fontWeight: 700, color: tab === t.key ? '#fff' : isDark ? 'rgba(255,255,255,.55)' : '#6B7280' }}>{t.count}</Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Grid */}
      {visibleGroups.length > 0 ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 1.5 }}>
          {visibleGroups.map(g => (
            <OSCard key={g.groupId} group={g} selectedVersionId={selectedOS} onSelect={onSelect} isDark={isDark} />
          ))}
        </Box>
      ) : (
        <Box textAlign="center" py={5}>
          <Typography sx={{ color: isDark ? 'rgba(255,255,255,.3)' : '#9CA3AF' }}>No distros match your search</Typography>
        </Box>
      )}
    </SSection>
  );
}

// ── Step 2 — Choose Flavor ────────────────────────────────────────────────────
function StepFlavor({ selectedFlavor, onSelect, isDark }: { selectedFlavor: string; onSelect: (id: string) => void; isDark: boolean }) {
  return (
    <SSection title="Choose a Plan" subtitle="Pick the CPU, memory and storage configuration for your server." isDark={isDark}>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 1.5 }}>
        {FLAVORS.map(fl => <FlavorCard key={fl.id} fl={fl} selected={selectedFlavor === fl.id} onClick={() => onSelect(fl.id)} isDark={isDark} />)}
      </Box>
    </SSection>
  );
}

// ── Step 3 — Network & Name ───────────────────────────────────────────────────
function StepNetwork({ config, onChange, isDark }: {
  config: { hostname: string; region: string; network: 'public' | 'private' | 'both'; sshKey: string; password: string; backups: boolean; ipv6: boolean };
  onChange: (k: string, v: string | boolean) => void;
  isDark: boolean;
}) {
  const border = isDark ? 'rgba(255,255,255,.08)' : '#E5E7EB';
  const textSec = isDark ? 'rgba(255,255,255,.5)' : '#9CA3AF';

  const inp = {
    '& .MuiOutlinedInput-root': { bgcolor: isDark ? 'rgba(255,255,255,.05)' : '#F9FAFB', borderRadius: '8px', '& fieldset': { borderColor: border }, '&:hover fieldset': { borderColor: '#18366A' } },
    '& .MuiInputLabel-root': { color: textSec },
    '& .MuiInputBase-input': { color: isDark ? '#fff' : '#0A0F1F', fontSize: '.88rem' },
  };

  return (
    <>
      <SSection title="Server Name" subtitle="Give your server a hostname. Only lowercase letters, numbers and hyphens." isDark={isDark}>
        <TextField fullWidth size="small" label="Hostname" value={config.hostname} onChange={e => onChange('hostname', e.target.value)}
          placeholder="my-web-server" sx={inp} />
      </SSection>

      <SSection title="Choose Region" subtitle="Select the data centre location closest to your users." isDark={isDark}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 1 }}>
          {REGIONS.map(r => (
            <Box key={r.id} onClick={() => onChange('region', r.id)} sx={{
              display: 'flex', alignItems: 'center', gap: 1.25, p: 1.5, borderRadius: '10px', cursor: 'pointer',
              border: `2px solid ${config.region === r.id ? '#18366A' : border}`,
              bgcolor: config.region === r.id ? (isDark ? 'rgba(24,54,106,.18)' : 'rgba(24,54,106,.04)') : (isDark ? 'rgba(255,255,255,.03)' : '#FAFAFA'),
              transition: 'all .12s',
            }}>
              <Typography sx={{ fontSize: '1.4rem' }}>{r.flag}</Typography>
              <Box>
                <Typography fontWeight={600} fontSize=".82rem" color={isDark ? '#fff' : '#0A0F1F'}>{r.label.split('—')[0].trim()}</Typography>
                <Typography variant="caption" sx={{ color: textSec }}>{r.label.split('—')[1]?.trim()}</Typography>
              </Box>
              {config.region === r.id && <CheckIcon sx={{ ml: 'auto', fontSize: '.9rem', color: '#18366A' }} />}
            </Box>
          ))}
        </Box>
      </SSection>

      <SSection title="Network Type" isDark={isDark}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
          {([
            { id: 'public',  icon: <PublicIcon />, label: 'Public',  desc: 'Assign a public IPv4 address' },
            { id: 'private', icon: <LockIcon />,   label: 'Private', desc: 'VPC-only, no public IP' },
            { id: 'both',    icon: <NetworkCheckIcon />, label: 'Public + Private', desc: 'Dual-homed server' },
          ] as const).map(opt => (
            <Box key={opt.id} onClick={() => onChange('network', opt.id)} sx={{
              p: 1.5, borderRadius: '10px', cursor: 'pointer', textAlign: 'center',
              border: `2px solid ${config.network === opt.id ? '#18366A' : border}`,
              bgcolor: config.network === opt.id ? (isDark ? 'rgba(24,54,106,.18)' : 'rgba(24,54,106,.04)') : (isDark ? 'rgba(255,255,255,.03)' : '#FAFAFA'),
            }}>
              <Box sx={{ color: config.network === opt.id ? '#18366A' : textSec, mb: .5 }}>{opt.icon}</Box>
              <Typography fontWeight={700} fontSize=".82rem" color={isDark ? '#fff' : '#0A0F1F'}>{opt.label}</Typography>
              <Typography variant="caption" sx={{ color: textSec }}>{opt.desc}</Typography>
            </Box>
          ))}
        </Box>
      </SSection>

      <SSection title="Authentication" isDark={isDark}>
        <TextField fullWidth size="small" label="SSH Public Key" multiline rows={3} value={config.sshKey} onChange={e => onChange('sshKey', e.target.value)}
          placeholder="ssh-rsa AAAA…" sx={{ ...inp, mb: 1.5 }} />
        <TextField fullWidth size="small" label="Root password (optional)" type="password" value={config.password} onChange={e => onChange('password', e.target.value)}
          sx={inp} />
      </SSection>

      <SSection title="Add-ons" isDark={isDark}>
        <Stack spacing={1}>
          {([
            { key: 'backups', label: 'Automated Backups', desc: 'Daily snapshots (+20% of server cost)' },
            { key: 'ipv6',    label: 'IPv6',               desc: 'Free IPv6 address assignment' },
          ] as const).map(opt => (
            <Box key={opt.key} onClick={() => onChange(opt.key, !config[opt.key])} sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.75, borderRadius: '10px', cursor: 'pointer',
              border: `2px solid ${config[opt.key] ? '#18366A' : border}`,
              bgcolor: config[opt.key] ? (isDark ? 'rgba(24,54,106,.18)' : 'rgba(24,54,106,.04)') : 'transparent',
            }}>
              <Box>
                <Typography fontWeight={600} fontSize=".88rem" color={isDark ? '#fff' : '#0A0F1F'}>{opt.label}</Typography>
                <Typography variant="caption" sx={{ color: textSec }}>{opt.desc}</Typography>
              </Box>
              <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: config[opt.key] ? '#18366A' : (isDark ? 'rgba(255,255,255,.1)' : '#E5E7EB'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {config[opt.key] && <CheckIcon sx={{ fontSize: '.75rem', color: '#fff' }} />}
              </Box>
            </Box>
          ))}
        </Stack>
      </SSection>
    </>
  );
}

// ── Step 4 — Review ───────────────────────────────────────────────────────────
function StepReview({ osId, flavorId, netConfig, isDark }: {
  osId: string; flavorId: string;
  netConfig: { hostname: string; region: string; network: string; sshKey: string; password: string; backups: boolean; ipv6: boolean };
  isDark: boolean;
}) {
  const os     = OS_FLAT.find(o => o.id === osId);
  const fl     = FLAVORS.find(f => f.id === flavorId);
  const region = REGIONS.find(r => r.id === netConfig.region);
  const border = isDark ? 'rgba(255,255,255,.08)' : '#E5E7EB';
  const textSec = isDark ? 'rgba(255,255,255,.5)' : '#9CA3AF';

  const rows: [string, string][] = [
    ['Hostname',     netConfig.hostname    || '(not set)'],
    ['OS Image',     os ? `${os.name} ${os.version}` : '—'],
    ['Region',       region ? region.label : '—'],
    ['Plan',         fl ? `${fl.name} · ${fl.vcpu} vCPU · ${fl.ram_gb < 1 ? fl.ram_gb * 1024 + ' MB' : fl.ram_gb + ' GB'} RAM · ${fl.disk_gb} GB SSD` : '—'],
    ['Network',      netConfig.network],
    ['Backups',      netConfig.backups ? 'Enabled' : 'Disabled'],
    ['IPv6',         netConfig.ipv6    ? 'Enabled' : 'Disabled'],
    ['SSH Key',      netConfig.sshKey  ? '✓ Provided'  : 'None'],
    ['Root password',netConfig.password? '✓ Set'        : 'None'],
  ];

  const monthlyCost = (fl?.price_mo ?? 0) * (netConfig.backups ? 1.2 : 1);
  const hourlyCost  = monthlyCost / 730;

  return (
    <SSection title="Review Configuration" subtitle="Confirm everything looks correct before deploying." isDark={isDark}>
      <Paper elevation={0} sx={{ border: `1px solid ${border}`, borderRadius: '12px', overflow: 'hidden', bgcolor: isDark ? '#132336' : '#ffffff', mb: 2.5 }}>
        {rows.map(([k, v], i) => (
          <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2.5, py: 1.25, borderBottom: i < rows.length - 1 ? `1px solid ${isDark ? 'rgba(255,255,255,.05)' : '#F9FAFB'}` : 'none' }}>
            <Typography variant="body2" sx={{ color: textSec, fontWeight: 500 }}>{k}</Typography>
            <Typography variant="body2" fontWeight={700} color={isDark ? '#ffffff' : '#0A0F1F'} textAlign="right" sx={{ maxWidth: '60%' }}>{v}</Typography>
          </Box>
        ))}
      </Paper>
      <Box sx={{ p: 2.5, bgcolor: isDark ? 'rgba(24,54,106,.15)' : 'rgba(24,54,106,.04)', borderRadius: '12px', border: `1px solid ${isDark ? 'rgba(24,54,106,.3)' : 'rgba(24,54,106,.12)'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography fontWeight={700} fontSize="1.3rem" color={isDark ? '#ffffff' : '#0A0F1F'}>
            ${monthlyCost.toFixed(2)}<Typography component="span" variant="caption" sx={{ color: textSec }}>/month</Typography>
          </Typography>
          <Typography variant="caption" sx={{ color: textSec }}>~${hourlyCost.toFixed(4)}/hour · billed hourly</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <InfoOutlinedIcon sx={{ fontSize: '.9rem', color: textSec }} />
          <Typography variant="caption" sx={{ color: textSec }}>Server will be online within ~45 seconds of deployment.</Typography>
        </Box>
      </Box>
    </SSection>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
const STEPS = ['Choose Image', 'Choose Plan', 'Network & Name', 'Review & Deploy'];

const ComputePage: React.FC = () => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [activeStep, setActiveStep] = useState(0);
  const [selectedOS,      setOS]      = useState('ubuntu-2404');
  const [selectedFlavor,  setFlavor]  = useState('medium');
  const [deploying,       setDeploy]  = useState(false);
  const [deployed,        setDeployed]= useState(false);
  const [netConfig, setNet] = useState({
    hostname: '', region: 'us-east-1',
    network: 'public' as 'public' | 'private' | 'both',
    sshKey: '', password: '', backups: false, ipv6: true,
  });

  const border = isDark ? 'rgba(255,255,255,.08)' : '#E5E7EB';

  const canNext = () => {
    if (activeStep === 0) return !!selectedOS;
    if (activeStep === 1) return !!selectedFlavor;
    if (activeStep === 2) return netConfig.hostname.trim().length > 0 && !!netConfig.region;
    return true;
  };

  const handleDeploy = () => {
    setDeploy(true);
    setTimeout(() => { setDeploy(false); setDeployed(true); }, 2200);
  };

  const handleNet = (k: string, v: string | boolean) =>
    setNet(n => ({ ...n, [k]: v }));

  // selected items for price bar
  const fl     = FLAVORS.find(f => f.id === selectedFlavor);
  const os     = OS_FLAT.find(o => o.id === selectedOS);
  const monthlyCost = (fl?.price_mo ?? 0) * (netConfig.backups ? 1.2 : 1);

  if (deployed) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: isDark ? '#0D1826' : '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box textAlign="center" maxWidth={480} px={3}>
          <Box sx={{ width: 72, height: 72, bgcolor: 'rgba(16,185,129,.12)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2.5 }}>
            <RocketLaunchIcon sx={{ fontSize: '2rem', color: '#10B981' }} />
          </Box>
          <Typography fontWeight={800} fontSize="1.5rem" color={isDark ? '#ffffff' : '#0A0F1F'} mb={.75}>Server Deployed! 🎉</Typography>
          <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,.5)' : '#6B7280', mb: 3 }}>
            <strong style={{ color: isDark ? '#ffffff' : '#0A0F1F' }}>{netConfig.hostname || 'your-server'}</strong> is provisioning and will be ready in ~45 seconds.
          </Typography>
          <Button variant="contained" onClick={() => { setDeployed(false); setActiveStep(0); setOS('ubuntu-2404'); setFlavor('medium'); setNet({ hostname: '', region: 'us-east-1', network: 'public', sshKey: '', password: '', backups: false, ipv6: true }); }}
            sx={{ bgcolor: '#18366A', '&:hover': { bgcolor: '#102548' }, textTransform: 'none', borderRadius: '8px', fontWeight: 600 }}>
            Deploy Another Server
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: isDark ? '#0D1826' : '#f8fafc' }}>
      {/* Header */}
      <Box sx={{ bgcolor: isDark ? '#0F1E30' : '#ffffff', borderBottom: `1px solid ${border}`, px: 4, py: 2.5 }}>
        <Typography fontWeight={800} fontSize="1.25rem" color={isDark ? '#ffffff' : '#0A0F1F'}>Deploy Your First Server</Typography>
        <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,.5)' : '#6B7280', mt: .25 }}>
          Cloud compute instances · 5 regions · NVMe SSD · Provisioned in {'<'}60s
        </Typography>
      </Box>

      {/* Stepper */}
      <Box sx={{ bgcolor: isDark ? '#0F1E30' : '#ffffff', borderBottom: `1px solid ${border}`, px: 4, py: 2.5 }}>
        <Stepper activeStep={activeStep} alternativeLabel connector={<StepConnectorStyled />}>
          {STEPS.map((label, i) => (
            <Step key={label} completed={i < activeStep}>
              <StepLabel StepIconComponent={({ active, completed }) =>
                <StepIconStyled active={active} completed={completed} icon={i + 1} isDark={isDark} />
              }>
                <Typography sx={{ fontSize: '.8rem', fontWeight: activeStep === i ? 700 : 400, color: activeStep === i ? (isDark ? '#fff' : '#18366A') : (isDark ? 'rgba(255,255,255,.4)' : '#9CA3AF') }}>
                  {label}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Main layout: form + summary sidebar */}
      <Box sx={{ display: 'flex', gap: 0, alignItems: 'flex-start' }}>
        {/* Form area */}
        <Box sx={{ flex: 1, overflowY: 'auto', px: { xs: 2, md: 4 }, py: 3.5 }}>
          {activeStep === 0 && <StepImage selectedOS={selectedOS} onSelect={setOS} isDark={isDark} />}
          {activeStep === 1 && <StepFlavor selectedFlavor={selectedFlavor} onSelect={setFlavor} isDark={isDark} />}
          {activeStep === 2 && <StepNetwork config={netConfig} onChange={handleNet} isDark={isDark} />}
          {activeStep === 3 && <StepReview osId={selectedOS} flavorId={selectedFlavor} netConfig={netConfig} isDark={isDark} />}
        </Box>

        {/* Sticky summary sidebar */}
        <Box sx={{ width: 290, flexShrink: 0, borderLeft: `1px solid ${border}`, p: 2.5, position: 'sticky', top: 0, alignSelf: 'flex-start', bgcolor: isDark ? '#0F1E30' : '#ffffff', minHeight: 'calc(100vh - 88px - 80px)' }}>
          <Typography fontWeight={800} fontSize=".9rem" color={isDark ? '#ffffff' : '#0A0F1F'} mb={1.75}>Summary</Typography>
          <Stack spacing={1.25}>
            {[
              { label: 'Image',  value: os ? `${os.name} ${os.version}` : '—', color: os?.logoColor },
              { label: 'Plan',   value: fl ? `${fl.name} · $${fl.price_mo}/mo` : '—' },
              { label: 'Region', value: REGIONS.find(r => r.id === netConfig.region)?.label.split('—')[0].trim() ?? '—' },
              { label: 'Host',   value: netConfig.hostname || '—' },
            ].map(row => (
              <Box key={row.label} sx={{ p: 1.25, bgcolor: isDark ? 'rgba(255,255,255,.04)' : '#F9FAFB', borderRadius: '8px', border: `1px solid ${border}` }}>
                <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,.4)' : '#9CA3AF', fontWeight: 600, display: 'block', mb: .25 }}>{row.label}</Typography>
                <Typography variant="body2" fontWeight={700} color={isDark ? '#fff' : '#0A0F1F'} noWrap>{row.value}</Typography>
              </Box>
            ))}
          </Stack>

          <Divider sx={{ my: 2, borderColor: isDark ? 'rgba(255,255,255,.07)' : '#F3F4F6' }} />

          <Box sx={{ p: 1.5, bgcolor: isDark ? 'rgba(24,54,106,.15)' : 'rgba(24,54,106,.05)', borderRadius: '10px', mb: 2 }}>
            <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,.4)' : '#9CA3AF' }}>Estimated cost</Typography>
            <Typography fontWeight={800} fontSize="1.2rem" color="#18366A">${monthlyCost.toFixed(2)}<Typography component="span" variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,.4)' : '#9CA3AF' }}>/mo</Typography></Typography>
            <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,.3)' : '#9CA3AF' }}>${(monthlyCost / 730).toFixed(4)}/hour</Typography>
          </Box>

          {/* Nav buttons */}
          <Stack spacing={1}>
            {activeStep < STEPS.length - 1 ? (
              <Button fullWidth variant="contained" disabled={!canNext()} onClick={() => setActiveStep(s => s + 1)}
                sx={{ bgcolor: '#18366A', '&:hover': { bgcolor: '#102548' }, textTransform: 'none', borderRadius: '8px', fontWeight: 700, py: 1.25 }}>
                Continue →
              </Button>
            ) : (
              <Button fullWidth variant="contained" disabled={!canNext() || deploying}
                startIcon={deploying ? <CircularProgress size={14} color="inherit" /> : <RocketLaunchIcon />}
                onClick={handleDeploy}
                sx={{ bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' }, textTransform: 'none', borderRadius: '8px', fontWeight: 700, py: 1.25 }}>
                {deploying ? 'Deploying…' : 'Deploy Server'}
              </Button>
            )}
            {activeStep > 0 && (
              <Button fullWidth variant="outlined" onClick={() => setActiveStep(s => s - 1)}
                sx={{ textTransform: 'none', borderRadius: '8px', fontWeight: 600, borderColor: border, color: isDark ? '#fff' : '#374151' }}>
                ← Back
              </Button>
            )}
          </Stack>

          {/* Step dots */}
          <Box display="flex" justifyContent="center" gap={.75} mt={2}>
            {STEPS.map((_, i) => (
              <Box key={i} sx={{ width: i === activeStep ? 16 : 6, height: 6, borderRadius: 3, bgcolor: i <= activeStep ? '#18366A' : (isDark ? 'rgba(255,255,255,.15)' : '#E5E7EB'), transition: 'all .2s' }} />
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ComputePage;
