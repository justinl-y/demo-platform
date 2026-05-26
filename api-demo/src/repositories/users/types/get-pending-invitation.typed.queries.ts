/** Types generated for queries found in "src/repositories/users/types/get-pending-invitation.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'UsersGetPendingInvitation' parameters type */
export interface IUsersGetPendingInvitationParams {
  inviteTokenHash: string;
}

/** 'UsersGetPendingInvitation' return type */
export interface IUsersGetPendingInvitationResult {
  user_id: string;
}

/** 'UsersGetPendingInvitation' query type */
export interface IUsersGetPendingInvitationQuery {
  params: IUsersGetPendingInvitationParams;
  result: IUsersGetPendingInvitationResult;
}

const usersGetPendingInvitationIR: any = {"usedParamSet":{"inviteTokenHash":true},"params":[{"name":"inviteTokenHash","required":true,"transform":{"type":"scalar"},"locs":[{"a":0,"b":0}]}],"statement":""};

/**
 * Placeholder generated alongside get-pending-invitation.sql.
 * Run `npm run sql:types` to regenerate with the proper IR.
 */
export const usersGetPendingInvitation = new PreparedQuery<IUsersGetPendingInvitationParams,IUsersGetPendingInvitationResult>(usersGetPendingInvitationIR);
