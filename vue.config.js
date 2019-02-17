const WebpackPwaManifest = require('webpack-pwa-manifest')
const path = require('path')

function resolve(dir) {
	return path.join(__dirname, dir)
}
module.exports = {
	runtimeCompiler: true,
	lintOnSave: false,
	pages: {
		index: {
			entry: 'src/main.js',
			template: './index.html',
			filename: 'index.html'
		}
	},
	pwa: {
		name: 'ZhuHaiBus PWA',
		workboxPluginMode: 'InjectManifest',
		workboxOptions: {
			swSrc: 'public/service-worker.js'
		}
	},
	configureWebpack: { 
		plugins: [
			new WebpackPwaManifest({
				name: 'ZhuHaiBus PWA',
				short_name: 'ZhuHaiBus PWA',
				start_url: "./index.html",
  				display: "standalone",
  				theme_color: "#4DBA87",
				description: 'ZhuHaiBus Progressive Web App!',
				background_color: '#ffffff',
				icons: [
					{
						src: resolve('src/assets/logo.png'),
						sizes: [96, 128, 192, 256, 384, 512] // multiple sizes
					}
				]
			}),
		]
	},
	devServer: {
		https: false
	}
}
