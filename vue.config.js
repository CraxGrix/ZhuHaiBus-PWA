const WebpackPwaManifest = require('webpack-pwa-manifest');
// const FaviconsWebpackPlugin = require('favicons-webpack-plugin');

const path = require('path');

function resolve(dir) {
  return path.join(__dirname, dir);
}
module.exports = {
  runtimeCompiler: true,
  pages: {
    index: {
      entry: 'src/main.js',
      template: './index.html',
      filename: 'index.html',
    },
  },
  pwa: {
    name: 'ZhuHaiBus PWA',
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
            sizes: [96, 128, 192, 256, 384, 512], // multiple sizes
          },
        ],
      }),
      // TODO: 需要下载phantomjs
      /* new FaviconsWebpackPlugin({
        logo: resolve('')
      }) */
    ],
  },
};
