import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Container, Button, List, ListItem, ListItemText, IconButton, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@mui/material';
import { Add, Edit, Delete, CalendarToday } from '@mui/icons-material';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { scheduleService } from '../services/scheduleService';
import { ScheduleItem } from '../types/schedule';

const SchedulePage: React.FC = () => {
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ScheduleItem | null>(null);
  const [form, setForm] = useState<Partial<ScheduleItem>>({ title: '', start: '', end: '', all_day: false, status: 'confirmed' });

  const load = async () => {
    setLoading(true);
    try {
      const data = await scheduleService.list();
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleOpenNew = () => {
    setEditing(null);
    setForm({ title: '', start: '', end: '', all_day: false, status: 'confirmed' });
    setOpen(true);
  };

  const handleEdit = (item: ScheduleItem) => {
    setEditing(item);
    setForm(item);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this item?')) return;
    await scheduleService.remove(id);
    await load();
  };

  const handleSave = async () => {
    if (editing) {
      await scheduleService.update(editing.id, form as any);
    } else {
      await scheduleService.create(form as any);
    }
    setOpen(false);
    await load();
  };

  return (
    <DashboardLayout>
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Schedule Management</Typography>
            <Typography variant="body2" color="text.secondary">Manage your calendar, appointments, and deadlines.</Typography>
          </Box>
          <Button variant="contained" startIcon={<Add />} onClick={handleOpenNew}>Add Item</Button>
        </Box>

        <Paper sx={{ p: 2 }}>
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography>Loading...</Typography>
            </Box>
          ) : !items.length && (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <CalendarToday sx={{ fontSize: 64, color: '#3b82f6', mb: 2 }} />
              <Typography variant="h6">No scheduled items</Typography>
              <Typography variant="body2" color="text.secondary">Create your first appointment or deadline.</Typography>
            </Box>
          )}

          <List>
            {items.map(item => (
              <ListItem key={item.id} secondaryAction={
                <Box>
                  <IconButton edge="end" aria-label="edit" onClick={() => handleEdit(item)}><Edit /></IconButton>
                  <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(item.id)}><Delete /></IconButton>
                </Box>
              }>
                <ListItemText primary={item.title} secondary={`${new Date(item.start).toLocaleString()}${item.end ? ` - ${new Date(item.end).toLocaleString()}` : ''}`} />
              </ListItem>
            ))}
          </List>
        </Paper>

        <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
          <DialogTitle>{editing ? 'Edit Item' : 'New Schedule Item'}</DialogTitle>
          <DialogContent>
            <TextField fullWidth label="Title" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} sx={{ mb: 2 }} />
            <TextField fullWidth label="Start (ISO)" value={form.start || ''} onChange={e => setForm({ ...form, start: e.target.value })} sx={{ mb: 2 }} />
            <TextField fullWidth label="End (ISO)" value={form.end || ''} onChange={e => setForm({ ...form, end: e.target.value })} sx={{ mb: 2 }} />
            <TextField fullWidth multiline label="Description" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} sx={{ mb: 2 }} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSave}>Save</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </DashboardLayout>
  );
};

export default SchedulePage;
