import axios from 'axios';
import { ScheduleItem, CreateScheduleItem } from '../types/schedule';

const api = axios.create({ baseURL: '/api' });

export const scheduleService = {
  list: async (): Promise<ScheduleItem[]> => {
    const resp = await api.get<ScheduleItem[]>('/schedule/');
    return resp.data;
  },
  retrieve: async (id: number): Promise<ScheduleItem> => {
    const resp = await api.get<ScheduleItem>(`/schedule/${id}/`);
    return resp.data;
  },
  create: async (payload: CreateScheduleItem | Partial<ScheduleItem>): Promise<ScheduleItem> => {
    const resp = await api.post<ScheduleItem>('/schedule/', payload);
    return resp.data;
  },
  update: async (id: number, payload: Partial<CreateScheduleItem | ScheduleItem>): Promise<ScheduleItem> => {
    const resp = await api.put<ScheduleItem>(`/schedule/${id}/`, payload);
    return resp.data;
  },
  partialUpdate: async (id: number, payload: Partial<CreateScheduleItem | ScheduleItem>): Promise<ScheduleItem> => {
    const resp = await api.patch<ScheduleItem>(`/schedule/${id}/`, payload);
    return resp.data;
  },
  remove: async (id: number): Promise<void> => {
    await api.delete(`/schedule/${id}/`);
  },
  markReminderSent: async (id: number): Promise<void> => {
    await api.post(`/schedule/${id}/mark_reminder_sent/`);
  }
};

export default scheduleService;
