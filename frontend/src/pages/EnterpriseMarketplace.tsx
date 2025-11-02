import React from 'react';
import EnterpriseLayout from '../components/Enterprise/EnterpriseLayout';
import MarketplacePage from './MarketplacePage';
import { useParams } from 'react-router-dom';

const EnterpriseMarketplace: React.FC = () => {
  const { id } = useParams();
  return (
    <EnterpriseLayout enterpriseId={id || 'unknown'}>
      <MarketplacePage />
    </EnterpriseLayout>
  );
};

export default EnterpriseMarketplace;
