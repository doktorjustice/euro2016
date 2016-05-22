(function () {

	'use strict';

	angular
	.module('appCore')
	.constant('APP_CONFIG', {
		fbUrl: 'https://kbceuro2016.firebaseio.com/', // Firebase ref url
		timeLimit: 300000, // Closing time before match start in ms
		matchFields: ['group', 'datetime', 'home', 'away'], // Data fields for match upload
		rules: { //Points rewarded for right bets
			result: 1,
			exactResult: 1,
			finalWinner: 3,
			topScorer: 3
		}
	})
	.config(appRouting)
	.config(firebase)
	.run(stateWatchers);


	// FIREBASE

	firebase.$inject = ['$firebaseRefProvider', 'APP_CONFIG'];

	function firebase ($firebaseRefProvider, APP_CONFIG) {

		$firebaseRefProvider.registerUrl({
			default: APP_CONFIG.fbUrl,
			users: APP_CONFIG.fbUrl + 'users',
			tournament: APP_CONFIG.fbUrl + 'tournament',
			teams: APP_CONFIG.fbUrl + 'tournament/teams',
			matches: APP_CONFIG.fbUrl + 'tournament/matches',
			players: APP_CONFIG.fbUrl + 'tournament/players'
		});
	}

	// ROUTING

	appRouting.$inject = ['$stateProvider', '$urlRouterProvider'];
	
	function appRouting($stateProvider, $urlRouterProvider) {

		$urlRouterProvider.otherwise('/dashboard');

		$stateProvider
		.state('app', {
			abstract: true,
			url: '',
			views: {
				navigation: {
					templateUrl: 'views/navigation.html',
					controller: 'NavigationController',
					controllerAs: 'navigation'
				},
				content: {
					template: '<ui-view></ui-view>'
				}
			},
			resolve: {
				user: ($firebaseAuthService, userService) => {

					return $firebaseAuthService.$requireAuth()
					.then((data) => {

						return userService.getUser(data.uid);
					})
				}
			}
		})
		.state('app.dashboard', {
			url: '/dashboard',
			templateUrl: 'views/dashboard.html',
			controller: 'DashboardController',
			controllerAs: 'dashboard'
		})
		.state('app.myBets', {
			url: '/mybets',
			templateUrl: 'views/bets.html',
			controller: 'BetsController',
			controllerAs: 'bets',
		});
	}


	stateWatchers.$inject = ['$rootScope', '$state'];

	function stateWatchers ($rootScope, $state) {

		$rootScope.$on("$stateChangeError", function (event, toState, toParams, fromState, fromParams, error) {

		 	if (error === "AUTH_REQUIRED") {

				$state.go("login");
				
		  	} else {

		  		toastr.error(error);
		  	}
		});
	}

})();