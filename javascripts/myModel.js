(function () {

    'use strict';
    angular.module('app').factory('UserModel', function () {
        function UserModel(obj) {
            obj = obj || {};
            this.name = obj.name || '';
            this.username = obj.username || '';
            this.phone = obj.phone || '';
            this.website = obj.website || '';
            this.email = obj.email || '';
            this.address = obj.address || {};
            if (obj.address) {
                this.address.street = obj.address.street || '';
                this.address.city = obj.address.city || '';
                this.address.zipcode = obj.address.zipcode || '';
            }
        }

        var allowedVals = ['Berlin', 'London'];
        UserModel.prototype.$validationConfig = {
            name: {
                required: 'FORMS.REQUIRED',
                length: [
                    {min: 6, message: 'FORMS.MIN_LENGTH'},
                    {max: 12, message: 'FORMS.MAX_LENGTH'}
                ]
            },
            username: {
                required: 'FORMS.REQUIRED',
                format: {type: 'pattern', pattern: '/^[a-z0-9_-]*$/', message: 'FORMS.ALLOWED_CHARS'},
                length: [{min: 6, message: 'FORMS.MIN_LENGTH'}, {max: 12, message: 'FORMS.MAX_LENGTH'}]
            },
            email: {format: {type: 'email', message: 'FORMS.EMAIL_FORMAT'}},
            website: {format: {type: 'url', message: 'FORMS.URL_FORMAT'}},
            address: {
                street: {required: 'FORMS.REQUIRED'},
                city: {
                    custom: {
                        functionObj: function (value) {
                            return (allowedVals.indexOf(value) !== -1);
                        }, message: 'Only Berlin and London are allowed'
                    }
                },
                zipcode: {format: {type: 'number', 'message': 'Must be numeric'}}
            }
        };
        return UserModel;
    }).factory('myModelSvc', function (UserModel, Restangular) {

        var BaseAPI = Restangular.all('users');

        var myModelSvc = {
            getList: function () {
                return BaseAPI.getList();
            },
            get: function (appId) {
                return BaseAPI.get(appId);
            },
            new: function () {
                return Restangular.restangularizeElement(null, {}, 'users');
            }

        };
        Restangular.extendModel('users', function (obj) {
            var myUserModelObj = new UserModel(obj);
            angular.extend(obj, myUserModelObj);
            obj.__proto__ = myUserModelObj.__proto__; // we want to keep the prototype too..
            return obj;
        });

        return myModelSvc;

    });
})();