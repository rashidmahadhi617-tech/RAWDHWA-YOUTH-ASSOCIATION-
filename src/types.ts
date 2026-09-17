export interface Member {
  id: string;
  name: string;
  phone: string;
  regNumber: string; // Namba ya Usajili kwa ajili ya login na utambulisho ya kipekee
  status: 'pending' | 'approved' | 'rejected';
  role: 'member' | 'admin';
  shares: number;
  joinedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'mkutano' | 'habari' | 'historia' | 'sisi'; // meeting, news, history, about us
  image?: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  memberId: string;
  memberName: string;
  memberPhone: string;
  amount: number;
  type: 'tuma' | 'pokea'; // 'tuma' (send/deposit), 'pokea' (receive/withdraw)
  provider: 'Airtel Money' | 'M-Pesa (Vodacom)' | 'Tigo Pesa' | 'Halopesa' | 'Zantel Ezy Pesa';
  referenceId: string;
  status: 'completed' | 'pending';
  date: string;
}

export interface AppState {
  members: Member[];
  announcements: Announcement[];
  transactions: Transaction[];
  currentSession: {
    user: Member | null;
    isAdmin: boolean;
  } | null;
}
