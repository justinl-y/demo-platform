interface GetResult {
  pagination: {
    page: number;
    per_page: number;
    pages: number;
    count_page: number;
    count_total: number;
  };
}

interface PaginatedResult<T> extends GetResult {
  data: T[];
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
