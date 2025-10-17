import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { enterpriseApi } from '../../services/enterpriseApi';

const CompanyDashboard: React.FC = () => {
	const { id } = useParams();
	const enterpriseId = id || 'unknown';
	const [enterprise, setEnterprise] = React.useState<any | null>(null);
	const [loading, setLoading] = React.useState(true);

	React.useEffect(() => {
		let mounted = true;
		(async () => {
			setLoading(true);
			const ent = await enterpriseApi.getEnterprise(enterpriseId);
			if (mounted) setEnterprise(ent);
			setLoading(false);
		})();
		return () => { mounted = false; };
	}, [enterpriseId]);

	return (
		<Box>
			<Typography variant="h5">Enterprise Overview</Typography>
			<Paper sx={{ mt: 2, p: 2 }}>
				{loading && <Typography>Loading...</Typography>}
				{!loading && !enterprise && <Typography>No enterprise data found.</Typography>}
				{enterprise && (
					<Box>
						<Typography variant="h6">{enterprise.companyName || enterprise.name || 'Unnamed'}</Typography>
						<Typography variant="body2" color="text.secondary">Domain: {enterprise.domain || enterprise.companyUrl || '—'}</Typography>
						<Typography variant="body2" color="text.secondary">Created: {enterprise.createdAt || '—'}</Typography>
					</Box>
				)}
			</Paper>
		</Box>
	);
};

export default CompanyDashboard;

