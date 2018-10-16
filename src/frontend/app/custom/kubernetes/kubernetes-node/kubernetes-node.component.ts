import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { first, map, tap } from 'rxjs/operators';

import { EndpointsService } from '../../../core/endpoints.service';
import { IHeaderBreadcrumb } from '../../../shared/components/page-header/page-header.types';
import { BaseKubeGuid } from '../kubernetes-page.types';
import { KubernetesEndpointService } from '../services/kubernetes-endpoint.service';
import { KubernetesNodeService } from '../services/kubernetes-node.service';
import { KubernetesService } from '../services/kubernetes.service';

@Component({
  selector: 'app-kubernetes-node',
  templateUrl: './kubernetes-node.component.html',
  styleUrls: ['./kubernetes-node.component.scss'],
  providers: [
    {
      provide: BaseKubeGuid,
      useFactory: (activatedRoute: ActivatedRoute) => {
        return {
          guid: activatedRoute.snapshot.params.kubeId
        };
      },
      deps: [
        ActivatedRoute
      ]
    },
    KubernetesService,
    KubernetesEndpointService,
    KubernetesNodeService
  ]
})
export class KubernetesNodeComponent {

  tabLinks = [
    { link: 'summary', label: 'Summary' },
    { link: 'metrics', label: 'Metrics' },
    { link: 'pods', label: 'Pods' },
  ];

  public breadcrumbs$: Observable<IHeaderBreadcrumb[]>;

  constructor(
    public kubeEndpointService: KubernetesEndpointService,
    public kubeNodeService: KubernetesNodeService,
    public endpointsService: EndpointsService
  ) {
    this.endpointsService.hasMetrics(this.kubeEndpointService.kubeGuid).pipe(
      first(),
      tap(haveMetrics => {
        if (!haveMetrics) {
          this.tabLinks = [
            { link: 'summary', label: 'Summary' },
            { link: 'pods', label: 'Pods' },
          ];
        }
      })
    ).subscribe();

    this.breadcrumbs$ = kubeEndpointService.endpoint$.pipe(
      map(endpoint => ([{
        breadcrumbs: [
          { value: endpoint.entity.name, routerLink: `/kubernetes/${endpoint.entity.guid}` },
        ]
      }])
      )
    );
  }
}
