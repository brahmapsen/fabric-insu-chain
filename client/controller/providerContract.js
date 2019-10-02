hcControllers.controller('providerContractCtrl', function ($scope, customInterceptor, $state, $window, $rootScope) {

	$scope.init = function () {
		$scope.contractList = [];
		$scope.PhysicianID = $window.sessionStorage.getItem('PhysicianID');
		$scope.showPatient = false;
		
		var url = "/api/v1/get_all_Contract/queryAllContract";
		customInterceptor.getrequestwithtoken(url).then(function successCallback(response){
			//$window.alert('Successfully updated patient detail');  
			$scope.result = response.data;
			if($scope.result.length > 0){
				for(let i=0;i<$scope.result.length;i++){
					if($scope.PhysicianID === $scope.result[i].Record.PhysicianID){
						$scope.contractList.push($scope.result[i].Record)
					}
				}
				
			}
		});

		var url = "/api/v1/get_all_users/" + "queryAllUser";
		customInterceptor.getrequestwithtoken(url).then(function successCallback(response){ 
			$scope.patientDetails = response.data;
		});
	}

	$scope.init();

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

		var url = "/api/v1/update_Contract/" + "updateContract";
		customInterceptor.postrequestwithtoken(url,$scope.contractDetailList).then(function successCallback(response){
		    $window.alert('Successfully updated the contract');  
		 	$scope.result = response.data;
	   });
	}

	$scope.showPatientDetail = function(patientId,recordStatus){

		$scope.patientDetail = [];
		if(recordStatus === "true"){
			$scope.patientDetail = $scope.patientDetails.filter(patient => patient.Record.PatientID === patientId);
			$scope.showPatient = true;
		}
		else{
			$window.alert('You are not authorize to see patient details!!!');
		}
		
	}
  
  });