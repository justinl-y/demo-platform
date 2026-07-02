/** Types generated for queries found in "src/repositories/internal-users/types/get-pending-invitation.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'InternalUsersGetPendingInvitation' parameters type */
export interface IInternalUsersGetPendingInvitationParams {
  inviteTokenHash: string;
}

/** 'InternalUsersGetPendingInvitation' return type */
export interface IInternalUsersGetPendingInvitationResult {
  user_id: string;
}

/** 'InternalUsersGetPendingInvitation' query type */
export interface IInternalUsersGetPendingInvitationQuery {
  params: IInternalUsersGetPendingInvitationParams;
  result: IInternalUsersGetPendingInvitationResult;
}

const internalUsersGetPendingInvitationIR: any = {"usedParamSet":{"inviteTokenHash":true},"params":[{"name":"inviteTokenHash","required":true,"transform":{"type":"scalar"},"locs":[{"a":210,"b":226}]}],"statement":"                                                             \nSELECT\n  ua.user_id\nFROM\n  internal.users_authentication AS ua\n  INNER JOIN internal.users AS u ON u.id = ua.user_id\nWHERE\n  ua.invite_token_hash = :inviteTokenHash!\n  AND ua.invite_token_expiry_at > NOW()\n  AND u.status = 'INVITED'"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * SELECT
 *   ua.user_id
 * FROM
 *   internal.users_authentication AS ua
 *   INNER JOIN internal.users AS u ON u.id = ua.user_id
 * WHERE
 *   ua.invite_token_hash = :inviteTokenHash!
 *   AND ua.invite_token_expiry_at > NOW()
 *   AND u.status = 'INVITED'
 * ```
 */
export const internalUsersGetPendingInvitation = new PreparedQuery<IInternalUsersGetPendingInvitationParams,IInternalUsersGetPendingInvitationResult>(internalUsersGetPendingInvitationIR);


