hcControllers.controller('LoginCtrl', function ($scope, customInterceptor,$state, $window) {

	$scope.init = function(){
		$scope.showLogin = true;
		$scope.showRegister = false;
		$scope.selector = false;
	}

	$scope.init();

	$scope.showRegisterScreen = function(){
		$scope.showRegister = true;
		$scope.showLogin = false;
	}

	$scope.showLoginScreen = function(){
		$scope.showRegister = false;
		$scope.showLogin = true;
	}

	$scope.loginUser = function(){
		var url = '';
		if($scope.selector){
			url = "/api/v1/get_user_withoutInvitationCode/" + $scope.registeredEmail + '/' + $scope.registeredPwd + '/' + 'provider' + '/' + 'Org2' + '/' + 'queryUserpasswd';
		}
		else{
			url = "/api/v1/get_user_withoutInvitationCode/" + $scope.registeredEmail + '/' + $scope.registeredPwd + '/' + 'patient' + '/' + 'Org1' + '/' + 'queryUserpasswd';
		}
		$window.alert("BPS: call " +url);

	 	customInterceptor.getrequestwithouttoken(url).then(function successCallback(response)
	 	{
			 $scope.result = response.data;
			 if($scope.result[0].Record != null){
				$window.sessionStorage.setItem('FirstName', $scope.result[0].Record.FirstName === undefined ? '':$scope.result[0].Record.FirstName);
				$window.sessionStorage.setItem('LastName', $scope.result[0].Record.LastName === undefined ? '':$scope.result[0].Record.LastName);
				$window.sessionStorage.setItem('EmailID', $scope.result[0].Record.EmailID === undefined ? '':$scope.result[0].Record.EmailID);
				$window.sessionStorage.setItem('PrivateKey', $scope.result[0].Record.PrivateKey === undefined ? '':$scope.result[0].Record.PrivateKey);
				$window.sessionStorage.setItem('MobilePhone', $scope.result[0].Record.MobilePhone === undefined ? '':$scope.result[0].Record.MobilePhone);
				$window.sessionStorage.setItem('HomePhone', $scope.result[0].Record.HomePhone === undefined ? '':$scope.result[0].Record.HomePhone);
				$window.sessionStorage.setItem('EnrollType', $scope.result[0].Record.EnrollType === undefined ? '':$scope.result[0].Record.EnrollType);
				$window.sessionStorage.setItem('InvitationCode', $scope.result[0].Record.InvitationCode === undefined ? '':$scope.result[0].Record.InvitationCode);
				$window.sessionStorage.setItem('HomePhone', $scope.result[0].Record.HomePhone === undefined ? '':$scope.result[0].Record.HomePhone);
				$window.sessionStorage.setItem('Ssn', $scope.result[0].Record.Ssn === undefined ? '':$scope.result[0].Record.Ssn);
			 }
			 if($scope.result[0].Record.EnrollType === 'patient'){
				$window.sessionStorage.setItem('PatientID', $scope.result[0].Record.PatientID === undefined ? '':$scope.result[0].Record.PatientID);
				$window.sessionStorage.setItem('DateOfBirth', $scope.result[0].Record.DateOfBirth === undefined ? '':$scope.result[0].Record.DateOfBirth);
				$window.sessionStorage.setItem('PlaceOfBirth', $scope.result[0].Record.PlaceOfBirth === undefined ? '':$scope.result[0].Record.PlaceOfBirth);
				$state.go("home.patientDetail")
			 }
			 else{
				$window.sessionStorage.setItem('PhysicianID', $scope.result[0].Record.PhysicianID === undefined ? '':$scope.result[0].Record.PhysicianID);
				$window.sessionStorage.setItem('Gender', $scope.result[0].Record.Gender === undefined ? '':$scope.result[0].Record.Gender);
				$window.sessionStorage.setItem('StreetAddress1', $scope.result[0].Record.StreetAddress1 === undefined ? '':$scope.result[0].Record.StreetAddress1);
				$window.sessionStorage.setItem('City', $scope.result[0].Record.City === undefined ? '':$scope.result[0].Record.City);
				$window.sessionStorage.setItem('State', $scope.result[0].Record.State === undefined ? '':$scope.result[0].Record.State);
				$window.sessionStorage.setItem('Country', $scope.result[0].Record.Country === undefined ? '':$scope.result[0].Record.Country);
				$window.sessionStorage.setItem('Zipcode', $scope.result[0].Record.Zipcode === undefined ? '':$scope.result[0].Record.Zipcode);
				$state.go("home.providerDetail")
			 }

		}, function erroCallback(response){
			$window.alert("You have entered wrong Email-ID or Password or Patient-Physician button!");
		});
	}

	$scope.registerUser = function(){

		if($scope.selector){
			$scope.saveUserDetails = {
				FirstName: $scope.firstName,
				LastName: $scope.lastName,
				EmailID: $scope.email,
				PrivateKey:$scope.pwd,
				MobilePhone: $scope.contact,
				EnrollType: "provider",
				PhysicianID: $scope.physicianID,
				OrgType:"Org2"
			}

			var url = "/api/v1/enroll_Users";
	 	customInterceptor.postrequestwithouttoken(url,$scope.saveUserDetails).then(function successCallback(response)
	 	{
			 $scope.result = response.data;
			 if($scope.result.tx_id.success){
				 $window.alert("Successfully registered the user.");
			 }
			 else{
				$window.alert("Record already exist!");
			 }
		});
		}
		else{
			var url = "/api/v1/get_all_usersCount/Org1/queryUserCount";
			customInterceptor.getrequestwithouttoken(url).then(function successCallback(response)
	 	    {
				$scope.count = response.data;
				$scope.count = parseInt($scope.count) + 1;
				$scope.patientId = 'PTNT'+$scope.count;

				$scope.saveUserDetails = {
					PatientID: $scope.patientId,
					FirstName: $scope.firstName,
					LastName: $scope.lastName,
					EmailID: $scope.email,
					PrivateKey:$scope.pwd,
					MobilePhone: $scope.contact,
					EnrollType: "patient",
					OrgType:"Org1"
				}

				var url = "/api/v1/enroll_Users";
	 	customInterceptor.postrequestwithouttoken(url,$scope.saveUserDetails).then(function successCallback(response)
	 	{
			 $scope.result = response.data;
			 if($scope.result.tx_id.success){
				 $window.alert("Successfully registered the user.");
			 }
			 else{
				$window.alert("Record already exist!");
			 }
		});
			});



		}


	}

});
