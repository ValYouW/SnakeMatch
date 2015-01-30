module.exports = function(grunt) {
	grunt.initConfig({
		concat: {
			options: {
				separator: ';'
			},
			dist: {
				src: [
					'client/js/common/*.js',
					'client/js/game-objects/board.js',
					'client/js/game-objects/pellet.js',
					'client/js/game-objects/snake-part.js',
					'client/js/game-objects/snake-head.js',
					'client/js/game-objects/snake-body.js',
					'client/js/*.js'
				],
				dest: 'public/all.js'
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.registerTask('default', ['concat']);
	grunt.registerTask('client', ['concat']);
};
