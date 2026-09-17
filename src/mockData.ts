import { Member, Announcement, Transaction } from './types';

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'm1',
    name: 'Rashid Mahadhi',
    phone: '0712345678',
    regNumber: 'RYA-2026-001',
    status: 'approved',
    role: 'admin',
    shares: 0,
    joinedAt: '2026-06-18T15:00:00Z',
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const DEFAULT_LOGO = '/src/assets/images/rawdhwa_logo_1781818975195.jpg';
export const DEFAULT_ADMIN_PASSWORD = 'admin'; // Clean default password requested by user or editable
