import React from 'react';
import EnterpriseLayout from '../components/Enterprise/EnterpriseLayout';
import TeamDashboard from '../components/Enterprise/TeamDashboard';
import { useParams } from 'react-router-dom';

const EnterpriseTeams: React.FC = () => {
  const { id } = useParams();
  return (
    <EnterpriseLayout enterpriseId={id || 'unknown'}>
      <TeamDashboard />
    </EnterpriseLayout>
  );
};

export default EnterpriseTeams;
