import React from 'react';
import EnterpriseLayout from '../components/Enterprise/EnterpriseLayout';
import GroupUserDashboard from '../components/Enterprise/GroupUserDashboard';
import { useParams } from 'react-router-dom';

const EnterpriseGroups: React.FC = () => {
  const { id } = useParams();
  return (
    <EnterpriseLayout enterpriseId={id || 'unknown'}>
      <GroupUserDashboard />
    </EnterpriseLayout>
  );
};

export default EnterpriseGroups;
