hcControllers.controller('renderServiceCtrl', function ($scope, customInterceptor, $state, $window, $rootScope)
{
	$scope.init = function () {
		$scope.contractList = [];
		$scope.PhysicianID = $window.sessionStorage.getItem('PhysicianID');

		var url = "/api/v1/get_all_Contract/queryAllContract";
		customInterceptor.getrequestwithtoken(url).then(function successCallback(response){
			//$window.alert('renderService-init() - Successfully updated patient contract');
			$scope.result = response.data;
			if($scope.result.length > 0){
				for(let i=0;i<$scope.result.length;i++) {
					//$window.alert('renderService-init() - add to contractList');
					if($scope.PhysicianID === $scope.result[i].Record.PhysicianID){
						 $scope.contractList.push($scope.result[i].Record)
					}
				}
			}
		});
	}

	$scope.init();

	$scope.savePhyService = function(data){
		$scope.contractDetail = data;
		$scope.contractDetailList = {
			ContractID : $scope.contractDetail.ContractID,
			PatientID : $scope.contractDetail.PatientID,
			CareCode : $scope.contractDetail.CareCode,
			PhysicianID : $scope.contractDetail.PhysicianID,
			ContractStatus : $scope.contractDetail.ContractStatus,
			ActionStatus : $scope.contractDetail.ActionStatus,
			AuthorizeContract : $scope.contractDetail.AuthorizeContract,
		}
		var url = "/api/v1/update_Contract/" + "updateContract";
		customInterceptor.postrequestwithtoken(url,$scope.contractDetailList).then(function successCallback(response){
		    $window.alert('Successfully updated the contract');
		 	$scope.result = response.data;
	   });
	}

});
