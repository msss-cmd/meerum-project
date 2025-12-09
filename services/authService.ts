import { User, ActivityLog } from '../types';

// Hardcoded Users
const USERS: Record<string, User & { password: string }> = {
  'admin': { id: 'u_admin', username: 'admin', password: 'password', role: 'admin', name: 'Administrator' },
  'user1': { id: 'u_1', username: 'alice', password: 'password', role: 'user', name: 'Alice Researcher' },
  'user2': { id: 'u_2', username: 'bob', password: 'password', role: 'user', name: 'Bob Scientist' },
  'user3': { id: 'u_3', username: 'charlie', password: 'password', role: 'user', name: 'Charlie Analyst' },
};

const LOGS_KEY = 'scholar_sync_logs';

export const login = (username: string, password: string): User | null => {
  // Simple lookup
  const userEntry = Object.values(USERS).find(u => u.username === username && u.password === password);
  if (userEntry) {
    const { password, ...userWithoutPassword } = userEntry;
    return userWithoutPassword;
  }
  return null;
};

export const logActivity = (user: User, paperTitle: string) => {
  const newLog: ActivityLog = {
    id: crypto.randomUUID(),
    userId: user.id,
    username: user.username,
    timestamp: Date.now(),
    paperTitle: paperTitle,
    actionType: 'ANALYSIS_COMPLETED'
  };

  const existingLogsJSON = localStorage.getItem(LOGS_KEY);
  const existingLogs: ActivityLog[] = existingLogsJSON ? JSON.parse(existingLogsJSON) : [];
  
  // Add to beginning
  const updatedLogs = [newLog, ...existingLogs];
  localStorage.setItem(LOGS_KEY, JSON.stringify(updatedLogs));
};

export const getActivityLogs = (): ActivityLog[] => {
  const existingLogsJSON = localStorage.getItem(LOGS_KEY);
  return existingLogsJSON ? JSON.parse(existingLogsJSON) : [];
};

export const clearLogs = () => {
  localStorage.removeItem(LOGS_KEY);
};
