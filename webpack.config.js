var webpack = require('webpack');

module.exports = {
	entry: {
		app: './features/web/client/index.js',
		vendor: ['react', 'react-dom', 'flux', 'react-bootstrap', 'react-router', 'react-router-bootstrap', 'socket.io-client', 'superagent', 'jwt-decode', 'react-markdown']
	},
	output: {
		path: './features/web/public',
		filename: 'bundle.js',
		publicPath: ''
	},
	plugins: process.env.NODE_ENV === 'production' ? [
		new webpack.optimize.CommonsChunkPlugin("vendor", "vendor.bundle.js"),
		new webpack.ExtendedAPIPlugin(),
		new webpack.DefinePlugin({
			'process.env': { 'NODE_ENV': JSON.stringify('production') }
		}),
		new webpack.optimize.DedupePlugin(),
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.optimize.UglifyJsPlugin()
	] : [
		new webpack.optimize.CommonsChunkPlugin("vendor", "vendor.bundle.js"),
		new webpack.ExtendedAPIPlugin()
	],
	module: {
		loaders: [
			{ test: /\.jsx?/, exclude: /node_modules/, loader: 'babel-loader?presets[]=es2015&presets[]=react' },
			{ test: /\.json$/, loader: 'json' }
		]
	}
};
