import React, { useState } from 'react';
import {
  Box, Typography, Paper, Grid, Button, Chip, Tabs, Tab, Table,
  TableHead, TableRow, TableCell, TableBody, TextField, InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { dashboardTokens, dashboardSemanticColors } from '../styles/dashboardDesignSystem';

const T = dashboardTokens.colors;
const S = dashboardSemanticColors;

const COMPUTE_FLAVORS = [
  { name: 'c1.micro', vcpu: 1, ram: 1, disk: 20, price: '$3.50/mo', category: 'Standard', badge: '' },
  { name: 'c2.small', vcpu: 2, ram: 4, disk: 40, price: '$14/mo', category: 'Standard', badge: '' },
  { name: 'c2.medium', vcpu: 4, ram: 8, disk: 80, price: '$28/mo', category: 'Standard', badge: 'Popular' },
  { name: 'c4.large', vcpu: 8, ram: 16, disk: 160, price: '$56/mo', category: 'Standard', badge: '' },
  { name: 'c8.xlarge', vcpu: 16, ram: 32, disk: 320, price: '$112/mo', category: 'Standard', badge: '' },
  { name: 'c16.2xlarge', vcpu: 32, ram: 64, disk: 640, price: '$224/mo', category: 'Standard', badge: '' },
  { name: 'm4.large', vcpu: 4, ram: 32, disk: 80, price: '$60/mo', category: 'Memory', badge: '' },
  { name: 'm8.xlarge', vcpu: 8, ram: 64, disk: 160, price: '$120/mo', category: 'Memory', badge: 'Popular' },
  { name: 'g1.gpu-small', vcpu: 8, ram: 32, disk: 200, price: '$180/mo', category: 'GPU', badge: 'New' },
  { name: 'g4.h100', vcpu: 32, ram: 128, disk: 1000, price: '$2,400/mo', category: 'GPU', badge: '' },
];

const STORAGE_TIERS = [
  { name: 'Ultra SSD', iops: '200k', throughput: '4 GB/s', latency: '<0.1ms', price: '$0.25/GB/mo', use: 'Databases, OLTP' },
  { name: 'Premium SSD', iops: '60k', throughput: '1 GB/s', latency: '<0.5ms', price: '$0.12/GB/mo', use: 'Web servers, VMs' },
  { name: 'Standard SSD', iops: '10k', throughput: '300 MB/s', latency: '<2ms', price: '$0.06/GB/mo', use: 'Dev/test, general' },
  { name: 'HDD', iops: '500', throughput: '100 MB/s', latency: '<10ms', price: '$0.02/GB/mo', use: 'Backups, archives' },
  { name: 'Object Storage Standard', iops: 'N/A', throughput: 'Auto-scaled', latency: '<20ms', price: '$0.015/GB/mo', use: 'Files, media, data lake' },
  { name: 'Object Storage Archive', iops: 'N/A', throughput: 'Restore required', latency: 'Minutes', price: '$0.004/GB/mo', use: 'Long-term archival' },
];

const NETWORK_TEMPLATES = [
  { name: 'Standard VPC', desc: '1 region, public/private subnets, NAT gateway, basic firewall', price: 'From $15/mo' },
  { name: 'HA Multi-AZ VPC', desc: '3 availability zones, redundant NAT, distributed load balancer', price: 'From $45/mo' },
  { name: 'Global Anycast', desc: 'Multi-region with anycast routing and DDoS protection', price: 'From $200/mo' },
  { name: 'Private Connect', desc: 'Dedicated private networking between tenant resources', price: 'Custom pricing' },
];

export default function DevCatalogPage() {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const categories = ['All', ...Array.from(new Set(COMPUTE_FLAVORS.map(f => f.category)))];
  const filtered = COMPUTE_FLAVORS.filter(f =>
    (categoryFilter === 'All' || f.category === categoryFilter) &&
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ p: 3, bgcolor: T.background, minHeight: '100vh', fontFamily: dashboardTokens.typography.fontFamily }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ color: T.textPrimary, fontWeight: 700 }}>Service Catalog</Typography>
        <Typography variant="body2" sx={{ color: T.textSecondary, mt: 0.3 }}>Browse VM flavors, storage tiers, networking templates, and prebuilt architectures</Typography>
      </Box>

      <Paper sx={{ borderRadius: 2, border: `1px solid ${T.border}`, bgcolor: T.surface }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, borderBottom: `1px solid ${T.border}` }}>
          <Tab label="VM Flavors" />
          <Tab label="Storage Tiers" />
          <Tab label="Networking" />
        </Tabs>

        {tab === 0 && (
          <Box>
            <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', borderBottom: `1px solid ${T.border}` }}>
              <TextField size="small" placeholder="Search flavors..." value={search} onChange={e => setSearch(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: '.9rem', color: T.textSecondary }} /></InputAdornment> }}
                sx={{ width: 240 }} />
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {categories.map(cat => (
                  <Chip key={cat} label={cat} clickable size="small" onClick={() => setCategoryFilter(cat)}
                    sx={{ bgcolor: categoryFilter === cat ? T.brandPrimary : T.surfaceSubtle,
                      color: categoryFilter === cat ? '#fff' : T.textSecondary }} />
                ))}
              </Box>
            </Box>
            <Table>
              <TableHead>
                <TableRow>
                  {['Flavor', 'vCPUs', 'RAM (GB)', 'Disk (GB)', 'Category', 'Price', 'Action'].map(h => (
                    <TableCell key={h} sx={{ color: T.textSecondary, fontSize: '.75rem', fontWeight: 600 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map(f => (
                  <TableRow key={f.name} hover sx={{ '&:hover': { bgcolor: T.surfaceHover } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ color: T.textPrimary, fontWeight: 600, fontFamily: 'monospace' }}>{f.name}</Typography>
                        {f.badge && <Chip label={f.badge} size="small" sx={{ bgcolor: f.badge === 'Popular' ? `${S.success}22` : f.badge === 'New' ? `${T.brandPrimary}22` : T.surfaceSubtle, color: f.badge === 'Popular' ? S.success : T.brandPrimary, fontSize: '.62rem' }} />}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: T.textPrimary }}>{f.vcpu}</TableCell>
                    <TableCell sx={{ color: T.textPrimary }}>{f.ram}</TableCell>
                    <TableCell sx={{ color: T.textPrimary }}>{f.disk}</TableCell>
                    <TableCell><Chip label={f.category} size="small" sx={{ bgcolor: T.surfaceSubtle, color: T.textSecondary, fontSize: '.7rem' }} /></TableCell>
                    <TableCell sx={{ color: S.success, fontWeight: 600 }}>{f.price}</TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined" startIcon={<ShoppingCartIcon sx={{ fontSize: '.8rem !important' }} />}
                        sx={{ borderColor: T.border, color: T.textPrimary, fontSize: '.72rem' }}>Deploy</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}

        {tab === 1 && (
          <Table>
            <TableHead>
              <TableRow>
                {['Tier', 'IOPS', 'Throughput', 'Latency', 'Price', 'Best For', 'Action'].map(h => (
                  <TableCell key={h} sx={{ color: T.textSecondary, fontSize: '.75rem', fontWeight: 600 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {STORAGE_TIERS.map(s => (
                <TableRow key={s.name} hover sx={{ '&:hover': { bgcolor: T.surfaceHover } }}>
                  <TableCell sx={{ color: T.textPrimary, fontWeight: 600 }}>{s.name}</TableCell>
                  <TableCell sx={{ color: T.textPrimary }}>{s.iops}</TableCell>
                  <TableCell sx={{ color: T.textPrimary }}>{s.throughput}</TableCell>
                  <TableCell sx={{ color: T.textPrimary }}>{s.latency}</TableCell>
                  <TableCell sx={{ color: S.success, fontWeight: 600 }}>{s.price}</TableCell>
                  <TableCell sx={{ color: T.textSecondary, fontSize: '.8rem' }}>{s.use}</TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined" sx={{ borderColor: T.border, color: T.textPrimary, fontSize: '.72rem' }}>Create</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {tab === 2 && (
          <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
              {NETWORK_TEMPLATES.map(n => (
                <Grid size={{ xs: 12, sm: 6 }} key={n.name}>
                  <Paper sx={{ p: 2.5, bgcolor: T.surfaceSubtle, border: `1px solid ${T.border}`, borderRadius: 2 }}>
                    <Typography variant="body1" sx={{ color: T.textPrimary, fontWeight: 700, mb: 0.75 }}>{n.name}</Typography>
                    <Typography variant="caption" sx={{ color: T.textSecondary, display: 'block', mb: 1.5 }}>{n.desc}</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: S.success, fontWeight: 600 }}>{n.price}</Typography>
                      <Button variant="contained" size="small"
                        sx={{ bgcolor: T.brandPrimary, '&:hover': { bgcolor: T.brandPrimaryHover }, fontSize: '.75rem' }}>
                        Deploy
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
