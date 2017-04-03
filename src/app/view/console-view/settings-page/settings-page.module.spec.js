(function () {
  'use strict';

  describe('settings-page module', function () {
    var controller;

    beforeEach(module('templates'));
    beforeEach(module('green-box-console'));

    beforeEach(inject(function ($injector) {
      var $state = $injector.get('$state');
      var appEventEventService = $injector.get('appEventEventService');
      var modelManager = $injector.get('modelManager');
      var AccountSettingsController = $state.get('account-settings').controller;
      controller = new AccountSettingsController(appEventEventService, modelManager);
    }));

    it('should be defined', function () {
      expect(controller).toBeDefined();
      expect(controller.model).toBeDefined();
      expect(controller.stackatoInfo).toBeDefined();
    });
  });

})();
