import axios from 'axios';
import { ScheduleItem, CreateScheduleItem } from '../types/schedule';

const _api = axios.create({ baseURL: '/api' });

export const scheduleService = {
  list: async (): Promise<ScheduleItem[]> => {
    const resp = await _api.get<ScheduleItem[]>('/schedule/');
    return resp.data;
  },
  retrieve: async (id: string): Promise<ScheduleItem> => {
    const resp = await _api.get<ScheduleItem>(`/schedule/${id}/`);
    return resp.data;
  },
  create: async (payload: CreateScheduleItem | Partial<ScheduleItem>): Promise<ScheduleItem> => {
    const resp = await _api.post<ScheduleItem>('/schedule/', payload);
    return resp.data;
  },
  update: async (id: string, payload: Partial<CreateScheduleItem | ScheduleItem>): Promise<ScheduleItem> => {
    const resp = await _api.put<ScheduleItem>(`/schedule/${id}/`, payload);
    return resp.data;
  },
  partialUpdate: async (id: string, payload: Partial<CreateScheduleItem | ScheduleItem>): Promise<ScheduleItem> => {
    const resp = await _api.patch<ScheduleItem>(`/schedule/${id}/`, payload);
    return resp.data;
  },
  remove: async (id: string): Promise<void> => {
    await _api.delete(`/schedule/${id}/`);
  },
  markReminderSent: async (id: string): Promise<void> => {
    await _api.post(`/schedule/${id}/mark_reminder_sent/`);
  }
};

export default scheduleService;
