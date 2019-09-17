import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';

import {
  ListDataSource,
} from '../../../../../../../core/src/shared/components/list/data-sources-controllers/list-data-source';
import { IListConfig } from '../../../../../../../core/src/shared/components/list/list.component.types';
import {
  createEntityRelationPaginationKey,
} from '../../../../../../../cloud-foundry/src/entity-relations/entity-relations.types';
import { APIResource } from '../../../../../../../store/src/types/api.types';
import { GetAppEnvVarsAction } from '../../../../../actions/app-metadata.actions';
import { AppVariablesAdd, AppVariablesEdit } from '../../../../../actions/app-variables.actions';
import { CFAppState } from '../../../../../cf-app-state';
import { appEnvVarsEntityType, applicationEntityType, cfEntityFactory } from '../../../../../cf-entity-factory';
import { ApplicationService } from '../../../../../features/applications/application.service';
import { AppEnvVarsState } from '../../../../../store/types/app-metadata.types';
import { entityCatalogue } from '../../../../../../../core/src/core/entity-catalogue/entity-catalogue.service';
import { CF_ENDPOINT_TYPE } from '../../../../../../cf-types';
import { PaginatedAction } from '../../../../../../../store/src/types/pagination.types';
import { STRATOS_ENDPOINT_TYPE } from '../../../../../../../core/src/base-entity-schemas';

export interface ListAppEnvVar {
  name: string;
  value: string;
}

export class CfAppVariablesDataSource extends ListDataSource<ListAppEnvVar, APIResource<AppEnvVarsState>> {

  public cfGuid: string;
  public appGuid: string;

  constructor(
    store: Store<CFAppState>,
    appService: ApplicationService,
    listConfig: IListConfig<ListAppEnvVar>
  ) {
    const appEnvVarsEntity = entityCatalogue.getEntity(CF_ENDPOINT_TYPE, appEnvVarsEntityType);
    const actionBuilder = appEnvVarsEntity.actionOrchestrator.getActionBuilder('get');
    const getAppEnvVarsAction = actionBuilder(appService.appGuid, appService.cfGuid) as PaginatedAction;
    super({
      store,
      action: getAppEnvVarsAction,
      schema: cfEntityFactory(appEnvVarsEntityType),
      getRowUniqueId: object => object.name,
      getEmptyType: () => ({ name: '', value: '', }),
      paginationKey: createEntityRelationPaginationKey(applicationEntityType, appService.appGuid),
      transformEntity: map(variables => {
        if (!variables || variables.length === 0) {
          return [];
        }
        const env = variables[0].entity.environment_json;
        const rows = Object.keys(env).map(name => ({ name, value: env[name] }));
        return rows;
      }),
      isLocal: true,
      transformEntities: [{ type: 'filter', field: 'name' }],
      listConfig
    });

    this.cfGuid = appService.cfGuid;
    this.appGuid = appService.appGuid;
  }

  saveAdd() {
    const appEnvVarsEntity = entityCatalogue.getEntity(CF_ENDPOINT_TYPE, appEnvVarsEntityType);
    const actionBuilder = appEnvVarsEntity.actionOrchestrator.getActionBuilder('addNewToApplication');
    const appVariablesAddAction = actionBuilder(this.cfGuid, this.appGuid, this.transformedEntities, this.addItem);

    this.store.dispatch(appVariablesAddAction);
    super.saveAdd();
  }

  startEdit(row: ListAppEnvVar) {
    super.startEdit({ ...row });
  }

  saveEdit() {
    const appEnvVarsEntity = entityCatalogue.getEntity(CF_ENDPOINT_TYPE, appEnvVarsEntityType);
    const actionBuilder = appEnvVarsEntity.actionOrchestrator.getActionBuilder('editInApplication');
    const appVariablesEditAction = actionBuilder(this.cfGuid, this.appGuid, this.transformedEntities, this.editRow);
    
    this.store.dispatch(appVariablesEditAction);
    super.saveEdit();
  }

}