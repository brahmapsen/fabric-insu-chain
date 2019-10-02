hcControllers.controller('homeCtrl', function ($scope, $rootScope, $location, $window, $stateParams, $state, $window) {

	// used in side header
	//$scope.currentSate = $state.current.name;
	//$scope.Id=$stateParams.Id;
	$scope.enrollType = $window.sessionStorage.getItem('EnrollType');
	$scope.firstName = $window.sessionStorage.getItem('FirstName');
	$scope.lastName = $window.sessionStorage.getItem('LastName');

	$scope.init = function(){
		//console.log('In Home');
        // $scope.term = langTranslateService.getLangData($rootScope.selectedRadio,'home');
	}

	$scope.redirect = function (val, e, event) {
		switch (val) {
			case 0:
				if (e == 'home.patientDetail') {
					$state.go('home.patientDetail');
					return;
				}
				break;
			case 1:
				if (e == 'home.contract') {
					// $window.alert('going to patient contract ');
					$state.go('home.contract');
					return;
				}
				break;
			case 2:
				if (e == 'home.providerDetail') {
					$state.go('home.providerDetail');
					return;
				}
				break;
			case 3:
			    if (e == 'home.providerContract') {
				    $state.go('home.providerContract');
				    return;
			    }
			break;
			case 4:
			    if (e == 'home.renderService') {
				    $state.go('home.renderService');
				    return;
			    }
			break;

		}

	}

	// $scope.showconfirmbox = function () {
	// 	if ($window.confirm("Do you want to continue?"))
	// 		$scope.result = "Yes";
	// 	else
	// 		$scope.result = "No";
	// }

	$scope.logout = function () {
		$state.go('login');
	}

	$scope.init();

});
