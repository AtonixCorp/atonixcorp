import React from 'react';
import EnterpriseLayout from '../../components/Enterprise/EnterpriseLayout';
import { Box, Paper, Typography, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import { useParams } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { analyticsApi } from '../../services/analyticsApi';

type TimePoint = { date: string; score: number; };

// generate 30 days of mock time-series data
const __generateMockSeries = (days = 30): TimePoint[] => {
  const now = new Date();
  const data: TimePoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const label = d.toISOString().slice(0, 10);
    const score = Math.max(30, Math.round(50 + 30 * Math.sin(i / 4) + (Math.random() * 20 - 10)));
    data.push({ date: label, score });
  }
  return data;
};

const __allSeries = __generateMockSeries(60);

const EnterpriseAIAnalyticsPrototype: React.FC = () => {
  const { id } = useParams();
  const enterpriseId = id || 'unknown';
  const [start, setStart] = React.useState<string>(__allSeries[0].date);
  const [end, setEnd] = React.useState<string>(__allSeries[__allSeries.length - 1].date);
  const [data, setData] = React.useState(__allSeries.slice(-30));
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetch = React.useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const resp = await analyticsApi.fetchModelScores(enterpriseId, { start, end });
      setData(resp);
    } catch (e: any) {
      setError(String(e));
    } finally { setLoading(false); }
  }, [enterpriseId, start, end]);

  React.useEffect(() => { fetch(); }, [fetch]);

  const filtered = data;
  const avg = Math.round((filtered.reduce((s, x) => s + x.score, 0) / (filtered.length || 1)) || 0);

  return (
    <EnterpriseLayout enterpriseId={enterpriseId}>
      <Box p={3}>
        <Typography variant="h5" gutterBottom>AI Analytics</Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Start</InputLabel>
            <Select value={start} label="Start" onChange={(e) => setStart(String(e.target.value))}>
              {__allSeries.map(d => <MenuItem key={d.date} value={d.date}>{d.date}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>End</InputLabel>
            <Select value={end} label="End" onChange={(e) => setEnd(String(e.target.value))}>
              {__allSeries.map(d => <MenuItem key={d.date} value={d.date}>{d.date}</MenuItem>)}
            </Select>
          </FormControl>
          <Button variant="outlined" size="small" onClick={() => { setStart(__allSeries[0].date); setEnd(__allSeries[__allSeries.length-1].date); }}>Reset</Button>
        </Box>

        <Paper sx={{ p: 2 }}>
          <Box sx={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filtered} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2">Average Score</Typography>
            <Typography variant="h5">{avg}</Typography>
          </Paper>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2">Actions</Typography>
            <Button variant="contained" sx={{ mt: 1 }}>Retrain Model</Button>
          </Paper>
        </Box>
        {loading && <Typography sx={{ mt: 2 }}>Loading...</Typography>}
        {error && <Typography color="error" sx={{ mt: 2 }}>Error: {error}</Typography>}
      </Box>
    </EnterpriseLayout>
  );
};

export default EnterpriseAIAnalyticsPrototype;
