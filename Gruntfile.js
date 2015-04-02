module.exports = function(grunt) {
	grunt.initConfig({
		concat: {
			options: {
				separator: ';'
			},
			scripts: {
				src: [
					'client/js/common/*.js',
					'client/js/game-objects/board.js',
					'client/js/game-objects/pellet.js',
					'client/js/game-objects/snake-part.js',
					'client/js/game-objects/snake-head.js',
					'client/js/game-objects/snake.js',
					'client/js/*.js'
				],
				dest: 'public/all.js'
			},
			index: {
				src: [
					'client/index.html'
				],
				dest: 'public/index.html'
			}
		},
		watch: {
			scripts: {
				files: ['client/**/*.*'],
				tasks: ['client'],
				options: {
					debounceDelay: 5000
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.registerTask('default', ['concat']);
	grunt.registerTask('client', ['concat']);
};
