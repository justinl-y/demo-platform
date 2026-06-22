interface GetResult {
  count: number;
  pagination: {
    page: number;
    pages: number;
  };
}

interface PaginatedResult<T> extends GetResult {
  data: {
    [id: string]: T;
  };
}

type SentEmailType = 'INVITATION' | 'PASSWORD_RESET';

type UserStatus = 'CREATED' | 'INVITED' | 'ACTIVE' | 'DEACTIVATED';

type SortOrder = 'ASC' | 'DESC';

export type {
  PaginatedResult,
  UserStatus,
  SentEmailType,
  SortOrder,
};
