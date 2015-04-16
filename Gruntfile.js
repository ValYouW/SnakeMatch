module.exports = function(grunt) {
	grunt.initConfig({
		concat: {
			options: {
				separator: ';'
			},
			scripts: {
				src: [
					'client/js/lib/*.js',
					'server/game/protocol.js',
					'client/js/game-objects/board.js',
					'client/js/game-objects/pellet.js',
					'client/js/game-objects/snake-part.js',
					'client/js/game-objects/snake-head.js',
					'client/js/game-objects/snake.js',
					'client/js/*.js'
				],
				dest: 'client/deploy/all.js'
			},
			index: {
				src: [
					'client/index.html'
				],
				dest: 'client/deploy/index.html'
			}
		},
		watch: {
			scripts: {
				files: ['client/**/*.*', '!client/deploy/**/*.*', 'server/game/protocol.js'],
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
