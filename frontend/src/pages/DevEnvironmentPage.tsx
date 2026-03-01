// AtonixCorp Cloud — Environment Management
// Empty state: no environments configured yet.

import React from 'react'
import {
  Box,
  Button,
  Stack,
  Typography,
} from '@mui/material'

import AddIcon from '@mui/icons-material/Add'
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined'

import { dashboardTokens } from '../styles/dashboardDesignSystem'
const FONT = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'





// ─── Empty state page ─────────────────────────────────────────────────────────

const DevEnvironmentPage: React.FC = () => {
  const t = dashboardTokens.colors
  const BP = t.brandPrimary

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: t.background,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: FONT,
      }}
    >
      {/* Page header */}
      <Box
        sx={{
          bgcolor: t.surface,
          borderBottom: `1px solid ${t.border}`,
          px: { xs: 2, md: 3 },
          py: 2.5,
        }}
      >
        <Typography
          sx={{
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: '1.15rem',
            color: t.textPrimary,
            letterSpacing: '-.02em',
          }}
        >
          Environments
        </Typography>
        <Typography
          sx={{
            fontFamily: FONT,
            fontSize: '.83rem',
            color: t.textSecondary,
            mt: 0.35,
          }}
        >
          Dev → Stage → Prod — visibility, control, and traceability across your deployment pipeline.
        </Typography>
      </Box>

      {/* Empty state */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 3, md: 6 },
        }}
      >
        <Stack alignItems="center" spacing={2.5} sx={{ maxWidth: 420, textAlign: 'center' }}>
          {/* Icon circle */}
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: `${BP}18`,
              border: `2px dashed ${BP}55`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LayersOutlinedIcon sx={{ fontSize: '2.2rem', color: BP, opacity: 0.7 }} />
          </Box>

          <Box>
            <Typography
              sx={{
                fontFamily: FONT,
                fontWeight: 800,
                fontSize: '1.1rem',
                color: t.textPrimary,
                letterSpacing: '-.02em',
                mb: 0.75,
              }}
            >
              No environments yet
            </Typography>
            <Typography
              sx={{
                fontFamily: FONT,
                fontSize: '.88rem',
                color: t.textSecondary,
                lineHeight: 1.6,
              }}
            >
              Create your first environment to start managing deployments, config, and secrets across your pipeline.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            disableElevation
            sx={{
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: '.85rem',
              textTransform: 'none',
              bgcolor: BP,
              color: '#fff',
              px: 3,
              py: 1.1,
              borderRadius: 1.5,
              '&:hover': { bgcolor: BP, filter: 'brightness(1.12)' },
            }}
          >
            Create Environment
          </Button>

          <Typography
            sx={{
              fontFamily: FONT,
              fontSize: '.75rem',
              color: t.textSecondary,
              opacity: 0.6,
            }}
          >
            Environments will appear here once created.
          </Typography>
        </Stack>
      </Box>
    </Box>
  )
}

export default DevEnvironmentPage
