(function () {

	'use strict';


	angular.module('user').factory('userService', userService);

	
	userService.$inject = ['$q', '$firebaseObject', '$firebaseArray', '$firebaseAuthService', '$firebaseRef', '$state', 'APP_CONFIG', 'adminService'];

	
	function userService ($q, $firebaseObject, $firebaseArray, $firebaseAuthService, $firebaseRef, $state, APP_CONFIG, adminService) {

		const auth = $firebaseAuthService;
		let users = $firebaseArray($firebaseRef.users);
		let usersPublic = $firebaseArray($firebaseRef.public);

		auth.$onAuth((newData) => {

			if (newData) {

				if ($state.current.name === 'login' || $state.current.name === 'register') {

					$state.go('app.dashboard');
				}
				
			} else {
				
				$state.go('login');
			}		
		});


		function getUser (uid) {

			return users.$loaded()
			.then((ref) => {

				return ref.$getRecord(uid);
			})
		}


		function getUserMatchBets (uid) {

			let matchesRef = new Firebase(APP_CONFIG.fbUrl + 'users/' + uid + '/bets/matches')

			let matches = $firebaseArray(matchesRef);

			if (matches) {

				return matches.$loaded();

			} else {

				let error = ("Nem sikerült betölteni a meccseket");

				return $q.reject(error);
			}
		}


		function getUserList () {

			return users.$loaded();
		}


		function login (credentials) {

			return auth.$authWithPassword(credentials);
		}


		function logout () {

			auth.$unauth();
		}


		function register (credentials) {

			let newUid, pending, pendingList;

			return adminService.getPendingList()
			.then((list) => {

				pendingList = list;

				pending = list.find((item) => {

					return item.email === credentials.email;
				});

				if (!find) {

					let error = new Error ('Ezzel az emailcímmel nem regisztrálhatsz.')

					return $q.reject(error);
				
				} else {

					return auth.$createUser(credentials)
				}
			})
			.then((data) => {

				newUid = data.uid;

				return auth.$authWithPassword(credentials);
			})
			.then(() => {

				pendingList.$remove(pending);

				let userObject = $firebaseObject($firebaseRef.users);

				return userObject.$loaded();
			})
			.then((userObj) => {

				let date = new Date();

				let newUser = {
					email: credentials.email,
					createdAt: date.getTime(),
					admin: false,
					uid: newUid,
					league: [pending.league]
				};

				userObj[newUid] = newUser;

				return userObj.$save();
			})
			.then((resp) => {

				return usersPublic.$loaded();
			})
			.then((publicData) => {

				return publicData.$add({
					uid: newUid,
					league: [pending.league],
					score: 0
				});
			})
		}


		function saveUser (user) {

			return users.$save(user)
			.then((ref) => {

				return usersPublic.$loaded();
			})
			.then((publicData) => {

				let found = publicData.find((item) => {

					return item.uid === user.uid;
				});

				if (!found) {

					return publicData.$add({
						name: user.name || null, 
						uid: user.uid,
						score: user.totalScore || 0,
						league: user.league
					});
				
				} else {

					found.name = user.name || null;
					found.score = user.totalScore || 0;
					found.league = user.league;

					return publicData.$save(found);
				} 

			});
		}


		function removeUser (cred, user) {

			return users.$remove(user)
			.then(() => {

				return usersPublic.$loaded();
			})
			.then((publicArray) => {

				let found = publicArray.find((item) => {

					return item.uid === user.uid;
				})

				return publicArray.$remove(found);
			})
			.then(() => {

				return auth.$removeUser(cred);
			});
		}


		return {
			public: usersPublic,
			login: login,
			logout: logout,
			register: register,
			getUser: getUser,
			getUserMatchBets: getUserMatchBets,
			saveUser: saveUser,
			removeUser: removeUser,
			getUserList: getUserList
		};
	}

})();