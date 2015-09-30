'use strict';
/* global  projectMigrationApp, angular, _, moment*/

/* TERMS CONTROLLER */
projectMigrationApp.controller('projectMigrationController', ['Projects', 'PollingService', '$rootScope', '$scope', '$log', function(Projects, PollingService, $rootScope, $scope, $log) {

  $scope.sourceProjects = [];
  $scope.migratingProjects = [];
  $scope.migratedProjects = [];
  $scope.migrations = {};

  //server url
  var projectsUrl;
  // test data
  var projectsUrl;
  if ($rootScope.stubs) {
    projectsUrl = 'data/projects.json';
  } else {
    projectsUrl = 'someserverurl';
  }

  Projects.getProjects(projectsUrl).then(function(result) {
    $scope.sourceProjects = _.where(result.data.site_collection, {
      type: 'project'
    });
    $log.info(moment().format('h:mm:ss') + ' - source projects loaded');
    $log.info(' - - - - GET /projects');
  });

  var migrationsUrl;
  if ($rootScope.stubs) {
    migrationsUrl = 'data/migrations.json';
  } else {
    migrationsUrl = 'someserverurl';
  }
  Projects.getProjects(migrationsUrl).then(function(result) {
    $scope.migratingProjects = result.data;
    $rootScope.status.migrations = moment().format('h:mm:ss');
    $scope.migratingProjectsShadow = result.data;
    $log.info(moment().format('h:mm:ss') + ' - migrating projects loaded');
    $log.info(' - - - - GET /migrating');
    if (result.data.length) {
      $log.warn('page load got one or more current migrations - will have to poll it');
      PollingService.startPolling('migrationsOnPageLoad', migrationsUrl, 15000, function(result) {
        if (result.data.length === 0) {
          $log.warn('Nothing being migrated, polling /migrations one last time, reloading /migrated and then stopping polling');
          PollingService.stopPolling('migrationsOnPageLoad');
        }
        $log.info(moment().format('h:mm:ss') + ' - projects being migrated polled  AFTER PAGE LOAD');
        $log.info(' - - - - GET /migrations/');
        $log.info(' - - - - repaint current migrations list');
        $rootScope.status.migrations = moment().format('h:mm:ss');

        $scope.migratingProjects = result.data;
      });

    }

  });

  var migratedUrl;
  if ($rootScope.stubs) {
    migratedUrl = 'data/migrated.json';
  } else {
    migratedUrl = 'someserverurl';
  }

  Projects.getProjects(migratedUrl).then(function(result) {
    $scope.migratedProjects = result.data;
    $rootScope.status.migrated = moment().format('h:mm:ss');
    $log.info(moment().format('h:mm:ss') + ' - migrated projects loaded');
    $log.info(' - - - - GET /migrated');
  });

  $scope.getTools = function(projectId) {
    var projectUrl;
    if ($rootScope.stubs) {
      projectUrl = 'data/project_id.json';
    } else {
      projectUrl = 'someserverurl';
    }

    Projects.getProject(projectUrl).then(function(result) {
      var targetProjPos = $scope.sourceProjects.indexOf(_.findWhere($scope.sourceProjects, {
        entityId: projectId
      }));
      $scope.sourceProjects[targetProjPos].tools = result.data;

      //state management
      $scope.sourceProjects[targetProjPos].stateHasTools = true;

      $log.info(moment().format('h:mm:ss') + ' - tools requested for project ' + $scope.sourceProjects[targetProjPos].entityTitle + ' ( site ID: s' + projectId + ')');
      $log.info(' - - - - GET /projects/' + projectId);
    });
  };

  $scope.checkIfSelectionExists = function(projectId) {
    var targetProjPos = $scope.sourceProjects.indexOf(_.findWhere($scope.sourceProjects, {
      entityId: projectId
    }));
    $scope.sourceProjects[targetProjPos].selectionExists = false;
    _.each($scope.sourceProjects[targetProjPos].tools, function(tool) {
      if (tool.selected) {
        //state management
        $scope.sourceProjects[targetProjPos].stateSelectionExists = true;
      }
    });
  };

  $scope.startMigrationConfirm = function(projectId) {
    var targetProjPos = $scope.sourceProjects.indexOf(_.findWhere($scope.sourceProjects, {
      entityId: projectId
    }));
    // pop confirmation panel
    //state management
    $scope.sourceProjects[targetProjPos].stateExportConfirm = true;
  };

  $scope.cancelStartMigrationConfirm = function(projectId) {
    // close confirmation panel and reset things
    var targetProjPos = $scope.sourceProjects.indexOf(_.findWhere($scope.sourceProjects, {
      entityId: projectId
    }));
    // reset all checkboxes
    _.each($scope.sourceProjects[targetProjPos].tools, function(tool) {
      tool.selected = false;
    });
    //state management
    $scope.sourceProjects[targetProjPos].stateExportConfirm = false;
    $scope.sourceProjects[targetProjPos].stateSelectionExists = false;
  };

  $scope.startMigration = function(projectId) {
    var targetProjPos = $scope.sourceProjects.indexOf(_.findWhere($scope.sourceProjects, {
      entityId: projectId
    }));
    $log.info(moment().format('h:mm:ss') + ' - project migration started for ' + $scope.sourceProjects[targetProjPos].entityTitle + ' ( site ID: s' + projectId + ')');
    $log.info(' - - - - POST /migrate/' + projectId);
    //1. POST to /migration/projectId    
    // TODO: need factory
    //2. adjust UI for this this project
    // state management    
    $scope.sourceProjects[targetProjPos].stateMigrating = {
      status: 'Migration in progress',
      dateStarted: moment().format('MM/D/YY, h:mm:ss a')
    };

    //3. POST above will return a migration ID - store this so that when it the related projectId dissapears from the 
    //current migrations list the UI for the projects and the current migrations lists can be updated
    //4. poll /migrations - this would be in a timer
    var migrationsUrl;
    if ($rootScope.stubs) {
      migrationsUrl = 'data/migrations.json';
    } else {
      migrationsUrl = 'someserverurl';
    }
    
    PollingService.stopPolling('migrationsOnPageLoad' + projectId);

    PollingService.startPolling('migrationsAfterPageLoad', migrationsUrl, 15000, function(result) {
      if (result.data.length === 0) {
        $log.warn('Nothing being migrated, polling /migrations one last time, reloading /migrated and then stopping polling');
        PollingService.stopPolling('migrationsAfterPageLoad' + projectId);
      }
      $log.info(moment().format('h:mm:ss') + ' - projects being migrated polled');
      $log.info(' - - - - GET /migrations/');
      $log.info(' - - - - repaint current migrations list');
      $rootScope.status.migrations = moment().format('h:mm:ss');

      $scope.migratingProjects = result.data;

      if (!angular.equals($scope.migratingProjects, $scope.migratingProjectsShadow)) {
        Projects.getProjects(migratedUrl).then(function(result) {
          $scope.migratedProjects = result.data;
          $rootScope.status.migrated = moment().format('h:mm:ss');
          $log.info(moment().format('h:mm:ss') + ' - migrating panel changed - migrated projects reloaded');
          $log.info(' - - - - GET /migrated');
        });
      }

      $scope.migratingProjectsShadow = $scope.migratingProjects;

    });
  };


}]);
