import apiClient from './apiClient';

export interface SupportTicket {
  id: string;
  enterpriseId: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'pending' | 'resolved';
  createdAt: string;
}

const TICKET_KEY = (enterpriseId: string) => `enterprise_${enterpriseId}_tickets`;

export async function createTicket(enterpriseId: string, ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'status'>) {
  try {
    const resp = await apiClient.post(`/api/support/tickets`, { ...ticket, enterpriseId });
    return resp.data;
  } catch (err) {
    // fallback to localStorage when backend not available
    const tickets = getTickets(enterpriseId);
    const newTicket: SupportTicket = {
      id: `local-${Date.now()}`,
      enterpriseId,
      subject: ticket.subject,
      description: ticket.description,
      priority: ticket.priority,
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    const next = [newTicket, ...tickets];
    try { localStorage.setItem(TICKET_KEY(enterpriseId), JSON.stringify(next)); } catch (e) { /* ignore */ }
    return newTicket;
  }
}

export function getTickets(enterpriseId: string): SupportTicket[] {
  try {
    const raw = localStorage.getItem(TICKET_KEY(enterpriseId));
    if (!raw) return [];
    return JSON.parse(raw) as SupportTicket[];
  } catch (e) {
    return [];
  }
}

export async function fetchTickets(enterpriseId: string) {
  try {
    const resp = await apiClient.get(`/api/support/tickets?enterpriseId=${encodeURIComponent(enterpriseId)}`);
    return resp.data;
  } catch (err) {
    return getTickets(enterpriseId);
  }
}

const support = { createTicket, fetchTickets, getTickets };

export default support;
