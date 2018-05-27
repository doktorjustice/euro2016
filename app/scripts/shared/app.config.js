(function () {

  'use strict';

  angular
  .module('appCore')
  .constant('APP_CONFIG', {

    // Firebase ref url
    fbUrl: 'https://world-cup-2018-9f6f6.firebaseio.com/', 

    // Closing time before match start in ms
    timeLimit: 300000, 

    // Data fields for match upload
    matchFields: ['group', 'datetime', 'home', 'away'], 
    
    //Points rewarded for bets
    rules: { 
      result: 1,
      exactResult: 1,
      finalWinner: 3,
      topScorer: 3
    },

    //Eligible competitions
    leagues: ['KBC', 'Somi', 'Norbi'],

    //Starting time: 2018.06.14. 17:00
    startTime: 1528988400000,

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
      public: APP_CONFIG.fbUrl + 'public',
      tournament: APP_CONFIG.fbUrl + 'tournament',
      teams: APP_CONFIG.fbUrl + 'tournament/teams',
      matches: APP_CONFIG.fbUrl + 'tournament/matches',
      players: APP_CONFIG.fbUrl + 'tournament/players',
      admin: APP_CONFIG.fbUrl + 'admin',
      pending: APP_CONFIG.fbUrl + 'admin/pending',
      promo: APP_CONFIG.fbUrl + 'promo'
    });
  }

  // ROUTING

  appRouting.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider'];
  
  function appRouting($stateProvider, $urlRouterProvider, $locationProvider) {

    
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
          });
        }
      }
    })
    .state('app.dashboard', {
      url: '/dashboard',
      templateUrl: 'views/dashboard.html',
      controller: 'DashboardController',
      controllerAs: 'dashboard',
      params: {
        temporary: false
      }
    })
    .state('app.myBets', {
      url: '/mybets',
      templateUrl: 'views/bets.html',
      controller: 'BetsController',
      controllerAs: 'bets',
      params: {
        filter: true
      }
    })
    .state('app.rules', {
      url: '/rules',
      templateUrl: 'views/rules.html',
    })
    .state('app.contact', {
      url: '/contact',
      templateUrl: 'views/contact.html',
    });
  }


  stateWatchers.$inject = ['$rootScope', '$state'];

  function stateWatchers ($rootScope, $state) {

    $rootScope.$on("$stateChangeError", function (event, toState, toParams, fromState, fromParams, error) {

      if (error === "AUTH_REQUIRED") {

        $state.go("login");
        
        } else {

          console.error(error);
        }
    });
  }

})();