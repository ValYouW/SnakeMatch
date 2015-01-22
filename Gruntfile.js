module.exports = function(grunt) {
	grunt.initConfig({
		concat: {
			options: {
				separator: ';'
			},
			dist: {
				src: ['client/js/*.js'],
				dest: 'public/all.js'
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');

	grunt.registerTask('client', ['concat']);
};