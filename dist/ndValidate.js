!function(){"use strict";angular.module("ndValidation").factory("config",function(){var e={},t={get:function(t,n){return n?void(angular.isDefined(e[t])&&n(e[t])):e[t]},set:function(t,n){e[t]=n}};return t}).run(["$rootScope","config",function(e,t){e.$validationConfig=t}])}(),function(){"use strict";angular.module("ndValidation").directive("ndValidation",["$compile","ndValidationSvc","$log","config","$parse",function(e,t,n,a,r){return{restrict:"A",priority:1e3,terminal:!0,compile:function(){return{post:function(i,o,u){o.removeAttr("nd-validation");var s,l=u.ngModel.replace(/\.\w{0,}/g,""),c=i[l],d=u.ngModel.replace(l+".","");s=i.hasOwnProperty("$index")?d+"_"+i.$index:d;var f=u.ndValidation?i.$eval(u.ndValidation):t.getDefaultValidationSource(c);if(f){var g=r(d)(f);if(g){var h=function(e,n){var a=t.addMessage(s,e,n);return angular.element("<validation-message input='"+a.input+"' key='"+a.key+"'></validation-message>")};angular.forEach(g,function(t,n){angular.isArray(t)||(t=[t]),angular.forEach(t,function(t){switch("string"==typeof t&&(t={message:t}),n){case"format":switch(t.type){case"url":o.attr("type","url"),o.after(e(h("url",t))(i));break;case"email":o.attr("type","email"),o.after(e(h("email",t))(i));break;case"number":o.attr("type","number"),o.after(e(h("number",t))(i));break;case"pattern":o.attr("ng-pattern",t.pattern),o.after(e(h("pattern",t))(i))}break;case"length":t.min&&(o.attr("ng-minlength",t.min),o.after(e(h("minlength",t))(i))),t.max&&(o.attr("ng-maxlength",t.min),o.after(e(h("maxlength",t))(i)));break;case"equality":var r=t.otherValue||t.otherModel;o.attr("ui-validate","'$value=="+l+"."+r+"'"),t.otherModel&&o.attr("ui-validate-watch","'"+l+"."+r+"'"),o.after(e(h("validator",t))(i));break;case"custom":if("function"==typeof t.functionObj){var u="ndValidation_"+s+"_"+Math.floor(100*Math.random());a.set(u,t.functionObj),o.attr("ui-validate","{"+u+":\"$validationConfig.get('"+u+"')($value)\"}"),o.after(e(h(u,t))(i))}break;case"required":o.attr("required","required"),o.after(e(h("required",t))(i))}})})}}else n.error("Validation source is not an object, can not parse rules");e(o)(i)}}}}}]).directive("ngModel",["ndValidationSvc","$timeout",function(e,t){return{restrict:"A",require:"^ngModel",compile:function(){return{post:function(n,a,r,i){var o=r.ngModel.replace(/\.\w{0,}/g,""),u=r.ngModel.replace(o+".","");n.hasOwnProperty("$index")&&(u+="_"+n.$index);var s=e.getWatchers(u),l=[];if(s){angular.forEach(s,function(e){l.push(e.key)});var c=function(e){return t(function(){l.forEach(function(e){i.$error[e]?s[e].show():s[e].hide()})}),e};i.$parsers.push(c),i.$viewChangeListeners.push(c),n.$on("$destroy",function(){e.clearWatchers()})}}}}}}]).directive("validationMessage",["ndValidationSvc","$log",function(e,t){var n=e.getTranslationSvc();return{restrict:"E",replace:!0,template:"<span class='help-block alert-warning hidden'></span>",link:function(a,r,i){var o=e.subscribe(i.input,i.key);o.message&&(n?n(o.message,o.translationProperties).then(function(e){r.html(e)},function(e){t.info("Validation for "+i.input+" input validation key "+i.key+' was not translated  - "'+e+'"'),r.html(o.message)}):r.html(o.message)),o.show=function(){r.removeClass("hidden")},o.hide=function(){r.addClass("hidden")}}}}])}(),function(){"use strict";angular.module("ndValidation",[]).provider("ndValidationSvc",function(){function e(e,t,n){this.translationProperties=angular.extend({input:t.charAt(0).toUpperCase()+t.substr(1).replace(/_.*/g,"")},n),delete this.translationProperties.message,this.message=n.message,this.key=e,this.input=t}var t="$validationConfig",n={},a=null,r=this;this.setDefaultValidationSource=function(e){return t=e,r},this.setTranslationSvc=function(e){return a=e,r},this.$get=["$rootElement",function(r){return{getDefaultValidationSource:function(e){return e[t]},getTranslationSvc:function(){return a?r.injector().get(a):null},addMessage:function(t,a,r){var i=new e(a,t,r);return n[t]||(n[t]={}),n[t][a]=i,i},hideMessages:function(e){angular.forEach(n[e],function(e){"function"==typeof e.hide&&e.hide()})},subscribe:function(e,t){return n[e]&&n[e][t]?n[e][t]:!1},getWatchers:function(e){return n[e]},clearWatchers:function(){n={}}}}]})}();