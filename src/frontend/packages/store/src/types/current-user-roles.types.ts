import { ScopeStrings } from '../../../cloud-foundry/src/cf-user-permissions.config';
import { IAllCfRolesState, ICfRolesState } from '../../../cloud-foundry/src/store/types/cf-current-user-roles.types';

export interface RolesRequestState {
  initialised: boolean;
  fetching: boolean;
  error: boolean;
}

export function getDefaultRolesRequestState(): RolesRequestState {
  return {
    initialised: false,
    fetching: false,
    error: false
  };
}

export function getDefaultEndpointRoles(): ICfRolesState {
  return {
    global: {
      isAdmin: false,
      isReadOnlyAdmin: false,
      isGlobalAuditor: false,
      canRead: false,
      canWrite: false,
      scopes: []
    },
    spaces: {

    },
    organizations: {

    },
    state: getDefaultRolesRequestState()
  };
}

export interface IStratosRolesState {
  isAdmin: boolean;
  scopes: ScopeStrings[];
}

export interface ICurrentUserRolesState {
  internal: IStratosRolesState;
  cf: IAllCfRolesState;
  state: RolesRequestState;
}
