ndValidation
============

###Validation infrastructure helper for Angular.js apps

Instead of re-writing the same validation directives and user messages (with their relevant display logic) add the validation rules for each model property 
in the model prototype (or anywhere else you find logical to you) and use this directive on each input.
This will:

-parse validation rules,
-add relevant directives (support for angular own and custom validation rules)
-add user message element directly after the input element with the defined message passed through translation
-add a ngModel parsers/formatters based watcher that will trigger the display of the relevant message upon input change.

##Install & usage 

with bower one can install using

    bower install nd-validate
    
add the script tag and add the module 'ndValidation' as dependency to your app.
    
On an input field (within or out of a form) add the nd-validation attribute to automatically add validation rules and associated messages by the model validation definition
the default is an object found on the prototype of the model instance called $validationConfig, (this can be set via the  ndValidationSvc.setDefaultValidationSource at config time).
or, alternatively using a validation object which is found on the scope and is refered to in the attribute's value e.g nd-validation='config.get("user").validation'

Special note on Ng-repeat and such repeaters- if a model appears more than once in page's scope (like in ng-repeat) you must make sure the models are unique - in NgRepeat we add '_'+$index to the input name automatically


###Validation config 

This should be an object with keys representing the input names (model properties) and values being either
         - a string (simple message, eg for required),
         - a hash with options an message (eg. for length : {min:5,message:'must be longer than 5'})
         - an array with many validation hashes as above.
     
The following validations are supported :
       required : 'message',
       length : [{min:5,message:'message'},{max:5,message:'message'}]
       format : {type:'url' message:'message}
                 OR
                 {type:'email' message:'message}
                 OR
                 {type:'number' message:'message}
                 OR
                 {type:'pattern' ,pattern:'/\.\/',message:'message'} // any valid regex
                 
####for the following two rules one must include ui-validate module in the app dependencies , see http://angular-ui.github.io/ui-utils/#/validate
 equality :{otherValue:'constant',message:'message'}
                     OR
 {otherModel:'scopeProperty',message:'message'} //good for matching passwords retype fields
 custom: {functionObj:function(value){ //anything goes, return boolean});

 
 ##TODO:
 1.use $templateCache to help customize the message template
 2.make use of ng-messages where available, support ng-model options and other angular 1.3 considerations
 3.add tests