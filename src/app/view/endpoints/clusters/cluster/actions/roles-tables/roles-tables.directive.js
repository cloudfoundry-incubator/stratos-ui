(function () {
  'use strict';

  angular
    .module('app.view.endpoints.clusters.cluster')
    .directive('rolesTables', RolesTables);

  RolesTables.$inject = [];

  function RolesTables() {
    return {
      bindToController: {
        config: '=',
        organization: '=',
        selection: '=',
        filter: '=?'
      },
      controller: RolesTablesController,
      controllerAs: 'rolesTablesCtrl',
      scope: {},
      templateUrl: 'app/view/endpoints/clusters/cluster/actions/roles-tables/roles-tables.html'
    };
  }

  RolesTablesController.$inject = [
    '$scope',
    '$q',
    'app.model.modelManager',
    'app.view.endpoints.clusters.cluster.rolesService'
  ];

  /**
   * @name RolesTablesController
   * @description Controller for a roles tables directive. Will optionally update the model cache
   * @constructor
   * @param {object} $scope - the angular $scope service
   * @param {object} $q - the angular $q service
   * @param {app.model.modelManager} modelManager - the model management service
   */
  function RolesTablesController($scope, $q, modelManager, rolesService) {
    var that = this;

    this.rolesService = rolesService;

    // If the organization changes, ensure we respond
    $scope.$watch(function () {
      return that.organization;
    }, refresh);

    if (!this.config.disableOrg) {
      // Ensure that the org_user is correctly updated
      _.forEach(this.config.orgRoles, function (val, roleKey) {
        $scope.$watch(function () {
          return that.selection.organization[roleKey];
        }, function () {
          that.rolesService.updateOrgUser(that.selection.organization);
        });
      });
    }


    function refresh() {
      // Optionally update the cache
      if (_.get(that, 'config.showExistingRoles')) {
        // Convert the cached organization roles into a keyed object of truthies required to run the check boxes
        var orgRolesByUser = that.organization.roles;
        // At the moment we're only dealing with one user. See TEAMFOUR-708 for bulk users
        var user = that.config.users[0];
        var userRoles = orgRolesByUser[user.metadata.guid];
        _.set(that.selection, 'organization', _.keyBy(userRoles));

        // Convert the cached space roles into a keyed object of truthies required to run the check boxes
        var spaceModel = modelManager.retrieve('cloud-foundry.model.space');
        _.forEach(that.organization.spaces, function (space) {
          var spaceRoles = spaceModel.spaces[that.config.clusterGuid][space.metadata.guid].roles;
          spaceRoles = _.get(spaceRoles, user.metadata.guid, []);
          _.set(that.selection, 'spaces.' + space.metadata.guid, _.keyBy(spaceRoles));
        });

      }

      // Set the current org and spaces collections
      that.org = [that.organization];
      that.spaces = _.map(that.organization.spaces, function (space) {
        return {
          label: space.entity.name,
          key: space.metadata.guid
        };
      });
    }

    var initPromise = this.config.initPromise || $q.when();
    initPromise.then(function () {
      refresh();
    });
  }

})();
