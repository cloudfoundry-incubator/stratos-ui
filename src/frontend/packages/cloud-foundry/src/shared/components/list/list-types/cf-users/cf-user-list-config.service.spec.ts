import { inject, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { CFAppState } from '../../../../../../../cloud-foundry/src/cf-app-state';
import {
  CloudFoundryOrganizationServiceMock,
} from '../../../../../../../core/test-framework/cloud-foundry-organization.service.mock';
import { CloudFoundrySpaceServiceMock } from '../../../../../../../core/test-framework/cloud-foundry-space.service.mock';
import {
  generateCfBaseTestModules,
  generateTestCfEndpointServiceProvider,
} from '../../../../../../test-framework/cloud-foundry-endpoint-service.helper';
import { CFUserPermissionsService } from '../../../../../cf-user-permissions.service';
import { ActiveRouteCfOrgSpace } from '../../../../../features/cloud-foundry/cf-page.types';
import {
  CloudFoundryOrganizationService,
} from '../../../../../features/cloud-foundry/services/cloud-foundry-organization.service';
import { CloudFoundrySpaceService } from '../../../../../features/cloud-foundry/services/cloud-foundry-space.service';
import { CfUserService } from '../../../../data-services/cf-user.service';
import { CfUserListConfigService } from './cf-user-list-config.service';

describe('CfUserListConfigService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: generateCfBaseTestModules(),
      providers: [
        {
          provide: CfUserListConfigService,
          useFactory: (
            store: Store<CFAppState>,
            cfUserService: CfUserService,
            router: Router,
            activeRouteCfOrgSpace: ActiveRouteCfOrgSpace,
            userPerms: CFUserPermissionsService,
          ) => new CfUserListConfigService(store, cfUserService, router, activeRouteCfOrgSpace, userPerms),
          deps: [Store, CfUserService, Router, ActiveRouteCfOrgSpace, CFUserPermissionsService]
        }
        ,
        { provide: CloudFoundrySpaceService, useClass: CloudFoundrySpaceServiceMock },
        { provide: CloudFoundryOrganizationService, useClass: CloudFoundryOrganizationServiceMock },
        ...generateTestCfEndpointServiceProvider()
      ]
    });
  });

  it('should be created', inject([CfUserListConfigService], (service: CfUserListConfigService) => {
    expect(service).toBeTruthy();
  }));
});
