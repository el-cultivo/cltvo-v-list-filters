const browsers = mode => mode !== 'all' ? ['PhantomJS']  : ['PhantomJS', 'Chrome','Firefox','Safari']
const reporters = mode => mode !== 'all' ? ['spec']  : ['spec', 'coverage-istanbul']

module.exports = function(config) {
    config.set({
        loggers: [{type: 'console', pattern: '%d{HH:mm:ss} %m'}],
        browsers: browsers(process.env.BROWSERS),
        // browsers: ['Chrome'],

        files: [
            './node_modules/jquery/dist/jquery.js',
            './specs/stubs/materialize.js',
            './specs/stubs/vue-html5-editor.js',
            './node_modules/phantomjs-polyfill/bind-polyfill.js',
            { pattern: 'test-context.js'}
        ],

        frameworks: ['jasmine-jquery', 'jasmine'],

        preprocessors: {
            'test-context.js': ['webpack', 'sourcemap']
        },

        // reporters: reporters(process.env.REPORTERS),

        coverageIstanbulReporter: {
            dir: 'coverage/',
            reports: ['text','html']
        },

        webpackMiddleware: {
            // webpack-dev-middleware configuration
            // i.e.
            noInfo: true,
            // and use stats to turn off verbose output
            stats: {
                // options i.e. 
                chunks: false
            }
        },
        webpack: {
            entry: {
                index: './src/example.js'
            },
            module: {
                rules: [
                    {
                        test: /\.js$/,
                        exclude: /node_modules\/(?!(coral-std-library)\/).*/,
                        use: {
                            loader: 'babel-loader?cacheDirectory',
                            options: {
                                presets: ['env']
                            }
                        }
                    },
                    {
                        test: /\.vue$/,
                        loader: 'vue-loader',
                        options: {
                            loaders: {
                                scss: 'vue-style-loader!css-loader!sass-loader'
                            }
                        },
                    },
                    {
                        enforce: 'post',
                        test: /\.js$/,
                        exclude: /(specs|node_modules|bower_components)\//,
                        loader: 'istanbul-instrumenter-loader'
                   } 
                ],
            },
            devtool: 'inline-source-map',
            watch: true
        }
    });
};