import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import {
  Folder,
  ModelTraining,
  Storage,
} from '@mui/icons-material';

const ModelRepository: React.FC = () => {
  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, width: '100%' }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Folder sx={{ fontSize: 40, color: '#3b82f6', mr: 2 }} />
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Model Repository
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage and version machine learning models and datasets
            </Typography>
          </Box>
        </Box>
      </Box>

      <Card sx={{ borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <ModelTraining sx={{ fontSize: 64, color: '#3b82f6', mb: 2, opacity: 0.7 }} />
          <Typography variant="h6" sx={{ mb: 2 }}>
            Model Repository Module
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Centralized repository for ML models, datasets, and version control.
          </Typography>
          <Button
            variant="contained"
            startIcon={<Storage />}
            sx={{
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1e293b 100%)',
            }}
          >
            Browse Models
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ModelRepository;
