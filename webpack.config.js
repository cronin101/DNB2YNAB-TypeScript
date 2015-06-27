module.exports = {
  entry: './source/app.ts',
  
  resolve: {
      extensions: ['', '.ts', '.webpack.js', '.web.js', '.js']
    },
    
  output: {
    path: './target',
    filename: 'bundle.js'
  },
  
  module: {
    loaders: [
      {   
        test: /\.ts$/,
        loader: 'awesome-typescript-loader'
      }
    ]
  }
};
