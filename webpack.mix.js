import fs from 'fs' ;
import mix from 'laravel-mix';
import chokidar from 'chokidar';
import path from 'path';
import generateIcons from './generate-icons.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath( import.meta.url );
const __dirname = path.dirname( __filename );

const projectPath = '.';
const sourcePath = `${projectPath}/src`;
const outputPath = `${projectPath}/assets`;
const iconsPath = path.resolve( __dirname, `${sourcePath}/icons` );

const libsCss = [];
const libsJs = [];

const sourceMapType = 'cheap-module-source-map';

// === Generation of icons (if the folder exists)
if ( fs.existsSync( iconsPath ) ) {
	generateIcons();
} else {
	console.warn( '⚠️  icons folder not found:', iconsPath );
}


mix.setPublicPath( outputPath )
	.webpackConfig( {
		externals: {
			jquery: 'jQuery',
		},
		module: {
			rules: [
				{
					test: /\.js$/,
					exclude: /node_modules/,
					use: [
						{
							loader: 'babel-loader',
							options: {
								presets: [ '@babel/preset-env' ],
								sourceType: 'module'
							}
						}
					]
				}
			]
		},
		resolve: {
			extensions: [ '.js' ]
		}
	} )
	.options( {
		devtool: sourceMapType,
		processCssUrls: false,
		manifest: false,
	} )
	.sourceMaps( true, sourceMapType )
	.sass( `${sourcePath}/scss/app.scss`, `${outputPath}/css` )
	.js( `${sourcePath}/js/app.js`, `${outputPath}/js/app.js` )
	.babelConfig( {
		presets: [ '@babel/preset-env' ]
	} )
	.combine( libsJs, `${outputPath}/js/libs.min.js` )
	.combine( libsCss, `${outputPath}/css/libs.min.css` )
	.disableSuccessNotifications();

if ( process.argv.includes( '--watch' ) && fs.existsSync( iconsPath ) ) {
	chokidar.watch( iconsPath, { ignoreInitial: true } )
		.on( 'add', generateIcons )
		.on( 'change', generateIcons )
		.on( 'unlink', generateIcons );

	console.log( '👀 Watching for SVG icon changes...' );
}

console.log( 'inProduction === ' + mix.inProduction() );
