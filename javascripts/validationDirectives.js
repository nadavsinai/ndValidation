(function () {

    'use strict';

    /**
     * Validation service for client side forms
     */
    angular.module('ndValidation')

    /**
     * ND Validation directives
     * @author Nadav Sinai  ns@nadavsinai.com
     * @date july/2014
     * @dependenies - NgModel
     * use - on an input field (within or  not within a form) add the nd-validation attriubute to automatically add validation rules and associated messages by the model validation defination
     *      the default is an object found on the prototype of the model instance called validationConfig, (this can be set via the  ndValidationSvc.setDefaultValidationSource at config time).
     *      or, alternatively using a validation object which is found on the scope and is refered to in the attribute's value e.g nd-validation='config.get("user").validation'
     * Special note on Ng-repeat - if a model appears more than once in page's scope (like in ng-repeat) you must make sure the models are unique - in NgRepeat we add '_'+$index to the input name automatically
     * Validation config - should be an object with keys representing the input names (model properties) and values being either
     *    - a string (simple message, eg for required),
     *    - a hash with options an message (eg. for length : {min:5,message:'must be longer than 5'})
     *    - an array with many validation hashes as above.
     *
     *  The following validations are supported :
     *  required : 'message',
     *  length : [{min:5,message:'message'},{max:5,message:'message'}]
     *  format : {type:'url' message:'message}
     *            OR
     *            {type:'email' message:'message}
     *            OR
     *            {type:'number' message:'message}
     *            OR
     *            {type:'pattern' ,pattern:'/\.*\/',message:'message'} // any valid regex
     *  equality :{otherValue:'constant',message:'message'}
     *                OR
     *              {otherModel:'scopeProperty',message:'message'} //good for matching passwords retype fields
     *  custom: {functionObj:function(value){ //anything goes, return boolean});
     *
     *
     *  internalInfo - this runs before every other directive, and re-compiles the element with some other directives as per the input's validation policy, it also adds the validation messages directive below the input
     */

        .directive('ndValidation', function ($compile, ndValidationSvc, $log, config, $parse) {
            return {
                restrict: 'A',
                priority: 1000,// important - must be before ngModel
                terminal: true,//no others will follow
                compile: function (tElement, tAttr) {
                    return {
                        post: function ($scope, $element, $attrs) {
                            $element.removeAttr('nd-validation'); // first things first - make sure we don't compile again, prevent infinite loop
                            var instanceName = $attrs.ngModel.replace(/\.\w{0,}/g, '');
                            var modelInstance = $scope[instanceName]; // eg get the app from ng-model='app.title'
                            var inputName, baseInputName = $attrs.ngModel.replace(instanceName + '.', '');// eg get the title from ng-model='app.title'
                            if ($scope.hasOwnProperty('$index')) { // we are in Ng-Repeat  - must add index to the inputName
                                inputName = baseInputName + '_' + $scope.$index;
                            }
                            else {
                                inputName = baseInputName;
                            }
                            var validationConfigSource = ($attrs.ndValidation) ? $scope.$eval($attrs.ndValidation) : ndValidationSvc.getDefaultValidationSource(modelInstance);
                            if (!validationConfigSource) {
                                $log.error('Validation source is not an object, can not parse rules');
                            }
                            else {
                                var validationConf = $parse(baseInputName)(validationConfigSource); // all we care about is this inputs config.
                                if (validationConf) {
                                    var createHelpElement = function (validationKey, validationOptions) {
                                        var watcher = ndValidationSvc.addMessage(inputName, validationKey, validationOptions);
                                        return angular.element("<validation-message input='" + watcher.input + "' key='" + watcher.key + "'></validation-message>");
                                    };
                                    angular.forEach(validationConf, function (validationOptions, validationType) {
                                        if (!angular.isArray(validationOptions)) { // support single hashes and strings
                                            validationOptions = [validationOptions];
                                        }
                                        angular.forEach(validationOptions, function (validationOptions) { // we go through the validations
                                            if (typeof validationOptions === 'string') {
                                                validationOptions = {message: validationOptions}; // our validation only has message - make it an object with message
                                            }
                                            switch (validationType) {
                                                case 'format':
                                                    switch (validationOptions.type) {
                                                        case  'url' :
                                                            $element.attr('type', 'url');
                                                            $element.after($compile(createHelpElement('url', validationOptions))($scope));
                                                            break;
                                                        case  'email' :
                                                            $element.attr('type', 'email');
                                                            $element.after($compile(createHelpElement('email', validationOptions))($scope));
                                                            break;
                                                        case  'number' :
                                                            $element.attr('type', 'number');
                                                            $element.after($compile(createHelpElement('number', validationOptions))($scope));
                                                            break;
                                                        case 'pattern':
                                                            $element.attr('ng-pattern', validationOptions.pattern);
                                                            $element.after($compile(createHelpElement('pattern', validationOptions))($scope));
                                                            break;
                                                    }
                                                    break;
                                                case 'length':
                                                    if (validationOptions.min) {
                                                        $element.attr('ng-minlength', validationOptions.min);
                                                        $element.after($compile(createHelpElement('minlength', validationOptions))($scope));
                                                    }
                                                    if (validationOptions.max) {
                                                        $element.attr('ng-maxlength', validationOptions.min);
                                                        $element.after($compile(createHelpElement('maxlength', validationOptions))($scope));
                                                    }
                                                    break;
                                                case 'equality':
                                                    var otherValue = validationOptions.otherValue || validationOptions.otherModel;
                                                    $element.attr('ui-validate', "'$value==" + instanceName + '.' + otherValue + "'");
                                                    if (validationOptions.otherModel) {
                                                        $element.attr('ui-validate-watch', "'" + instanceName + '.' + otherValue + "'");
                                                    }
                                                    $element.after($compile(createHelpElement('validator', validationOptions))($scope));
                                                    break;
                                                case 'custom':
                                                    if (typeof validationOptions.functionObj === 'function') {
                                                        var validtionName = 'ndValidation_' + inputName + '_' + Math.floor(Math.random() * 100);
                                                        config.set(validtionName, validationOptions.functionObj);
                                                        $element.attr('ui-validate', '{' + validtionName + ':"$validationConfig.get(\'' + validtionName + '\')($value)"}');
                                                        $element.after($compile(createHelpElement(validtionName, validationOptions))($scope));
                                                    }
                                                    break;
                                                case 'required':
                                                    $element.attr('required', 'required');
                                                    $element.after($compile(createHelpElement('required', validationOptions))($scope));
                                                    break;

                                            }
                                        });
                                    });
                                }
                            }
                            $compile($element)($scope);

                        }
                    };
                }
            };
        }
    )
    /**
     *ngModel - a helper that binds our validation watchers to the ngModelCntrl, runs the show/hide validation messages when $error exists.
     *
     **/
        .directive('ngModel', function (ndValidationSvc, $timeout) {
            return {
                restrict: 'A',
                require: '^ngModel',
                compile: function (tElement, tAttr) {
                    return {
                        post: function ($scope, $element, $attrs, ngModelCntrl) {
                            var instanceName = $attrs.ngModel.replace(/\.\w{0,}/g, '');
                            var inputName = $attrs.ngModel.replace(instanceName + '.', '');
                            if ($scope.hasOwnProperty('$index')) { // we are in Ng-Repeat  - must add index
                                inputName += '_' + $scope.$index;
                            }
                            var watchers = ndValidationSvc.getWatchers(inputName), keys = [];
                            if (watchers) {
                                angular.forEach(watchers, function (value) {
                                    keys.push(value.key);
                                });
                                var helperShowHide = function (value) {
                                    $timeout(function () {
                                        keys.forEach(function (keyValue) {
                                            if (ngModelCntrl.$error[keyValue]) {
                                                watchers[keyValue].show();
                                            }
                                            else {
                                                watchers[keyValue].hide();
                                            }
                                        });
                                    });
                                    return value;
                                };
                                ngModelCntrl.$parsers.push(helperShowHide);
                                ngModelCntrl.$viewChangeListeners.push(helperShowHide);
                                $scope.$on('$destroy', function () {
                                    ndValidationSvc.clearWatchers();
                                });
                            }
                        }
                    };

                }
            };

        })/**
     ValidationMessage - a directive that gets the watcher objects and compiles the validation message from the config using the translation provider, it sends the translationProperties as locals so use of {{input}} is possible
     eg min length for field can be a message like this : {{input}} length must be more than {{min}}
     the actual show/hide functions also occur here (as we have access to the $element here), but are operated from the ngModel directive above.
     */
        .directive('validationMessage', function (ndValidationSvc, $log) {
            var $translate = ndValidationSvc.getTranslationSvc();
            return {
                restrict: 'E',
                replace: true,
                template: "<span class='help-block alert-warning hidden'></span>",
                link: function ($scope, $element, $attrs) {

                    var watcher = ndValidationSvc.subscribe($attrs.input, $attrs.key);
                    if (watcher.message) {
                        if ($translate) {
                            $translate(watcher.message, watcher.translationProperties).then(function (translatedMessage) {
                                $element.html(translatedMessage);
                            }, function (error) {
                                $log.info('Validation for ' + $attrs.input + ' input validation key ' + $attrs.key + ' was not translated  - "' + error + '"');
                                $element.html(watcher.message);
                            });
                        }
                        else { // no translation
                            $element.html(watcher.message);
                        }
                    }
                    watcher.show = function () {
                        $element.removeClass('hidden');
                    };
                    watcher.hide = function () {
                        $element.addClass('hidden');
                    };

                }
            };

        });
})
();