export interface AccountSession {
  sessionId: string;
  userId: string;
  username: string;
  email: string;
  isActive: boolean;
  expiresAt: Date;
  lastUsedAt: Date;
}

export interface CurrentUser {
  id: string;
  name: string | null;
  username: string;
  email: string;
}
