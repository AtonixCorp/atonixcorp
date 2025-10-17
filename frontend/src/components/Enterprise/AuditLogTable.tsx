import React from 'react';
import type { AuditLogEntry } from '../../types/audit';

const formatTimestamp = (iso?: string) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

const AuditLogTable: React.FC<{ entries: AuditLogEntry[] }> = ({ entries }) => {
  if (!entries || entries.length === 0) return <div>No audit entries found.</div>;

  return (
    <table className="audit-log-table" role="table" aria-label="Audit logs">
      <thead>
        <tr>
          <th scope="col">Time</th>
          <th scope="col">User</th>
          <th scope="col">Action</th>
          <th scope="col">Resource</th>
          <th scope="col">Details</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((e) => (
          <tr key={e.id}>
            <td>{formatTimestamp(e.timestamp)}</td>
            <td>{e.user?.displayName ?? e.user?.username ?? 'System'}</td>
            <td>{e.action}</td>
            <td>{e.resourceType ? `${e.resourceType} ${e.resourceId ?? ''}` : ''}</td>
            <td>{typeof e.details === 'string' ? e.details : JSON.stringify(e.details ?? {})}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default AuditLogTable;
