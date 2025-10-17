import React from 'react';
import { Box, Paper, Typography, List, ListItem, ListItemText, TextField, Button } from '@mui/material';
import { groupsApi } from '../../services/groupsApi';

const GroupUserDashboard: React.FC = () => {
	const [groups, setGroups] = React.useState<any[]>([]);
	const [name, setName] = React.useState('');

	React.useEffect(() => {
		let mounted = true;
		const parts = window.location.pathname.split('/');
		const id = parts.includes('enterprise') ? parts[parts.indexOf('enterprise') + 1] : 'default';
		groupsApi.list(id).then(r => { if (mounted) setGroups(r || []); });
		return () => { mounted = false; };
	}, []);

	const create = async () => {
		const parts = window.location.pathname.split('/');
		const id = parts.includes('enterprise') ? parts[parts.indexOf('enterprise') + 1] : 'default';
		const g = await groupsApi.create(id, { name });
		setGroups(s => [...s, g]);
		setName('');
	};

	return (
		<Box>
			<Typography variant="h5">Groups</Typography>
			<Paper sx={{ mt: 2, p: 2 }}>
				<List>
					{groups.map(g => (
						<ListItem key={g.id}><ListItemText primary={g.name || `Group ${g.id}`} /></ListItem>
					))}
				</List>
				<Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
					<TextField size="small" value={name} onChange={(e) => setName(e.target.value)} placeholder="New group name" />
					<Button variant="contained" onClick={create}>Create</Button>
				</Box>
			</Paper>
		</Box>
	);
};

export default GroupUserDashboard;
