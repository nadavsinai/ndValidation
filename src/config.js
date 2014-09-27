(function(){
    'use strict';
    angular.module('ndValidation').factory('config', function () {
        //a little helper that is added to app $rootScope (property $validationConfig
        var config = {};

        var service = {
            /**
             * Method to get a currently config object by key
             * @param key - {String}
             * @param callback - {Function} to be called when value is available
             * @returns {Object}
             */
            get: function (key, callback) {
                if (!callback) {
                    return config[key];
                }
                if (angular.isDefined(config[key])) {
                    callback(config[key]);
                }
            },

            /**
             * Method to set config object
             * @param key - {String}
             * @param value - {Object}
             */
            set: function (key, value) {
                config[key] = value;
            }
        };

        return service;
    }).run(function($rootScope,config){
        $rootScope.$validationConfig = config;
    })
})();