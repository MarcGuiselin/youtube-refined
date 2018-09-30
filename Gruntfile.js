module.exports = function(grunt) {

    //console.warn('Make sure you are using V3.4 of sass! Not higher!', 'gem uninstall -Iax sass', 'gem install sass -v 3.4');

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // Tasks
        sass: { // Begin Sass Plugin
            options: {
                sourcemap: 'none'
            },
            dist: {
                files: {
                    'code/css/common/vue-components.css':   'sass/common/vue-components.sass',
                    'code/css/themes/dark.css':             'sass/themes/dark.sass',
                    'code/css/themes/fade.css':             'sass/themes/fade.sass',
                    'code/css/content.css':                 'sass/content.sass',
                    // 'code/css/popup.css':                   'sass/popup.sass',
                    'code/css/options.css':                 'sass/options.sass',
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
        },



        clean: {
            build: ['build/']
        },

        copy: {
            'code-to-build': {
                expand: true,
                cwd: 'code',
                src: ['**/*.*'],
                dest: 'build/'
            }
        },

        obfuscator: {
            options: {
                banner: `// ============================\n// Copyright ${new Date().getFullYear()} Marc Guiselin\n// ============================\n\n`,
                compact: true,
                //identifierNamesGenerator: 'mangled',
                rotateStringArray: true,
                stringArray: true,
                target: 'browser',

                renameGlobals: true
            },
            default: {
                options: {
                    stringArray: true
                },
                files: {
                    'build/scripts/background.js': 'code/scripts/background.js',
                    'build/scripts/options.js': 'code/scripts/options.js',
                    'build/scripts/update-notification.js': 'code/scripts/update-notification.js',

                    'build/scripts/content/share.js': 'code/scripts/content/share.js',
                    'build/scripts/content/website.js': 'code/scripts/content/website.js',
                    'build/scripts/content/youtube.js': 'code/scripts/content/youtube.js',

                    'build/scripts/common/vue-components.js': 'code/scripts/common/vue-components.js'
                }
            },
            misc: {
                options: {
                    stringArray: false
                },
                files: {
                    'build/scripts/common/tags.js': 'code/scripts/common/tags.js'
                }
            }
        },
    });

    // Load Grunt plugins
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-obfuscator');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');

    // Default task(s).
    grunt.registerTask('default', ['sass', 'watch']);
    grunt.registerTask('build',   ['sass', 'clean', 'copy', 'obfuscator']);
};