/* DO NOT EDIT: This code has been generated by swagger-codegen */
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
    apiManager.register('cloud-foundry.api.HceNotificationApi', new HceNotificationApi($http));
  }

  /**
    * @constructor
    * @name HceNotificationApi
    * @description For more information on this API, please see:
    * https://github.com/hpcloud/hce-rest-service/blob/master/app/v2/swagger.yml
    * @param {object} $http - the Angular $http service
    * @property {object} $http - the Angular $http service
    * @property {string} baseUrl - the API base URL
    */
  function HceNotificationApi($http) {
    this.$http = $http;
    this.baseUrl = '/pp/v1/proxy/v2';
  }

  angular.extend(HceNotificationApi.prototype, {
    /**
     * @name addNotificationTarget
     * @description Add a NotificationTarget (for a project).
     * @param {string} guid - the HCE instance GUID
     * @param {object} data - the request body
     * @param {object} params - the query parameters
     * @param {object} httpConfigOptions - additional config options
     * @returns {promise} A resolved/rejected promise
     */
    addNotificationTarget: function (guid, data, params, httpConfigOptions) {
      var path = this.baseUrl + '/notifications/targets';
      var headers = {
        'x-cnap-cnsi-list': guid
      };

      var config = {
        method: 'POST',
        url: path,
        params: params || {},
        data: data,
        headers: headers
      };

      angular.forEach(httpConfigOptions, function (optionConfig, option) {
        if (option === 'headers') {
          angular.extend(config[option], optionConfig);
        } else {
          config[option] = optionConfig;
        }
      });

      return this.$http(config);
    },

    /**
     * @name getNotificationTarget
     * @description Get the specified notification target.
     * @param {string} guid - the HCE instance GUID
     * @param {!number} notificationTargetId - NotificationTarget id.
     * @param {object} params - the query parameters
     * @param {object} httpConfigOptions - additional config options
     * @returns {promise} A resolved/rejected promise
     */
    getNotificationTarget: function (guid, notificationTargetId, params, httpConfigOptions) {
      var path = this.baseUrl + '/notifications/targets/{notification_target_id}'
        .replace('{' + 'notification_target_id' + '}', notificationTargetId);
      var headers = {
        'x-cnap-cnsi-list': guid
      };

      var config = {
        method: 'GET',
        url: path,
        params: params || {},
        headers: headers
      };

      angular.forEach(httpConfigOptions, function (optionConfig, option) {
        if (option === 'headers') {
          angular.extend(config[option], optionConfig);
        } else {
          config[option] = optionConfig;
        }
      });

      return this.$http(config);
    },

    /**
     * @name getNotificationTargets
     * @description List notifiction targets, optionally filtering.
     * @param {string} guid - the HCE instance GUID
     * @param {object} params - the query parameters
     * @param {object} httpConfigOptions - additional config options
     * @returns {promise} A resolved/rejected promise
     */
    getNotificationTargets: function (guid, params, httpConfigOptions) {
      var path = this.baseUrl + '/notifications/targets';
      var headers = {
        'x-cnap-cnsi-list': guid
      };

      var config = {
        method: 'GET',
        url: path,
        params: params || {},
        headers: headers
      };

      angular.forEach(httpConfigOptions, function (optionConfig, option) {
        if (option === 'headers') {
          angular.extend(config[option], optionConfig);
        } else {
          config[option] = optionConfig;
        }
      });

      return this.$http(config);
    },

    /**
     * @name listNotificationTargetTypes
     * @description Enumeration of Notification target types, e.g. &#x60;HIPCHAT&#x60;, &#x60;SLACK&#x60;, etc.\n
     * @param {string} guid - the HCE instance GUID
     * @param {object} params - the query parameters
     * @param {object} httpConfigOptions - additional config options
     * @returns {promise} A resolved/rejected promise
     */
    listNotificationTargetTypes: function (guid, params, httpConfigOptions) {
      var path = this.baseUrl + '/notifications/targets/types';
      var headers = {
        'x-cnap-cnsi-list': guid
      };

      var config = {
        method: 'GET',
        url: path,
        params: params || {},
        headers: headers
      };

      angular.forEach(httpConfigOptions, function (optionConfig, option) {
        if (option === 'headers') {
          angular.extend(config[option], optionConfig);
        } else {
          config[option] = optionConfig;
        }
      });

      return this.$http(config);
    },

    /**
     * @name removeNotificationTarget
     * @description Remove the specified notification target.
     * @param {string} guid - the HCE instance GUID
     * @param {!number} notificationTargetId - NotificationTarget id.
     * @param {object} params - the query parameters
     * @param {object} httpConfigOptions - additional config options
     * @returns {promise} A resolved/rejected promise
     */
    removeNotificationTarget: function (guid, notificationTargetId, params, httpConfigOptions) {
      var path = this.baseUrl + '/notifications/targets/{notification_target_id}'
        .replace('{' + 'notification_target_id' + '}', notificationTargetId);
      var headers = {
        'x-cnap-cnsi-list': guid
      };

      var config = {
        method: 'DELETE',
        url: path,
        params: params || {},
        headers: headers
      };

      angular.forEach(httpConfigOptions, function (optionConfig, option) {
        if (option === 'headers') {
          angular.extend(config[option], optionConfig);
        } else {
          config[option] = optionConfig;
        }
      });

      return this.$http(config);
    },

    /**
     * @name updateNotificationTarget
     * @description Update the specified notification target.
     * @param {string} guid - the HCE instance GUID
     * @param {!number} notificationTargetId - NotificationTarget id.
     * @param {object} data - the request body
     * @param {object} params - the query parameters
     * @param {object} httpConfigOptions - additional config options
     * @returns {promise} A resolved/rejected promise
     */
    updateNotificationTarget: function (guid, notificationTargetId, data, params, httpConfigOptions) {
      var path = this.baseUrl + '/notifications/targets/{notification_target_id}'
        .replace('{' + 'notification_target_id' + '}', notificationTargetId);
      var headers = {
        'x-cnap-cnsi-list': guid
      };

      var config = {
        method: 'PUT',
        url: path,
        params: params || {},
        data: data,
        headers: headers
      };

      angular.forEach(httpConfigOptions, function (optionConfig, option) {
        if (option === 'headers') {
          angular.extend(config[option], optionConfig);
        } else {
          config[option] = optionConfig;
        }
      });

      return this.$http(config);
    }
  });
})();
