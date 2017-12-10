module.exports = function(grunt) {


    console.warn("Make sure you are using V3.4 of sass! Not higher!");

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // Tasks
        sass: { // Begin Sass Plugin
            options: {
                sourcemap: "none"
            },
            dist: {
                files: {
                    'code/css/common/vue-components.css':   'sass/common/vue-components.sass',
                    'code/css/themes/dark.css':             'sass/themes/dark.sass',
                    'code/css/themes/fade.css':             'sass/themes/fade.sass',
                    'code/css/content.css':                 'sass/content.sass',
                    'code/css/popup.css':                   'sass/popup.sass',
                    'code/css/update-notification.css':     'sass/update-notification.sass',

                    'tests/test.css': 'tests/test.sass'
                }
            }
        },

        watch: { // Compile everything into one task with Watch Plugin
            css: {
                files: '**/*.sass',
                tasks: ['sass']
            }
        }
    });

    // Load Grunt plugins
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Default task(s).
    grunt.registerTask('default', ['sass', 'watch']); //, 'watch'
};