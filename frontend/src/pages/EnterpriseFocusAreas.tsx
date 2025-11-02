import React from 'react';
import EnterpriseLayout from '../components/Enterprise/EnterpriseLayout';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../components/Layout/DashboardLayout';
import FocusAreasPage from './FocusAreasPage';

const EnterpriseFocusAreas: React.FC = () => {
  const { id } = useParams();
  return (
    <EnterpriseLayout enterpriseId={id || 'unknown'}>
      <FocusAreasPage />
    </EnterpriseLayout>
  );
};

export default EnterpriseFocusAreas;
