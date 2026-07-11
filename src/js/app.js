//Libs
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { Flip } from 'gsap/Flip';

// Let's try to import MorphSVGPlugin more safely
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

import BgBlur from './layout/BgBlur.js';
import Header from './layout/Header.js';
import Music from './layout/Music.js';
import Shop from './layout/Shop.js';
import Scroll from './layout/Scroll.js';

try {
	gsap.registerPlugin( ScrollTrigger, ScrollSmoother, Flip, MorphSVGPlugin, ScrollToPlugin );
} catch ( e ) {
	console.warn( 'Ошибка регистрации плагинов GSAP:', e );
	gsap.registerPlugin( ScrollTrigger, ScrollSmoother, Flip, ScrollToPlugin );
}

( ( $ ) => {
	$( () => {
		try {
			BgBlur( $ );
			Header( $ );
			Music( $ );
			Shop( $ );
			Scroll( $ );
		} catch ( e ) {
			console.error( 'Ошибка инициализации модулей:', e );
		}
	} );
} )( jQuery );
