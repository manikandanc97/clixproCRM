import client from './client';

export interface UserSessionDto {
  id: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  browser: string;
  operatingSystem: string;
  ipAddress: string | null;
  createdAt: string;
  lastActiveAt: string;
  isCurrent: boolean;
  isRevoked: boolean;
  revokedAt: string | null;
}

export interface SessionsListResponse {
  success: boolean;
  data: {
    sessions: UserSessionDto[];
    count: number;
    activeCount: number;
  };
}

export interface SessionRevokeResponse {
  success: boolean;
  message: string;
  data: {
    success: boolean;
    message: string;
    sessionId?: string;
    revokedCount?: number;
    isCurrent?: boolean;
  };
}

export const fetchUserSessions = async (): Promise<SessionsListResponse['data']> => {
  const response = await client.get<SessionsListResponse>('/auth/sessions');
  return response.data.data;
};

export const revokeUserSession = async (
  sessionId: string
): Promise<SessionRevokeResponse> => {
  const response = await client.delete<SessionRevokeResponse>(
    `/auth/sessions/${sessionId}`
  );
  return response.data;
};

export const revokeAllOtherSessions = async (): Promise<SessionRevokeResponse> => {
  const response = await client.post<SessionRevokeResponse>(
    '/auth/sessions/revoke-all-other',
    {}
  );
  return response.data;
};

export interface SecurityActivityDto {
  id: string;
  action: string;
  module: string;
  createdAt: string;
  ipAddress: string | null;
  browser: string | null;
  operatingSystem: string | null;
  deviceType: string | null;
  sessionId: string | null;
  isCurrent: boolean;
  isRevoked: boolean;
  firstLogin?: boolean;
}

export interface SecurityActivityResponse {
  success: boolean;
  data: {
    activity: SecurityActivityDto[];
    total: number;
    page: number;
    limit: number;
  };
}

export const fetchSecurityActivity = async (
  page = 1,
  limit = 20
): Promise<SecurityActivityResponse['data']> => {
  const response = await client.get<SecurityActivityResponse>(
    `/auth/security/activity?page=${page}&limit=${limit}`
  );
  return response.data.data;
};

