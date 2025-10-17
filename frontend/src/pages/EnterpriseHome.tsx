import React from 'react';
import EnterpriseLayout from '../components/Enterprise/EnterpriseLayout';
import CompanyDashboard from '../components/Enterprise/CompanyDashboard';
import { useParams } from 'react-router-dom';

const EnterpriseHome: React.FC = () => {
  const { id } = useParams();
  const enterpriseId = id || 'unknown';

  return (
    <EnterpriseLayout enterpriseId={enterpriseId}>
      <CompanyDashboard />
    </EnterpriseLayout>
  );
};

export default EnterpriseHome;
