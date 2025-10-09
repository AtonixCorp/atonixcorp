import { UserActivity } from '../types/activity';

// Mock service for management activities. Replace with real API calls later.
export const managementService = {
  async getActivities(): Promise<UserActivity[]> {
    // Simulate network delay
    await new Promise((res) => setTimeout(res, 300));

    return [
      { id: 'a1', user: 'alice', action: 'login', timestamp: new Date().toISOString(), details: 'Logged in from 192.168.0.1' },
      { id: 'a2', user: 'bob', action: 'view_dashboard', timestamp: new Date().toISOString(), details: 'Viewed analytics' },
      { id: 'a3', user: 'carol', action: 'update_profile', timestamp: new Date().toISOString(), details: 'Updated bio and skills' },
      { id: 'a4', user: 'dave', action: 'create_project', timestamp: new Date().toISOString(), details: 'Created project "EdgeAI"' },
    ];
  },
};
