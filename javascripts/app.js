(function () {

    'use strict';

    angular.module('app', ['pascalprecht.translate', 'ndValidation', 'restangular'])
        .config(function ($translateProvider, RestangularProvider, ndValidationSvcProvider) {
            ndValidationSvcProvider.setDefaultValidationSource('$validationConfig');  // our default validationConfig source
            RestangularProvider.setBaseUrl('http://mrjson.com/data/53f1092d85f7fea8688b4567');
            RestangularProvider.setRequestSuffix('.json'); //peculiarity of mrJSON
            $translateProvider.translations('en', {
                "FORMS": {
                    "REQUIRED": "{{ input || 'This' }} field is required",
                    "MIN_LENGTH": "{{input}} length should be at least {{min}}",
                    "MAX_LENGTH": "{{input}} length should not be longer than {{max}}",
                    "URL_FORMAT": "The URL must follow naming conventions",
                    "DATE_FORMAT": "Must be a valid date in the following format {{ format }}",
                    "EMAIL_FORMAT": "Must be a valid email address",
                    "SHOULD_MATCH": "{{input}} and {{otherModel}} should be equal",
                    "ALLOWED_CHARS": "{{input}} must contain only A-Z, 0-9 and _-., characters"
                }
            });
            $translateProvider.preferredLanguage('en');
        })
        .run(function ($rootScope, config) {
            $rootScope.config = config;
        })
        .controller('myCtrl', function ($scope, myModelSvc, Restangular) {
            $scope.newModel = myModelSvc.new();
            var editIndex;
            myModelSvc.getList().then(function (data) {
                $scope.modelList = data; // and refill again
            });
            $scope.enterEditModel = function (model) {
                editIndex = $scope.modelList.indexOf(model);
                $scope.editModel = Restangular.copy(model);
            };
            $scope.remove = function (model) {
                model.remove().then(function () {
                    $scope.modelList.splice($scope.modelList.indexOf(model), 1);
                });
            };
            $scope.saveNew = function (model) {
                model.customPOST('item').then(function (savedModel) {
                    $scope.modelList.push(savedModel);
                });
            };
            $scope.save = function (model) {
                model.save().then(function (savedModel) {
                    $scope.editModel = null;
                    $scope.modelList[editIndex] = savedModel;
                });
            };
        });
})
();