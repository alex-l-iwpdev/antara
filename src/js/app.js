//Libs
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';

// Let's try to import MorphSVGPlugin more safely
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

try {
	gsap.registerPlugin( ScrollTrigger, Flip, MorphSVGPlugin, ScrollToPlugin );
} catch ( e ) {
	console.warn( 'Ошибка регистрации плагинов GSAP:', e );
	gsap.registerPlugin( ScrollTrigger, Flip, ScrollToPlugin );
}


import BackgroundBlur from './layout/BackgroundBlur.js';
import Header from './layout/Header.js';
import Music from './layout/Music.js';
import Forms from './layout/Forms.js';
import Scroll from './layout/Scroll.js';
import Anchors from './layout/Anchors.js';
import Language from './layout/language.js';
import TabsMenu from './layout/TabsMenu.js';
import HorizontalScroll from './layout/HorizontalScroll.js';
import SwiperSliders from './layout/SwiperSliders.js';
import Tabs from './layout/Tabs.js';
import Modal from './layout/Modal.js';
import GeoContent from './layout/GeoContent.js';
import Video from './layout/Video.js';

( ( $ ) => {
	$( () => {
		const isMobile = ( typeof window !== 'undefined' && window.innerWidth <= 768 );
		const criticalModules = [ 'Header', 'BackgroundBlur', 'Scroll' ];
		const modules = [
			{ name: 'BackgroundBlur', fn: BackgroundBlur },
			{ name: 'Header', fn: Header },
			{ name: 'Music', fn: Music },
			{ name: 'Forms', fn: Forms },
			{ name: 'Scroll', fn: Scroll },
			{ name: 'Anchors', fn: Anchors },
			{ name: 'TabsMenu', fn: TabsMenu },
			{ name: 'HorizontalScroll', fn: HorizontalScroll },
			{ name: 'SwiperSliders', fn: SwiperSliders },
			{ name: 'Tabs', fn: Tabs },
			{ name: 'Modal', fn: Modal },
			{ name: 'Language', fn: Language },
			{ name: 'GeoContent', fn: GeoContent },
			{ name: 'Video', fn: Video },
		];

		const initModule = ( m ) => {
			try {
				if ( typeof m.fn === 'function' ) {
					m.fn( $ );
				}
			} catch ( e ) {
				console.error( `Ошибка инициализации модуля ${ m.name }:`, e );
			}
		};

		if ( isMobile ) {
			// 1. Инициализируем критические модули сразу
			modules.filter( m => criticalModules.includes( m.name ) ).forEach( initModule );

			// 2. Остальные модули инициализируем в фоне
			const secondaryModules = modules.filter( m => ! criticalModules.includes( m.name ) );
			let index = 0;

			const initNext = ( deadline ) => {
				while ( ( deadline.timeRemaining() > 0 || deadline.didTimeout ) && index < secondaryModules.length ) {
					initModule( secondaryModules[ index ] );
					index++;
				}

				if ( index < secondaryModules.length ) {
					window.requestIdleCallback( initNext );
				}
			};

			if ( window.requestIdleCallback ) {
				window.requestIdleCallback( initNext );
			} else {
				// Fallback для браузеров без requestIdleCallback
				const initAll = () => {
					secondaryModules.forEach( m => initModule( m ) );
				};
				setTimeout( initAll, 200 );
			}
		} else {
			modules.forEach( initModule );
		}
	} );
} )( jQuery );
