import React, { useEffect, useState } from 'react';
import { fetchAuditLogs } from '../../services/auditService';
import { AuditLogEntry } from '../../types/audit';
import AuditLogTable from './AuditLogTable';
import LoadingSpinner from '../Shared/LoadingSpinner';
import ErrorBanner from '../Shared/ErrorBanner';

const _AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAuditLogs()
      .then((data) => setLogs(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBanner message={error} />;

  return (
    <div className="audit-logs-container">
      <h2>Audit Logs</h2>
      <AuditLogTable entries={logs} />
    </div>
  );
};

export default _AuditLogs;