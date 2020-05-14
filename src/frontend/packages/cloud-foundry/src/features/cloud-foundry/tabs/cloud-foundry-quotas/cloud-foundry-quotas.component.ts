import { Component } from '@angular/core';
import { Observable } from 'rxjs';

import { ListConfig } from '../../../../../../core/src/shared/components/list/list.component.types';
import { CFUserPermissions } from '../../../../cf-user-permissions.config';
import { CFUserPermissionsService } from '../../../../cf-user-permissions.service';
import {
  CfQuotasListConfigService,
} from '../../../../shared/components/list/list-types/cf-quotas/cf-quotas-list-config.service';
import { CloudFoundryEndpointService } from '../../services/cloud-foundry-endpoint.service';

@Component({
  selector: 'app-cloud-foundry-quotas',
  templateUrl: './cloud-foundry-quotas.component.html',
  styleUrls: ['./cloud-foundry-quotas.component.scss'],
  providers: [
    {
      provide: ListConfig,
      useClass: CfQuotasListConfigService
    }
  ]
})
export class CloudFoundryQuotasComponent {
  public canAddQuota$: Observable<boolean>;

  constructor(
    public cfEndpointService: CloudFoundryEndpointService,
    currentUserPermissionsService: CFUserPermissionsService
  ) {
    this.canAddQuota$ = currentUserPermissionsService.can(CFUserPermissions.QUOTA_CREATE, this.cfEndpointService.cfGuid);
  }
}
