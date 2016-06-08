/* DO NOT EDIT: This code has been generated by the cf-dotnet-sdk-builder */

(function () {
  'use strict';

  angular
    .module('cloud-foundry.api')
    .run(registerApi);

  registerApi.$inject = [
    '$http',
    'app.api.apiManager'
  ];

  function registerApi($http, apiManager) {
    apiManager.register('cloud-foundry.api.PrivateDomains', new PrivateDomainsApi($http));
  }

  function PrivateDomainsApi($http) {
    this.$http = $http;
  }

  /* eslint-disable camelcase */
  angular.extend(PrivateDomainsApi.prototype, {

   /*
    * Create a Private Domain owned by the given Organization
    * For detailed information, see online documentation at: http://apidocs.cloudfoundry.org/237/private_domains/create_a_private_domain_owned_by_the_given_organization.html
    */
    CreatePrivateDomainOwnedByGivenOrganization: function (value, params, httpConfigOptions) {
      var config = {};
      config.params = params;
      config.url = '/pp/v1/proxy/v2/private_domains';
      config.method = 'POST';
      config.data = value;

      for (var option in httpConfigOptions) {
        config[option] = httpConfigOptions[option]
      }
      return this.$http(config);
    },

   /*
    * Delete a Particular Private Domain
    * For detailed information, see online documentation at: http://apidocs.cloudfoundry.org/237/private_domains/delete_a_particular_private_domain.html
    */
    DeletePrivateDomain: function (guid, params, httpConfigOptions) {
      var config = {};
      config.params = params;
      config.url = '/pp/v1/proxy/v2/private_domains/' + guid + '';
      config.method = 'DELETE';

      for (var option in httpConfigOptions) {
        config[option] = httpConfigOptions[option]
      }
      return this.$http(config);
    },

   /*
    * Filtering Private Domains by name
    * For detailed information, see online documentation at: http://apidocs.cloudfoundry.org/237/private_domains/filtering_private_domains_by_name.html
    */
    FilterPrivateDomainsByName: function (params, httpConfigOptions) {
      var config = {};
      config.params = params;
      config.url = '/pp/v1/proxy/v2/private_domains';
      config.method = 'GET';

      for (var option in httpConfigOptions) {
        config[option] = httpConfigOptions[option]
      }
      return this.$http(config);
    },

   /*
    * List all Private Domains
    * For detailed information, see online documentation at: http://apidocs.cloudfoundry.org/237/private_domains/list_all_private_domains.html
    */
    ListAllPrivateDomains: function (params, httpConfigOptions) {
      var config = {};
      config.params = params;
      config.url = '/pp/v1/proxy/v2/private_domains';
      config.method = 'GET';

      for (var option in httpConfigOptions) {
        config[option] = httpConfigOptions[option]
      }
      return this.$http(config);
    },

   /*
    * List all Shared Organizations for the Private Domain
    * For detailed information, see online documentation at: http://apidocs.cloudfoundry.org/237/private_domains/list_all_shared_organizations_for_the_private_domain.html
    */
    ListAllSharedOrganizationsForPrivateDomain: function (guid, params, httpConfigOptions) {
      var config = {};
      config.params = params;
      config.url = '/pp/v1/proxy/v2/private_domains/' + guid + '/shared_organizations';
      config.method = 'GET';

      for (var option in httpConfigOptions) {
        config[option] = httpConfigOptions[option]
      }
      return this.$http(config);
    },

   /*
    * Retrieve a Particular Private Domain
    * For detailed information, see online documentation at: http://apidocs.cloudfoundry.org/237/private_domains/retrieve_a_particular_private_domain.html
    */
    RetrievePrivateDomain: function (guid, params, httpConfigOptions) {
      var config = {};
      config.params = params;
      config.url = '/pp/v1/proxy/v2/private_domains/' + guid + '';
      config.method = 'GET';

      for (var option in httpConfigOptions) {
        config[option] = httpConfigOptions[option]
      }
      return this.$http(config);
    }

  });
  /* eslint-enable camelcase */

})();
