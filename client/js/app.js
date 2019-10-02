var ifApp = angular.module('ifApp', ['ui.router','hcControllers']);

ifApp.run(['$rootScope', '$state', '$stateParams',
			function($rootScope, $state, $stateParams) {

				//Add references to $state and $stateParams to the $rootScope
				$rootScope.$state = $state;
				$rootScope.$stateParams = $stateParams;
			}
		])// all routing and state will be maintained here.
		.config(['$stateProvider', '$urlRouterProvider','$locationProvider',
			function($stateProvider, $urlRouterProvider,$locationProvider) {
			$locationProvider.html5Mode(true); //activate HTML5 Mode
			$urlRouterProvider.otherwise('/');
			$stateProvider.state("login", {
					url: "/",
					controller: 'LoginCtrl',
					templateUrl: '/view/login.html'
				})
			    .state("home", {
					url: "/home",
					controller: 'homeCtrl',
					templateUrl: '/view/home.html'
				})
				.state("home.patientDetail", {
					url: "/patient",
					controller: 'patientDetailCtrl',
					templateUrl: '/view/patientDetail.html'
				})
				.state("home.contract", {
					url: "/contract",
					controller: 'contractDetailCtrl',
					templateUrl: '/view/createContract.html'
				})
				.state("home.providerDetail", {
					url: "/physician",
					controller: 'providerDetailCtrl',
					templateUrl: '/view/providerDetail.html'
				})
				.state("home.providerContract", {
					url: "/contract",
					controller: 'providerContractCtrl',
					templateUrl: '/view/providerContract.html'
				})
				.state("home.renderService", {
					url: "/renderService",
					controller: 'renderServiceCtrl',
					templateUrl: '/view/renderService.html'
				})
			}
		]);
