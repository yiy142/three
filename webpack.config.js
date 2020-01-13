const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin');
module.exports = {
	mode: 'development',
	devtool: 'source-map',
	entry: ['babel-polyfill',__dirname + "/src/index.js"],//已多次提及的唯一入口文件
	output: {
		path: __dirname + "/build",//打包后的文件存放的地方
		filename: "index-bundle.js",//打包后输出文件的文件名
		globalObject: 'this'
	},
	
	devServer: {
		contentBase: path.join(__dirname, 'dist'),
		compress: true,
		host:'0.0.0.0',
		port: 3002
	},
	module: {

		exprContextCritical: false,
	
		rules: [
			{
				test: /(\.jsx|\.js)$/,
				use: {
					loader: "babel-loader",
				},
				exclude: /node_modules/
			},
			{
				test: /\.worker\.js$/, //以.worker.js结尾的文件将被worker-loader加载
				use: { loader: 'worker-loader' }
			},
			{
				test: /\.css$/,
				use: [{
					loader: "style-loader"
				}, {
					loader: "css-loader"
				}, {
					loader: "postcss-loader"
				}]
			},
			{
				test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.dae$/, /\.obj$/, /\.mtl$/],
				use: {
					loader: "url-loader",
                    options: {
                        name: '[name].[ext]',
                        outputPath: 'fonts/'
                    }
				},
			},
			{
				test: /\.yml$/,
				use: [
					{ loader: 'json-loader' },
					{ loader: 'yaml-loader' }
				],
			},
			{
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: 'fonts/'
                    }
                }]
            }
		]
	},
	resolve: {
		alias: {
			'assets': path.join(__dirname, 'src/assets'),
			'components': path.join(__dirname, 'src/components'),
			'store': path.join(__dirname, 'src/store'),
			'utils': path.join(__dirname, 'src/utils')
		}
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: __dirname + "/public/index.html"
		}),
		new CopyWebpackPlugin([
			{ from: __dirname +'/src/assets', to: 'assets' }
		  ])
	]
}
