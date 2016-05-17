'use strict';
/* global angular */

var projectMigrationApp = angular.module('projectMigrationApp', ['projectMigrationFilters','ngAnimate']);

// getting the file-model attribute into controller's scope
projectMigrationApp.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);

projectMigrationApp.run(function($rootScope) {
  //for any init values needed
  $rootScope.server = '';
  $rootScope.user = {};
  $rootScope.pollInterval = 15000;
  $rootScope.status = {
    'projects': '',
    'migrations': '',
    'migrated': ''
  };
  $rootScope.stubs = false;
  if ($rootScope.stubs) {
    $rootScope.urls = {
      'projectsUrl': 'data/projects.json',
      'migrationsUrl': 'data/migrations.json',
      'migrationUrl': '',
      'migrationZipUrl': '',
      'migrationBoxUrl': '',
      'migratedUrl': 'data/migrated.json',
      'migratingUrl': 'data/migrations.json',
      'projectUrl': 'data/project_id.json',
      'checkBoxAuthorizedUrl': '',
      'checkBoxAdminAuthorizedUrl': '',
      'checkIsAdminUser':'',
      'bulkUploadUrl':''
    };
  } else {
    $rootScope.urls = {
      // TODO: store "ctools-project-migration" as configuration variable
      'projectsUrl': '/projects',
      'migrationsUrl': '/migrations',
      'migrationUrl': '/migration',
      'migrationZipUrl': '/migrationZip',
      'migrationBoxUrl': '/migrationBox',
      'migratedUrl': '/migrated',
      'migratingUrl': '/migrating',
      'projectUrl': '/projects/',
      'checkBoxAuthorizedUrl': '/box/checkAuthorized',
      'checkBoxAdminAuthorizedUrl': '/box/checkAdminAuthorized',
      'checkIsAdminUser':'/isAdmin',
      'bulkUploadUrl' : '/bulkUpload'
    };
  }
  $rootScope.addProjectSites = [];

});
