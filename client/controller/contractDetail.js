hcControllers.controller('contractDetailCtrl', function ($scope, customInterceptor, $state, $window, $rootScope) {

	$scope.init = function () {
      $scope.contractList = [];
	  $scope.PatientID = $window.sessionStorage.getItem('PatientID');
	  
	  var url = "/api/v1/get_all_Contract/queryAllContract";
	  customInterceptor.getrequestwithtoken(url).then(function successCallback(response){
		//$window.alert('Successfully updated patient detail');  
		$scope.result = response.data;
		if($scope.result.length > 0){
			for(let i=0;i<$scope.result.length;i++){
				if($scope.PatientID === $scope.result[i].Record.PatientID){
					$scope.contractList.push($scope.result[i].Record)
				}
			}
		}
		

	  });
  
	}
	$scope.init();
  
	$scope.createContract = function(){

		if($scope.contractList !== null && $scope.contractList.length > 0){
			var count = $scope.contractList.length;
			// if(count > 9){
			// 	count = parseInt(count) + 1;
			// 	$scope.contractID = "CNTR" + count;
			// }
			// else{
				count = parseInt(count) + 1;
				$scope.contractID = "CNTR" + count;
			// }
		}
		else{
			$scope.contractID = "CNTR1";
		}

		$scope.date = new Date();
		$scope.contractStatus = "OPEN";

	  $scope.savePatientDetails ={
		ContractID : $scope.contractID,
		PatientID : $scope.PatientID,
		Date : $scope.date,
		ChargeAmount : '',
		ChargeUnit : '',
		ActionStatus : '',
		AuthorizeContract : '',
		ContractStatus : $scope.contractStatus
	  }

	  $scope.contractList.push($scope.savePatientDetails);
	}

	$scope.saveContract = function(data){
		$scope.contractDetail = data;

		$scope.contractDetailList = {
			ContractID : $scope.contractDetail.ContractID,
			PatientID : $scope.contractDetail.PatientID,
			CareCode : $scope.contractDetail.CareCode,
			PhysicianID : $scope.contractDetail.PhysicianID,
			ContractStatus : $scope.contractDetail.ContractStatus,
			ChargeAmount : $scope.contractDetail.ChargeAmount,
			ChargeUnit : $scope.contractDetail.ChargeUnit,
			ActionStatus : $scope.contractDetail.ActionStatus,
			AuthorizeContract : $scope.contractDetail.AuthorizeContract,
		}

		if($scope.contractDetail.AuthorizeContract === "" || $scope.contractDetail.CareCode === undefined || $scope.contractDetail.PhysicianID === undefined){
			$window.alert('Care Code, Physician Name and Authorize Medical Record should not be blank');
		}
		else{
			var url = "/api/v1/register_new_Contract/" + "recordNewContract";
			customInterceptor.postrequestwithtoken(url,$scope.contractDetailList).then(function successCallback(response){
					$window.alert('Successfully registered the contract');  
				 $scope.result = response.data;
			 });
		}
	}
});