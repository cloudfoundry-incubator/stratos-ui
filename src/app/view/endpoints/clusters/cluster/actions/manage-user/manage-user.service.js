(function () {
  'use strict';

  angular
    .module('app.view.endpoints.clusters.cluster')
    .factory('app.view.endpoints.clusters.cluster.manangeUsers', ManageUsersFactory);

  ManageUsersFactory.$inject = [
    '$q',
    'app.model.modelManager',
    'helion.framework.widgets.asyncTaskDialog',
    '$stateParams',
    '$rootScope'
  ];

  function ManageUsersFactory($q, modelManager, asyncTaskDialog, $stateParams, $rootScope) {
    var that = this;

    var organizationModel = modelManager.retrieve('cloud-foundry.model.organization');
    var spaceModel = modelManager.retrieve('cloud-foundry.model.space');

    var orgRoles = {};
    _.forEach(['org_manager', 'org_auditor', 'billing_manager'], function (role) {
      orgRoles[role] = organizationModel.organizationRoleToString(role);
    });
    var spaceRoles = {};
    _.forEach(['space_manager', 'space_auditor', 'space_developer'], function (role) {
      spaceRoles[role] = spaceModel.spaceRoleToString(role);
    });

    var selectedRoles = {};

    /**
     * @name ManageUsersFactory.show
     * @description ???
     * @param {object} user ????
     * @returns {promise} ??
     */
    this.show = function (clusterGuid, user) {
      var that = this;

      // spaces: spacesForTable,
      //   user: user,

      var selectedOrgRoles = ['org_user', 'org_manager', 'billing_manager'];
      var selectedSpaceRoles = { };
      return asyncTaskDialog(
        {
          title: gettext('Manager User: ') + user.entity.username,
          templateUrl: 'app/view/endpoints/clusters/cluster/actions/manage-user/manage-user.html',
          buttonTitles: {
            submit: gettext('Save Changes')
          }
        },
        {
          orgRoles: orgRoles,
          spaceRoles: spaceRoles,
          organizations: organizationModel.organizations[clusterGuid],
          selectedRoles: selectedRoles,
          removeFromOrg: that.removeFromOrg
        },
        that.assignUsers
      );
    };

    this.removeFromOrg = function (arg) {
      console.log('removeFromOrg: ', arg);
    };

    /**
     * @name ManageUsersFactory.assignUsers
     * @description Assign the controllers selected users with the selected roles. If successful refresh the cache of
     * the affected organizations and spaces
     * @returns {promise}
     */
    this.assignUsers = function () {
      console.log('selectedRoles: ', selectedRoles);
      return $q.reject('poop butt');
    };

    /**
     * @name ManageUsersFactory.assignUser
     * @description Assign the user's selected roles. If successful refresh the cache of the affected organizations and
     * spaces
     * @param {object} user - the HCF user object of the user to assign roles to
     * @returns {promise}
     */
    this.assignUser = function (user) {

    };

    return this;
  }


})();
