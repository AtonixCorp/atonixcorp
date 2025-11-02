import React from 'react';
import EnterpriseLayout from '../components/Enterprise/EnterpriseLayout';
import ResourcesPage from './ResourcesPage';
import { useParams } from 'react-router-dom';

const EnterpriseResources: React.FC = () => {
  const { id } = useParams();
  return (
    <EnterpriseLayout enterpriseId={id || 'unknown'}>
      <ResourcesPage />
    </EnterpriseLayout>
  );
};

export default EnterpriseResources;
