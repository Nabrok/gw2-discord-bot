var webpack = require('webpack');

module.exports = {
	entry: './features/web/client/index.js',
	output: {
		path: './features/web/public',
		filename: 'bundle.js',
		publicPath: ''
	},
	plugins: process.env.NODE_ENV === 'production' ? [
		new webpack.ExtendedAPIPlugin(),
		new webpack.DefinePlugin({
			'process.env': { 'NODE_ENV': JSON.stringify('production') }
		}),
		new webpack.optimize.DedupePlugin(),
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.optimize.UglifyJsPlugin()
	] : [
		new webpack.ExtendedAPIPlugin()
	],
	module: {
		loaders: [
			{ test: /\.jsx?/, exclude: /node_modules/, loader: 'babel-loader?presets[]=es2015&presets[]=react' }
		]
	}
};
