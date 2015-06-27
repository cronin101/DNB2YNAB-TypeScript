module.exports = {
	entry: './source/app.ts',
	
	resolve: {
    	extensions: ['', '.ts', '.webpack.js', '.web.js', '.js']
  	},
	  
	output: {
		path: './target',
		filename: 'bundle.js'
	},
	
	devtool: 'eval-source-map', //init compile fast, recompile also very fast
	
	module: {
		loaders: [
			{ 	
				test: /\.ts$/,
				loader: 'awesome-typescript-loader'
			}
		]
	}
};
