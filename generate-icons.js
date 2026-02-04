import webfontsGenerator from 'webfonts-generator';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath( import.meta.url );
const __dirname = path.dirname( __filename );


const iconSrcPath = path.resolve( __dirname, `./src/icons/` );
const fontsDest = path.resolve( __dirname, `./assets/fonts` );
const cssDest = path.resolve( __dirname, `./src/scss/icon-font.scss` );

const generateIcons = () => {

	const svgFiles = fs.readdirSync( iconSrcPath )
		.filter( file => file.endsWith( '.svg' ) )
		.map( file => path.join( iconSrcPath, file ) );

	if ( svgFiles.length === 0 ) {
		console.error( '❌ There are no svg icons in the folder:', iconSrcPath );
		return;
	}

	webfontsGenerator( {
		files: svgFiles,
		dest: fontsDest,
		fontName: 'icons-fonts',
		types: [ 'ttf', 'eot', 'woff', 'woff2', 'svg' ],
		css: true,
		cssDest,
		cssFontsUrl: '../fonts',
		templateOptions: {
			classPrefix: 'ico-',
			baseSelector: '.ico'
		},
		formatOptions: {
			woff: {},
			ttf: {},
			woff2: {}
		},
		normalize: true,
		fontHeight: 1000,
	}, ( error ) => {
		if ( error ) {
			console.error( '❌ Icon generation error:', error );
		} else {
			console.log( '✅ The icons are generated!' );
		}
	} );
};

export default generateIcons;

