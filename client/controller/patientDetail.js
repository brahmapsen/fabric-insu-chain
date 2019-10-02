hcControllers.controller('patientDetailCtrl', function ($scope, customInterceptor, $state, $window, $rootScope) {

  $scope.init = function () {
    $scope.InvitationCode = $window.sessionStorage.getItem('InvitationCode');
    $scope.FirstName = $window.sessionStorage.getItem('FirstName');
    $scope.LastName = $window.sessionStorage.getItem('LastName');
    $scope.EmailID = $window.sessionStorage.getItem('EmailID');
    $scope.PatientID = $window.sessionStorage.getItem('PatientID');
    $scope.MobilePhone = $window.sessionStorage.getItem('MobilePhone');
    $scope.HomePhone = $window.sessionStorage.getItem('HomePhone');
    $scope.EnrollType = $window.sessionStorage.getItem('EnrollType');
		$scope.PrivateKey = $window.sessionStorage.getItem('PrivateKey');
    $scope.Ssn = $window.sessionStorage.getItem('Ssn');
    $scope.Dob = $window.sessionStorage.getItem('DateOfBirth');
    $scope.Pob = $window.sessionStorage.getItem('PlaceOfBirth');

  }
  $scope.init();

  $scope.updatePatient = function(){
    $scope.savePatientDetails ={
      InvitationCode : $scope.InvitationCode,
      PatientID : $scope.PatientID,
      FirstName : $scope.FirstName,
      LastName : $scope.LastName,
      Ssn : $scope.Ssn,
      // ConsentTo : $scope.Consent,
      DateOfBirth : $scope.Dob,
      PlaceOfBirth : $scope.Pob,
      EmailID : $scope.EmailID,
      MobilePhone : $scope.MobilePhone,
      HomePhone : $scope.HomePhone,
      EnrollType : $scope.EnrollType,
      PrivateKey : $scope.PrivateKey,
      OrgName : 'Org1'
    }

    var url = "/api/v1/update_user/" + "updateUser";
	 	customInterceptor.postrequestwithtoken(url,$scope.savePatientDetails).then(function successCallback(response){
      $window.alert('Successfully updated patient detail');  
      $scope.result = response.data;
    });
  }

});