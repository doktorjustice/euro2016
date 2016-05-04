(function () {

	'use strict';

	angular
		.module('user')
		.controller('LoginController', LoginController);


	LoginController.$inject = ['userService'];


	function LoginController (userService) {

		var vm = this;

		vm.user = userService;
	}

})();