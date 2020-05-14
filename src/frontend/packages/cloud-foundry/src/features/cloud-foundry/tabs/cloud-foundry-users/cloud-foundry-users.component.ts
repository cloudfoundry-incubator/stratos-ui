import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { CFAppState } from '../../../../../../cloud-foundry/src/cf-app-state';
import { ListConfig } from '../../../../../../core/src/shared/components/list/list.component.types';
import { CFUserPermissionsService } from '../../../../cf-user-permissions.service';
import { CfUserService } from '../../../../shared/data-services/cf-user.service';
import { ActiveRouteCfOrgSpace } from '../../cf-page.types';
import {
  CfUserListConfigService,
} from './../../../../shared/components/list/list-types/cf-users/cf-user-list-config.service';

@Component({
  selector: 'app-cloud-foundry-users',
  templateUrl: './cloud-foundry-users.component.html',
  styleUrls: ['./cloud-foundry-users.component.scss'],
  providers: [{
    provide: ListConfig,
    useFactory: (
      store: Store<CFAppState>,
      cfUserService: CfUserService,
      router: Router,
      activeRouteCfOrgSpace: ActiveRouteCfOrgSpace,
      userPerms: CFUserPermissionsService,
    ) => new CfUserListConfigService(store, cfUserService, router, activeRouteCfOrgSpace, userPerms),
    deps: [Store, CfUserService, Router, ActiveRouteCfOrgSpace, CFUserPermissionsService]
  }]
})
export class CloudFoundryUsersComponent { }
