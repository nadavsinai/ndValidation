(function () {

    'use strict';
    angular.module('app').factory('PersonModel', function () {
        function PersonModel() {
            this.name = '';
        }

        PersonModel.prototype.$validationConfig = {
            name: {
                required: 'FORMS.REQUIRED',
                length: [
                    {min: 6, message: 'FORMS.MIN_LENGTH'},
                    {max: 12, message: 'FORMS.MAX_LENGTH'}
                ]

            }
        }
        return PersonModel;
    }).factory('myModelSvc',function(PersonModel,Restangular){

        var BaseAPI = Restangular.all('person');

        var myModelSvc = {
            getList: function () {
                return BaseAPI.customGETLIST('list.json');
            },
            get: function (appId) {
                return BaseAPI.get(appId);
            },
            new:function(){
                return Restangular.restangularizeElement(null,{},'person');
            }

        };
        Restangular.extendModel('person', function (obj) {
            var myPersonModelObj = new PersonModel(obj);
            angular.extend(myPersonModelObj, obj);

            return myPersonModelObj;
        });

        return myModelSvc;

    });
})();