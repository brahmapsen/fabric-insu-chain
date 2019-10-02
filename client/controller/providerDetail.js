hcControllers.controller('providerDetailCtrl', function ($scope, customInterceptor, $state, $window, $rootScope) {

	$scope.init = function () {
		$scope.InvitationCode = $window.sessionStorage.getItem('InvitationCode');
	  $scope.FirstName = $window.sessionStorage.getItem('FirstName');
	  $scope.LastName = $window.sessionStorage.getItem('LastName');
	  $scope.EmailID = $window.sessionStorage.getItem('EmailID');
	  $scope.PhysicianID = $window.sessionStorage.getItem('PhysicianID');
	  $scope.MobilePhone = $window.sessionStorage.getItem('MobilePhone');
	  $scope.HomePhone = $window.sessionStorage.getItem('HomePhone');
	  $scope.EnrollType = $window.sessionStorage.getItem('EnrollType');
		$scope.PrivateKey = $window.sessionStorage.getItem('PrivateKey');
		$scope.Gender = $window.sessionStorage.getItem('Gender');
		$scope.StreetAddress = $window.sessionStorage.getItem('StreetAddress1');
		$scope.City = $window.sessionStorage.getItem('City');
		$scope.State = $window.sessionStorage.getItem('State');
		$scope.Country = $window.sessionStorage.getItem('Country');
		$scope.Zipcode = $window.sessionStorage.getItem('Zipcode');
		$scope.Ssn = $window.sessionStorage.getItem('Ssn');

		if($scope.PhysicianID === 'PHYS1'){
			$scope.ProviderName = 'Apollo';
		}
		else{
			$scope.ProviderName = 'Fortis';
		}
		
	}
	$scope.init();
  
	$scope.updateProvider = function(){
	  $scope.saveProviderDetails ={
		InvitationCode : $scope.InvitationCode,
		PhysicianID : $scope.PhysicianID,
		FirstName : $scope.FirstName,
		LastName : $scope.LastName,
		Gender : $scope.Gender,
		Ssn : $scope.Ssn,
		EmailID : $scope.EmailID,
		MobilePhone : $scope.MobilePhone,
		HomePhone : $scope.HomePhone,
		StreetAddress1 : $scope.StreetAddress,
		City : $scope.City,
		State : $scope.State,
		Country : $scope.Country,
		Zipcode : $scope.Zipcode,
		EnrollType : $scope.EnrollType,
		PrivateKey : $scope.PrivateKey,
		OrgName : 'Org2'
	  }
  
	  var url = "/api/v1/update_user/" + "updateUser";
		   customInterceptor.postrequestwithtoken(url,$scope.saveProviderDetails).then(function successCallback(response){
		$window.alert('Successfully updated provider detail');  
		$scope.result = response.data;
	  });
	}
  
  });