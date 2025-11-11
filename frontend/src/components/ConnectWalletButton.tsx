import React from 'react';
import { Button, Tooltip, Box, Typography } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import useWallet from '../hooks/useWallet';

const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

const ConnectWalletButton: React.FC = () => {
  const { providerAvailable, account, error, connect } = useWallet();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {account ? (
        <Tooltip title={account}>
          <Button
            variant="outlined"
            startIcon={<AccountBalanceWalletIcon />}
            sx={{ borderRadius: '12px', textTransform: 'none' }}
          >
            <Typography sx={{ fontWeight: 600 }}>{truncate(account)}</Typography>
          </Button>
        </Tooltip>
      ) : (
        <Button
          variant="contained"
          color="primary"
          onClick={async () => { await connect(); }}
          startIcon={<AccountBalanceWalletIcon />}
          sx={{ borderRadius: '12px', textTransform: 'none' }}
        >
          Connect Wallet
        </Button>
      )}
      {error && (
        <Typography variant="caption" color="warning.main" sx={{ ml: 1 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default ConnectWalletButton;
