const WebpackPwaManifest = require('webpack-pwa-manifest')
const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin')

const path = require('path')

function resolve(dir) {
	return path.join(__dirname, dir)
}
module.exports = {
	runtimeCompiler: true,
	lintOnSave: true,
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
				description: 'ZhuHaiBus Progressive Web App!',
				background_color: '#ffffff',
				crossorigin: 'use-credentials', // can be null, use-credentials or anonymous
				icons: [
					{
						src: resolve('src/assets/logo.png'),
						sizes: [96, 128, 192, 256, 384, 512] // multiple sizes
					}
				]
			}),
			new VuetifyLoaderPlugin()
		]
	},
	devServer: {
		https: false
	}
}
