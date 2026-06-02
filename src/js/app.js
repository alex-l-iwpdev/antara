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

		if ( isMobile ) {
			// На мобильных инициализируем модули по одному, чтобы не блокировать поток
			let index = 0;
			const initNext = () => {
				if ( index < modules.length ) {
					try {
						if ( typeof modules[ index ].fn === 'function' ) {
							modules[ index ].fn( $ );
						}
					} catch ( e ) {
						console.error( `Ошибка инициализации модуля ${ modules[ index ].name }:`, e );
					}
					index++;
					// Используем requestIdleCallback если доступен, иначе setTimeout
					if ( window.requestIdleCallback ) {
						window.requestIdleCallback( initNext );
					} else {
						setTimeout( initNext, 10 );
					}
				}
			};
			initNext();
		} else {
			// На десктопе инициализируем все сразу
			modules.forEach( m => {
				try {
					if ( typeof m.fn === 'function' ) {
						m.fn( $ );
					}
				} catch ( e ) {
					console.error( `Ошибка инициализации модуля ${ m.name }:`, e );
				}
			} );
		}
	} );
} )( jQuery );
