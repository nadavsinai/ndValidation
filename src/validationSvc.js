(function () {

    'use strict';

    /**
     * Validation service for client side forms
     */
    angular.module('ndValidation',['ui.validate'])
        .provider('ndValidationSvc', function () {
            var defaultValidationSource = null, watchers = {};
            this.setDefaultValidationSource = function (src) {
                defaultValidationSource = src;
            };
            function Watcher(key, input, validationOptions) {
                // we will pass the Capitalized input name to the translation service in the validationMessage directive
                this.translationProperties = angular.extend({input: input.charAt(0).toUpperCase() + input.substr(1).replace(/_.*/g, '')}, validationOptions);
                delete this.translationProperties.message;
                this.message = validationOptions.message;
                this.key = key;
                this.input = input;
            }

            this.$get = function () {
                return {
                    getDefaultValidationSource: function (modelInstance) {// called by the ndValidation directive
                        return modelInstance[defaultValidationSource];
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
