import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fab,
  Paper,
  Stack,
} from '@mui/material';
import {
  Add,
  Search,
  Edit,
  Delete,
  CheckCircle,
  Schedule,
  Warning,
  Assignment,
  Person,
  CalendarToday,
} from '@mui/icons-material';

interface Task {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  assignee: string;
  dueDate: string;
  createdAt: string;
}

const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: 'Review code for authentication module',
      description: 'Conduct thorough code review and testing',
      status: 'completed',
      priority: 'high',
      assignee: 'John Doe',
      dueDate: '2025-01-15',
      createdAt: '2025-01-10',
    },
    {
      id: 2,
      title: 'Update project documentation',
      description: 'Update API documentation and user guides',
      status: 'in-progress',
      priority: 'medium',
      assignee: 'Sarah Wilson',
      dueDate: '2025-01-20',
      createdAt: '2025-01-12',
    },
    {
      id: 3,
      title: 'Database optimization',
      description: 'Optimize database queries for better performance',
      status: 'pending',
      priority: 'high',
      assignee: 'Mike Johnson',
      dueDate: '2025-01-18',
      createdAt: '2025-01-13',
    },
    {
      id: 4,
      title: 'Client presentation preparation',
      description: 'Prepare slides and demo for client meeting',
      status: 'pending',
      priority: 'medium',
      assignee: 'Emma Davis',
      dueDate: '2025-01-25',
      createdAt: '2025-01-14',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [newTask, setNewTask] = useState<{
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    assignee: string;
    dueDate: string;
  }>({
    title: '',
    description: '',
    priority: 'medium',
    assignee: '',
    dueDate: '',
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#22c55e';
      default: return '#64748b';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle sx={{ color: '#22c55e' }} />;
      case 'in-progress': return <Schedule sx={{ color: '#3b82f6' }} />;
      case 'overdue': return <Warning sx={{ color: '#ef4444' }} />;
      default: return <Assignment sx={{ color: '#64748b' }} />;
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleCreateTask = () => {
    const task: Task = {
      id: Date.now(),
      ...newTask,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTasks([...tasks, task]);
    setNewTask({ title: '', description: '', priority: 'medium', assignee: '', dueDate: '' });
    setCreateDialogOpen(false);
  };

  const handleDeleteTask = (taskId: number) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description,
      priority: task.priority,
      assignee: task.assignee,
      dueDate: task.dueDate,
    });
    setCreateDialogOpen(true);
  };

  const handleUpdateTask = () => {
    if (editingTask) {
      setTasks(tasks.map(task =>
        task.id === editingTask.id ? { ...task, ...newTask } : task
      ));
      setEditingTask(null);
      setNewTask({ title: '', description: '', priority: 'medium', assignee: '', dueDate: '' });
      setCreateDialogOpen(false);
    }
  };

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    overdue: tasks.filter(t => t.status === 'overdue').length,
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, width: '100%' }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
            }}
          >
            Task Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and track your team's tasks and projects.
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: { xs: 2, sm: 2.5, md: 3 },
            mb: 4,
            width: '100%',
          }}
        >
          <Card sx={{ borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <CardContent sx={{ textAlign: 'center', p: { xs: 2, sm: 2.5, md: 3 } }}>
              <Assignment sx={{ fontSize: 32, color: '#3b82f6', mb: 1 }} />
              <Typography variant="h4" fontWeight={700} color="#3b82f6">
                {taskStats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Tasks
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <CardContent sx={{ textAlign: 'center', p: { xs: 2, sm: 2.5, md: 3 } }}>
              <CheckCircle sx={{ fontSize: 32, color: '#22c55e', mb: 1 }} />
              <Typography variant="h4" fontWeight={700} color="#22c55e">
                {taskStats.completed}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <CardContent sx={{ textAlign: 'center', p: { xs: 2, sm: 2.5, md: 3 } }}>
              <Schedule sx={{ fontSize: 32, color: '#f59e0b', mb: 1 }} />
              <Typography variant="h4" fontWeight={700} color="#f59e0b">
                {taskStats.inProgress}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                In Progress
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <CardContent sx={{ textAlign: 'center', p: { xs: 2, sm: 2.5, md: 3 } }}>
              <Warning sx={{ fontSize: 32, color: '#ef4444', mb: 1 }} />
              <Typography variant="h4" fontWeight={700} color="#ef4444">
                {taskStats.overdue}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Overdue
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Filters and Search */}
        <Paper
          sx={{
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            p: { xs: 2, sm: 2.5, md: 3 },
            mb: 3,
            width: '100%',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 2,
              alignItems: 'center',
            }}
          >
            <TextField
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: '#64748b' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 1 }}
            />

            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="overdue">Overdue</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={priorityFilter}
                label="Priority"
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <MenuItem value="all">All Priority</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCreateDialogOpen(true)}
              sx={{
                borderRadius: '12px',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #3b82f6 0%, #1e293b 100%)',
                color: 'white',
              }}
            >
              New Task
            </Button>
          </Box>
        </Paper>

        {/* Tasks List */}
        <Paper
          sx={{
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
          }}
        >
          <List sx={{ p: 0 }}>
            {filteredTasks.map((task, index) => (
              <ListItem
                key={task.id}
                sx={{
                  borderBottom: index < filteredTasks.length - 1 ? '1px solid #e2e8f0' : 'none',
                  '&:hover': {
                    backgroundColor: '#f8fafc',
                  },
                }}
              >
                <ListItemAvatar>
                  {getStatusIcon(task.status)}
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Typography variant="h6" fontWeight={600}>
                        {task.title}
                      </Typography>
                      <Chip
                        label={task.priority.toUpperCase()}
                        size="small"
                        sx={{
                          backgroundColor: `${getPriorityColor(task.priority)}20`,
                          color: getPriorityColor(task.priority),
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {task.description}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Person sx={{ fontSize: 16, color: '#64748b' }} />
                          <Typography variant="caption" color="text.secondary">
                            {task.assignee}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarToday sx={{ fontSize: 16, color: '#64748b' }} />
                          <Typography variant="caption" color="text.secondary">
                            Due: {task.dueDate}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      size="small"
                      onClick={() => handleEditTask(task)}
                      sx={{ color: '#64748b' }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteTask(task.id)}
                      sx={{ color: '#ef4444' }}
                    >
                      <Delete />
                    </IconButton>
                  </Stack>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>

          {filteredTasks.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Assignment sx={{ fontSize: 64, color: '#cbd5e1', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No tasks found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first task to get started'}
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Create/Edit Task Dialog */}
        <Dialog
          open={createDialogOpen}
          onClose={() => {
            setCreateDialogOpen(false);
            setEditingTask(null);
            setNewTask({ title: '', description: '', priority: 'medium', assignee: '', dueDate: '' });
          }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editingTask ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label="Task Title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="Description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                multiline
                rows={3}
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={newTask.priority}
                    label="Priority"
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Task['priority'] })}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Assignee"
                  value={newTask.assignee}
                  onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                />
              </Box>
              <TextField
                fullWidth
                label="Due Date"
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setCreateDialogOpen(false);
              setEditingTask(null);
              setNewTask({ title: '', description: '', priority: 'medium', assignee: '', dueDate: '' });
            }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={editingTask ? handleUpdateTask : handleCreateTask}
              disabled={!newTask.title.trim()}
            >
              {editingTask ? 'Update Task' : 'Create Task'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="add task"
          onClick={() => setCreateDialogOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: 'linear-gradient(135deg, #3b82f6 0%, #1e293b 100%)',
          }}
        >
          <Add />
        </Fab>
      </Box>
  );
};

export default TasksPage;
