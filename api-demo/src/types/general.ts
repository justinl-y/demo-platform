interface GetResult {
  count: number;
  pagination: {
    page: number;
    pages: number;
  };
}

type UserStatus = 'CREATED' | 'INVITED' | 'ACTIVE' | 'DEACTIVATED';

export type {
  GetResult,
  UserStatus,
};
