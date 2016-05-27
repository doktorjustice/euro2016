(function () {

	'use strict';

	angular.module('appCore').factory('scoreService', scoreService);

	scoreService.$inject = ['$q', 'userService', 'APP_CONFIG'];

	function scoreService ($q, userService, APP_CONFIG) {

		let rules = APP_CONFIG.rules;

		return {
			updateUserScores: updateUserScores,
			sumUserScores: sumUserScores
		};


		function updateUserScores (match) {

			let promises = [];
			let currentUid = userService.getCurrentUser();	
			
			return userService.getUserList()
			.then((users) => {

				angular.forEach(users, (user) => {

					user.bets = user.bets || {};
					user.bets.matches = user.bets.matches || {};
							
					let bet = user.bets.matches[match.$id] || {};

					if (match.result) {

						bet.points = calculateScore(match.result, bet);
							
					} else {

						bet.points = null;
					}

					promises.push(userService.saveUser(user)); 
				});

				return $q.all(promises);
			});
		}


		function sumUserScores () {

			let sumPoints;

			return userService.getUserList()
			.then((users) => {

				let promises = [];

				users.forEach((user) => {

					let promise = userService.getUserMatchBets(user.uid);

					promises.push(promise);
				})

				return $q.all(promises);
			})
			.then((matchArrays) => {

				let scoreArray = matchArrays.map((matches) => {

					let score = matches.reduce((prev,cur) => {

						if (cur.points) {

							prev += cur.points;
						}

						return prev;

					}, 0)

					return score;
				})

				return scoreArray;
			})
		}



		function calculateScore (result, bet) {

			let score = 0;

			if (bet) {

				let matchWinner = decideWinner(result);
				let betWinner = decideWinner(bet);


				if (result.home === bet.home && result.away === bet.away) {

					score += rules.exactResult;
				
				}  

				if (matchWinner === betWinner) {

					score += rules.result;
				}
			}

			return score;
		}


		function decideWinner (result) {

			let winner;

			if (result.home > result.away) {

				winner = 'home';

			} else if (result.home < result.away) {

				winner = 'away';
			
			} else {

				winner = 'draw';
			} 

			return winner;
		}

	}

})();