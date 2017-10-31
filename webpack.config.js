const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');

const ExtractTextPlugin = require("extract-text-webpack-plugin");
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const extractSass = new ExtractTextPlugin({
    filename: "[name].css",
    disable: process.env.NODE_ENV === "dev"
});

const addProductionPlugins = plugins_arr => {
	if (process.env.NODE_ENV === 'prod') {
		return plugins_arr.concat([
			new webpack.optimize.UglifyJsPlugin({
				compress: {
					drop_console: true,
					dead_code: true
				},
				output: {
					comments: false
				},
				sourceMap: true
			})
		])
	} else {
		return plugins_arr
	}
}

const addDevPlugins = plugins_arr => {
	if (process.env.NODE_ENV === 'dev') {
		return plugins_arr.concat([
			new webpack.HotModuleReplacementPlugin(),
		])
	} else {
		return plugins_arr
	}
}


module.exports = {
	entry: {
		'cltvo-v-list-filters': './src/list-filters.js'
	},

	externals: process.env.NODE_ENV === 'prod' ? ['vue','ramda', 'lodash.debounce', 'coral-std-library'] : [],

	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'dist'),
		publicPath: 'dist/', //importante para que funcione el HMR
		library: 'mylib',
		libraryTarget: 'umd'
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
				test: /\.html/,
				loader: 'html-loader',
				options: {
					attrs: false,
				}
			},
			{
				test: /\.scss$/,
				use: extractSass.extract({
				               use: [{
				                   loader: "raw-loader"
				                   // loader: "css-loader?url=false"//for sourcemaps
				               }, 
				               {
				                   loader: "postcss-loader"
				               },
				               {
				                   loader: "sass-loader",
				               }],
				               // use style-loader in development
				               fallback: "style-loader"
				           })
			},
			{
			    test: /\.vue$/,
			    loader: 'vue-loader',
		    	options: {
        	    	loaders: {
										html: 'pug-loader',
            	    	scss: 'vue-style-loader!css-loader!sass-loader'
               		}
               	},
			},
			{
				test: /\.purs$/,
				use: [
					{
						loader: 'purs-loader',
						options: {
							src: [
							'./purescript/bower_components/purescript-*/src/**/*.purs',
							'./purescript/src/**/*.purs'
							],
							bundle: false,
							psc: 'psa',
							// watch: isWebpackDevServer || isWatch,
							watch: true,
							pscIde: false
						}
					}
				]
			}
		]
	},
	resolve: {
		alias: {
		  vue$: 'vue/dist/vue.common.js',
		}
	},
	plugins: addDevPlugins(addProductionPlugins([
		extractSass,
		new webpack.NamedModulesPlugin(),
		new webpack.LoaderOptionsPlugin({
		    options: {
		      postcss: [
		        autoprefixer({
			      browsers: ['last 5 versions', '> 5%']
			    }),
		      ]
		     }
		  }),
		 new OptimizeCssAssetsPlugin()
	])),
	devtool: "source-map",
	devServer: {
		publicPath: "/dist/",
		hot: true,
	},
};