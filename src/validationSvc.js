(function () {

    'use strict';

    /**
     * Validation service for client side forms
     */
    angular.module('ndValidation', []) // for use of equality and custom validation rules you will need to include 'ui.validate' module - see  http://angular-ui.github.io/ui-utils/#/validate
        .provider('ndValidationSvc', function () {
            var defaultValidationSource = '$validationConfig', watchers = {}, tranlationSvc = null, self = this;
            this.setDefaultValidationSource = function (src) {
                defaultValidationSource = src;
                return self;
            };
            this.setTranslationSvc = function (svc) {
                tranlationSvc = svc;
                return self;
            };
            function Watcher(key, input, validationOptions) {
                // we will pass the Capitalized input name to the translation service in the validationMessage directive
                this.translationProperties = angular.extend({input: input.charAt(0).toUpperCase() + input.substr(1).replace(/_.*/g, '')}, validationOptions);
                delete this.translationProperties.message;
                this.message = validationOptions.message;
                this.key = key;
                this.input = input;
            }

            this.$get = function ($rootElement) {
                return {
                    getDefaultValidationSource: function (modelInstance) {// called by the ndValidation directive
                        return modelInstance[defaultValidationSource];
                    },
                    getTranslationSvc: function () {
                        if (tranlationSvc) {
                            return $rootElement.injector().get(tranlationSvc);
                        }
                        return null;
                    },
                    addMessage: function (input, key, validationOptions) { // called by the ndValidation directive
                        var watcher = new Watcher(key, input, validationOptions);
                        if (!watchers[input]) {
                            watchers[input] = {};
                        }
                        watchers[input][key] = watcher;
                        return watcher;

                    },
                    hideMessages: function (input) { // can be called on form clearing button function for example
                        angular.forEach(watchers[input], function (watcher) {
                            if (typeof  watcher.hide === 'function') {
                                watcher.hide();
                            }
                        });
                    },
                    subscribe: function (input, key) { // called by the validationMessage directive
                        if (watchers[input] && watchers[input][key]) {
                            return watchers[input][key];
                        }
                        else return false;
                    },
                    getWatchers: function (input) {//called by the ngModel directive
                        return watchers[input];
                    },
                    clearWatchers: function () {//called by the ngModel directive
                        watchers = {};

                    }
                };
            };
        });
})();
