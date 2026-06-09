interface GetResult {
  count: number;
  pagination: {
    page: number;
    pages: number;
  };
}

type SentEmailType = 'INVITATION' | 'PASSWORD_RESET';

type UserStatus = 'CREATED' | 'INVITED' | 'ACTIVE' | 'DEACTIVATED';

export type {
  GetResult,
  UserStatus,
  SentEmailType,
};
