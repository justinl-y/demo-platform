interface GetResult {
  count: number;
  pagination: {
    page: number;
    pages: number;
  };
}

interface PaginatedResult<T> extends GetResult {
  output: {
    [id: string]: T;
  };
}

type SentEmailType = 'INVITATION' | 'PASSWORD_RESET';

type UserStatus = 'CREATED' | 'INVITED' | 'ACTIVE' | 'DEACTIVATED';

export type {
  PaginatedResult,
  UserStatus,
  SentEmailType,
};
