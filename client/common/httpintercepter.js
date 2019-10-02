// All request  will go through this intercepter.

hcService.service('customInterceptor', ['$http', '$rootScope','$window','$state', function($http, $rootScope,$window,$state) {
     //var cookietoken = $window.sessionStorage.getItem('InvitationCode');

  // Used For Edit Invoice
    this.postrequestwithouttoken = function(urlParams, data) {
    	  var baseUrl = 'http://' + 'localhost' +':'+ '4000';
	  	  var endPoint = baseUrl + urlParams;
        var promise = $http.post(endPoint, data);
        promise.then(function successCallback(response){
          //console.log('success')
        }, function errorCallback(response){
          //console.log('error')
        });
	     return promise;
	};

	// Used For Edit Invoice
      this.getrequestwithouttoken = function(urlParams) {
        var baseUrl = 'http://' + 'localhost' +':'+ '4000';
	  	  var endPoint = baseUrl + urlParams;
          var promise = $http.get(endPoint);
          promise.then(function successCallback(response){
          }, function errorCallback(response){});
	     return promise;
    };

    this.getrequestwithtoken = function(urlParams) {
        var cookietoken = $window.sessionStorage.getItem('InvitationCode');
        var baseUrl = 'http://' + 'localhost' +':'+ '4000';
	  	var endPoint = baseUrl + urlParams;
        // $http.defaults.headers.common['Authorization'] = 'Bearer ' + cookietoken;
        $http.defaults.headers.common['Authorization'] =  cookietoken;
          var promise = $http.get(endPoint);
          promise.then(function successCallback(response){
            //console.log('success');
          }, function errorCallback(response){
            $rootScope.spinner = false;
          });
	     return promise;
    };

  this.postrequestwithtoken = function(urlParams, data) {
        var cookietoken = $window.sessionStorage.getItem('InvitationCode');
    	  var baseUrl = 'http://' + 'localhost' +':'+ '4000';
          var endPoint = baseUrl + urlParams;
          $http.defaults.headers.common['Authorization'] =  cookietoken;
          var promise = $http.post(endPoint, data);
          promise.then(function successCallback(response){
            //console.log('success');
          }, function errorCallback(response){
            //console.log('error');
          });
	     return promise;
	};

  this.uploadFileToUrl = function(file, uploadUrl){
        var fd = new FormData();
        fd.append('file', file);
        $https.post(uploadUrl, fd, {
           transformRequest: angular.identity,
           headers: {'Content-Type': undefined}
        })
        .success(function(){
        })
        .error(function(){
        });
    }

}]);
