(function () {
  'use strict';

  angular
    .module('cloud-foundry.view.applications.application.delivery-logs', [])
    .config(registerRoute);

  registerRoute.$inject = [
    '$stateProvider'
  ];

  function registerRoute($stateProvider) {
    $stateProvider.state('cf.applications.application.delivery-logs', {
      url: '/delivery-logs',
      templateUrl: 'plugins/cloud-foundry/view/applications/application/delivery-logs/delivery-logs.html',
      controller: ApplicationDeliveryLogsController,
      controllerAs: 'appDelLogsCtrl'
    });
  }

  ApplicationDeliveryLogsController.$inject = [
    '$scope',
    '$stateParams',
    '$interval',
    'moment',
    'app.model.modelManager',
    'helion.framework.widgets.detailView'
  ];

  /**
   * @name ApplicationDeliveryLogsController
   * @constructor
   * @param {object} $scope - the controller's $scope
   * @param {object} $stateParams - the UI router $stateParams service
   * @param {object} $interval - the angular $interval service
   * @param {object} moment - the moment timezone component
   * @param {app.model.modelManager} modelManager - the Model management service
   * @param {helion.framework.widgets.detailView} detailView - the helion framework detailView widget
   * @property {object} model - the Cloud Foundry Applications Model
   * @property {string} id - the application GUID
   */
  function ApplicationDeliveryLogsController($scope, $stateParams, $interval, moment, modelManager, detailView) {
    this.model = modelManager.retrieve('cloud-foundry.model.application');
    this.hceModel = modelManager.retrieve('cloud-foundry.model.hce');
    this.last = {
      build: null,
      test: null,
      deploy: null
    };

    var that = this;
    var updateModelPromise;

    /* eslint-disable */
    // TODO: Fetch the actual user.
    // TODO: Check if project id already exists in hce model?
    /* eslint-enable */
    that.hceModel.getUserByGithubId('18697775')
      .then(function() {
        return that.hceModel.getProjects();
      })
      .then(function() {
        that.model.application.summary.name = 'test';// Temp override
        return that.hceModel.getProject(that.model.application.summary.name);
      })
      .then(function(project) {
        if (angular.isUndefined(project)) {
          throw 'Could not find project with name \'' + that.model.application.summary.name + '\'';
        } else {
          updateData();
          //updateModelPromise = $interval(updateData, 30 * 1000, 0, true);
        }
      })
      .catch(function(error) {
        console.error('Failed to fetch delivery logs data: ', error);
      });

    function updateData() {
      var project = that.hceModel.getProject(that.model.application.summary.name);
      return that.hceModel.getPipelineExecutions(project.id)
        .then(function () {
          // The ux will translate & localise date/time. In order for the search filter to work this conversion needs
          // to happen before being pushed to scope. So two options, either append these values to to existing
          // hceModel.data object or clone and update as needed for this specific directive
          that.parsedHceModel = JSON.parse(JSON.stringify(that.hceModel.data));

          addMockData();
          console.log('that.hceModel.data.pipelineExecutions: ', that.parsedHceModel);

          that.last.build = null;
          var lastBuildTime = null;

          for (var i = 0; i < that.parsedHceModel.pipelineExecutions.length; i++) {
            var build = that.parsedHceModel.pipelineExecutions[i];

            updateBuildForFiltering(that.parsedHceModel.pipelineExecutions, build, i);

            // Localise the reason creation date string (use i18n date/time format)
            var thisBuildTime = moment(build.reason.createdDate);
            // Is this build the last successful one?
            if (build.result.value === 'Success' && (that.last.build == null || lastBuildTime.diff(thisBuildTime) < 0)) {
              that.last.build = build;
              that.last.build.date = thisBuildTime;
              lastBuildTime = thisBuildTime;
            }
          }
        })
        .catch(function (error) {
          console.error('Failed to fetch pipeline executions: ', error);
        });
    }

    function updateBuildForFiltering(builds, build, pos) {
      // Localise the reason creation date string (use i18n date/time format)
      build.reason.createdDateString = moment(build.reason.createdDate).format('L - LTS');

      // Update the result with translated text
      build.result = {
        value: build.result,
        label: gettext(build.result)
      };

      // Strip out properties that aren't displayed (filtering by values which aren't shown is a bit jarring)
      var propertiesToKeep = ['id', 'message', 'result', 'reason.createdDateString', 'reason.author', 'reason.type'];
      var cleanBuild = {};
      for (var j = 0; j < propertiesToKeep.length; j++) {
        var toKeep = propertiesToKeep[j];
        _.set(cleanBuild, toKeep, _.get(build, toKeep));
      }
      builds[pos] = cleanBuild;
    }

    function addMockData() {
      var mocked = [
        {
          concoursePipelineId: "362eeb20-219f-11e6-8838-71fe4dbc2489",
          id: 1,
          message: "Update lastupdated.txt",
          name: "Commit number 2",
          reason: {
            author: "DBaldwin",
            avatarUrl: "https://avatars.githubusercontent.com/u/18697775?v=3",
            commitSha: "123d97f1fc9189c9a9fcc66978e3c85af856262fe",
            commitUrl: "https://github.com/richard-cox/empty-nodejs-application/commit/23d97f1fc9189c9a9fcc66978e3c85af856262fe",
            compareUrl: "https://github.com/richard-cox/empty-nodejs-application/commit/23d97f1fc9189c9a9fcc66978e3c85af856262fe",
            createdDate: moment().subtract(46, 'seconds').valueOf(),
            pullRequestId: null,
            type: "manual"
          },
          result: "Failure"
        },
        {
          concoursePipelineId: "362eeb20-219f-11e6-8838-71fe4dbc2489",
          id: 2,
          message: "Update lastupdated.txt",
          name: "Commit number 2",
          reason: {
            author: "DBaldwin",
            avatarUrl: "https://avatars.githubusercontent.com/u/18697775?v=3",
            commitSha: "123d97f1fc9189c9a9fcc66978e3c85af856262fe",
            commitUrl: "https://github.com/richard-cox/empty-nodejs-application/commit/23d97f1fc9189c9a9fcc66978e3c85af856262fe",
            compareUrl: "https://github.com/richard-cox/empty-nodejs-application/commit/23d97f1fc9189c9a9fcc66978e3c85af856262fe",
            createdDate: moment().subtract(460, 'seconds').valueOf(),
            pullRequestId: null,
            type: "manual"
          },
          result: "Success"
        },
        {
          concoursePipelineId: "362eeb20-219f-11e6-8838-71fe4dbc2489",
          id: 3,
          message: "Fixed the log in so logs go in",
          name: "Change to log in",
          reason: {
            author: "JAubrey",
            avatarUrl: "https://avatars.githubusercontent.com/u/18697775?v=3",
            commitSha: "423d97aasdasfffcc66978e3c85af856262fe",
            commitUrl: "https://github.com/richard-cox/empty-nodejs-application/commit/23d97f1fc9189c9a9fcc66978e3c85af856262fe",
            compareUrl: "https://github.com/richard-cox/empty-nodejs-application/commit/23d97f1fc9189c9a9fcc66978e3c85af856262fe",
            createdDate: moment().subtract(4606, 'seconds').valueOf(),
            pullRequestId: null,
            type: "manual"
          },
          result: "Deploying"
        },
        {
          concoursePipelineId: "362eeb20-219f-11e6-8838-71fe4dbc2489",
          id: 4,
          message: "Fixed broken broker",
          name: "Fixed broken broker",
          reason: {
            author: "GNuman",
            avatarUrl: "https://avatars.githubusercontent.com/u/18697775?v=3",
            commitSha: "523d97f1fc9189c9a9fcc66978e3c85af856262fe",
            commitUrl: "https://github.com/richard-cox/empty-nodejs-application/commit/23d97f1fc9189c9a9fcc66978e3c85af856262fe",
            compareUrl: "https://github.com/richard-cox/empty-nodejs-application/commit/23d97f1fc9189c9a9fcc66978e3c85af856262fe",
            createdDate: moment().subtract(50064, 'seconds').valueOf(),
            pullRequestId: null,
            type: "manual"
          },
          result: "Success"
        },
        {
          concoursePipelineId: "362eeb20-219f-11e6-8838-71fe4dbc2489",
          id: 5,
          message: "Break the build",
          name: "Break the build",
          reason: {
            author: "BAtman",
            avatarUrl: "https://avatars.githubusercontent.com/u/18697775?v=3",
            commitSha: "623d97f1fc9189c9a9fcc66978e3c85af856262fe",
            commitUrl: "https://github.com/richard-cox/empty-nodejs-application/commit/23d97f1fc9189c9a9fcc66978e3c85af856262fe",
            compareUrl: "https://github.com/richard-cox/empty-nodejs-application/commit/23d97f1fc9189c9a9fcc66978e3c85af856262fe",
            createdDate: moment().subtract(55064, 'seconds').valueOf(),
            pullRequestId: null,
            type: "because why not"
          },
          result: "unknown"
        },
        {
          concoursePipelineId: "362eeb20-219f-11e6-8838-71fe4dbc2489",
          id: 6,
          message: "Break the build",
          name: "Break the build",
          reason: {
            author: "BAtman",
            avatarUrl: "https://avatars.githubusercontent.com/u/18697775?v=3",
            commitSha: "623d97f1fc9189c9a9fcc66978e3c85af856262fe",
            commitUrl: "https://github.com/richard-cox/empty-nodejs-application/commit/23d97f1fc9189c9a9fcc66978e3c85af856262fe",
            compareUrl: "https://github.com/richard-cox/empty-nodejs-application/commit/23d97f1fc9189c9a9fcc66978e3c85af856262fe",
            createdDate: moment().subtract(60064, 'seconds').valueOf(),
            pullRequestId: null,
            type: "manual"
          },
          result: "Failure"
        }
      ];
      that.parsedHceModel.pipelineExecutions = that.parsedHceModel.pipelineExecutions.concat(mocked);
    }

    $scope.$on("$destroy", function() {
      if (updateModelPromise) {
        $interval.cancel(updateModelPromise);
      }
    });

    this.id = $stateParams.guid;
    this.detailView = detailView;
  }

  angular.extend(ApplicationDeliveryLogsController.prototype, {

    triggerBuild: function() {
      /* eslint-disable */
      alert('TODO: trigger build');
      /* eslint-enable */
    },

    viewSummaryItem: function(item) {
      /* eslint-disable */
      alert('TODO: Show.. ' + item.link);
      /* eslint-enable */
    },

    viewCommit: function (build) {
      var that = this;
      var rawBuild = _.find(that.hceModel.data.pipelineExecutions, function (o) {
        return o.id === build.id;
      });

      this.detailView({
        templateUrl: 'plugins/cloud-foundry/view/applications/application/delivery-logs/details/commit.html',
        title: rawBuild.message
      }, {
        build: rawBuild,
        builds: _.filter(that.hceModel.data.pipelineExecutions, function(o) {
          return o.reason.commitSha === rawBuild.reason.commitSha;
        }),
        viewBuild: function (build) {
          that.viewBuild(build);
        }
      });
    },

    viewBuild: function(build) {
      this.detailView({
        templateUrl: 'plugins/cloud-foundry/view/applications/application/delivery-logs/details/build-log.html',
        title: gettext('Build Log')
      }, {
        build: build
      });
    }
  });

})();
