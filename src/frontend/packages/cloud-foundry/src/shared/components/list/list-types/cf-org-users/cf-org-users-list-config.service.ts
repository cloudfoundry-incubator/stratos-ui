import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { CFAppState } from '../../../../../../../cloud-foundry/src/cf-app-state';
import { CfUser } from '../../../../../../../cloud-foundry/src/store/types/user.types';
import { CFUserPermissionsService } from '../../../../../cf-user-permissions.service';
import { ActiveRouteCfOrgSpace } from '../../../../../features/cloud-foundry/cf-page.types';
import {
  CloudFoundryOrganizationService,
} from '../../../../../features/cloud-foundry/services/cloud-foundry-organization.service';
import { CfUserService } from '../../../../data-services/cf-user.service';
import { CfUserListConfigService } from '../cf-users/cf-user-list-config.service';

@Injectable()
export class CfOrgUsersListConfigService extends CfUserListConfigService {

  constructor(
    store: Store<CFAppState>,
    cfOrgService: CloudFoundryOrganizationService,
    cfUserService: CfUserService,
    router: Router,
    activeRouteCfOrgSpace: ActiveRouteCfOrgSpace,
    userPerms: CFUserPermissionsService) {

    super(
      store,
      cfUserService,
      router,
      activeRouteCfOrgSpace,
      userPerms,
      (user: CfUser): boolean => cfUserService.hasRolesInOrg(user, activeRouteCfOrgSpace.orgGuid, false),
      cfOrgService.org$
    );
    this.text.maxedResults.filterLine = 'Please navigate to a Space Users list';
  }
}
