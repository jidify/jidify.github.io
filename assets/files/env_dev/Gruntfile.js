module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-connect-proxy');

    // Print a timestamp (useful for when watching)
    grunt.registerTask('timestamp', function() {
        grunt.log.subhead(Date());
    });

    var proxySnippet = require('grunt-connect-proxy/lib/utils').proxyRequest;
    var mountFolder = function (connect, dir) {
        return connect.static(require('path').resolve(dir));
    };

    grunt.initConfig({
        distdir: 'dist',
        pkg: grunt.file.readJSON('package.json'),

        src: {
            js: ['src/**/app.js', 'src/**/*.mod.js', 'src/**/*.srv.js', 'src/**/*.ctrl.js'],
            specs: ['test/**/*.spec.js'],
            html: ['src/app.html'],
            tpl: ['partials/*.tpl.html'],
            privateTpl: ['*.tpl.html'],
            css: ['src/style/**/*.css']
        },

        clean: ['<%= distdir %>/*'],

        copy: {
            main: {
                files: [
                    // copy html templates
                    {expand: true, src: ['<%= src.tpl %>'], dest: '<%= distdir %>/static/', cwd: 'src/'},

                    // copy html private templates
                    {expand: true, src: ['<%= src.privateTpl %>'], dest: '<%= distdir %>/static/private/partials', cwd: 'src/partials/private/'},

                    //  copy jquery
                    {expand: true, src: ['jquery.js'], dest: '<%= distdir %>/static/', cwd: 'vendor/jquery/dist/'},

                    //  copy images
                    {expand: true, src: ['**/*.png'], dest: '<%= distdir %>/static/', cwd: 'src/'},

                    //  copy fonts
                    {expand: true, src: ['**/*.*'], dest: '<%= distdir %>/fonts', cwd: 'src/fonts'}

                ]
            }
        },

        concat:{
            dist:{
                options: {
                    banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */',
                    sourceMap : true
                },
                src:['<%= src.js %>'],
                dest:'<%= distdir %>/<%= pkg.name %>.js'
            },
            css : {
                options : {
                    banner : '/* Bootstrap CSS */\n',
                    stripBanners : {
                        block : true
                    }
                },
                src:['<%= src.css %>'],
                dest:'<%= distdir %>/static/<%= pkg.name %>.css'
            },
            index:{
                options: {
                    process : true
                },
                src:['<%= src.html %>'],
                dest:'<%= distdir %>/index.html'
            },
            angular: {
                src:['vendor/angular/angular.js',
                    'vendor/angular-resource/angular-resource.js',
                    'vendor/angular-route/angular-route.js',
                    'vendor/angular-cookies/angular-cookies.js',
                    'vendor/angular-ui-bootstrap-bower/ui-bootstrap-tpls.js',
                    'vendor/angular-http-auth/src/http-auth-interceptor.js'],
                dest:'<%= distdir %>/static/angular.js'
            },
            theme: {
                src:['theme/**/*.js'],
                dest:'<%= distdir %>/static/theme.js'

            }
        },

        connect: {
            server: {
                options: {
                    port: 9001,
                    hostname: 'localhost',
                    keepalive: false, // to let watch running
                    livereload: 35729,
                    middleware: function (connect, options) {
                        if (!Array.isArray(options.base)) {
                            options.base = [options.base];
                        }

                        // Setup the proxy
                        var middlewares = [require('grunt-connect-proxy/lib/utils').proxyRequest];

                        // Serve static files.
                        options.base.forEach(function(base) {
                            middlewares.push(connect.static(base));
                        });

                        // Make directory browse-able.
                        var directory = options.directory || options.base[options.base.length - 1];
                        middlewares.push(connect.directory(directory));

                        return middlewares;
                    }
                },
                proxies: [
                    {
                        context: '/api/',
                        host: 'localhost',
                        port: 8080
                        // changeOrigin: true // seems to be unsupported since v1.11
                    },
                    {
                        context: '/static/private/',
                        host: 'localhost',
                        port: 8080
                        // changeOrigin: true // seems to be unsupported since v1.11
                    }
                ]
            }
        },

        karma: {
            unit: {
                configFile: 'test/config/karma.conf.js',
                background: true
            }
        },

        watch: {
            all: {
                files: ['gruntfile.js',
                        'test/config/karma.conf.js',
                        '<%= src.js %>',
                        '<%= src.specs %>',
                        '<%= src.html %>',
                        'src/<%= src.tpl %>',
                        'src/partials/private/<%= src.privateTpl %>',
                        '<%= src.css %>'],
                tasks: ['timestamp', 'build', 'test'],
                options: {
                    //reload: true // ATTENTION : disable livereload (probably because watch task itself is being restarted) !!
                    livereload: 35729
                }
            }
        }

    });

    grunt.registerTask('build', ['clean','copy','concat']);
    grunt.registerTask('serve', ['connect:server']);
    grunt.registerTask('dev', ['build', 'configureProxies:server', 'serve', 'watch']);
    grunt.registerTask('test', ['karma:unit:run']);

    grunt.registerTask('default', ['build', 'configureProxies:server', 'serve']);

};