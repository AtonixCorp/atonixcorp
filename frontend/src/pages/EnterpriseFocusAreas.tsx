import React from 'react';
import EnterpriseLayout from '../components/Enterprise/EnterpriseLayout';
import { useParams } from 'react-router-dom';
// DashboardLayout import removed because it's unused in this wrapper
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
