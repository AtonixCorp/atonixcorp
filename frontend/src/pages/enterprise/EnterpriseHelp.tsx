import React from 'react';
import EnterpriseLayout from '../../components/Enterprise/EnterpriseLayout';
import { Paper, Typography, Box, TextField, Button, MenuItem, List, ListItem, ListItemText, Divider } from '@mui/material';
import { useParams } from 'react-router-dom';
import supportService, { SupportTicket } from '../../services/supportService';

const ___priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const EnterpriseHelp: React.FC = () => {
  const { id } = useParams();
  const enterpriseId = id || 'unknown';
  const [subject, setSubject] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [priority, setPriority] = React.useState<'low' | 'medium' | 'high'>('medium');
  const [tickets, setTickets] = React.useState<SupportTicket[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    supportService.fetchTickets(enterpriseId).then((res: any) => {
      if (!mounted) return;
      // backend may return {results: [...]}
      const list = Array.isArray(res) ? res : res?.results || [];
      setTickets(list);
      setLoading(false);
    }).catch(() => setLoading(false));
    return () => { mounted = false; };
  }, [enterpriseId]);

  async function handleCreate() {
    if (!subject || !description) return;
    const payload = { enterpriseId, subject, description, priority };
    try {
      const created = await supportService.createTicket(enterpriseId, payload as any);
      setTickets(prev => [created, ...prev]);
      setSubject(''); setDescription(''); setPriority('medium');
    } catch (e) {
      // ignore for now
    }
  }

  return (
    <EnterpriseLayout enterpriseId={enterpriseId}>
      <Box p={3}>
        <Paper elevation={2} style={{ padding: 16 }}>
          <Typography variant="h5" gutterBottom>
            Help & Support
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Access support articles, contact enterprise support, and open tickets for assistance.
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Create a Support Ticket</Typography>
            <TextField fullWidth placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} sx={{ mb: 1 }} />
            <TextField fullWidth multiline minRows={4} placeholder="Describe the issue" value={description} onChange={(e) => setDescription(e.target.value)} sx={{ mb: 1 }} />
            <TextField select value={priority} onChange={(e) => setPriority(e.target.value as any)} sx={{ width: 160, mb: 2 }}>
              {___priorityOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
            </TextField>
            <Box>
              <Button variant="contained" color="primary" onClick={handleCreate} disabled={!subject || !description}>Open Ticket</Button>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" sx={{ mb: 1 }}>Recent Tickets</Typography>
          <List>
            {loading && <ListItem><ListItemText primary="Loading..." /></ListItem>}
            {!loading && tickets.length === 0 && <ListItem><ListItemText primary="No tickets yet" /></ListItem>}
            {!loading && tickets.map(t => (
              <ListItem key={t.id} alignItems="flex-start">
                <ListItemText primary={t.subject} secondary={`${t.priority.toUpperCase()} • ${t.status} • ${new Date(t.createdAt).toLocaleString()}`} />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>
    </EnterpriseLayout>
  );
};

export default EnterpriseHelp;
