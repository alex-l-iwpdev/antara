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

import Swiper from 'swiper';

import BackgroundBlur from './layout/BackgroundBlur.js';
import Header from './layout/Header.js';
import Music from './layout/Music.js';
import Forms from './layout/Forms.js';
import Scroll from './layout/Scroll.js';
import Anchors from './layout/Anchors.js';
import TabsMenu from './layout/TabsMenu.js';
import HorizontalScroll from './layout/HorizontalScroll.js';
import SwiperSliders from './layout/SwiperSliders.js';
import Tabs from './layout/Tabs.js';
import Modal from './layout/Modal.js';

( ( $ ) => {
	$( () => {
		try {
			BackgroundBlur( $ );
			Header( $ );
			Music( $ );
			Forms( $ );
			Scroll( $ );
			Anchors( $ );
			TabsMenu( $ );
			HorizontalScroll( $ );
			SwiperSliders( $ );
			Tabs( $ );
			Modal( $ );
		} catch ( e ) {
			console.error( 'Ошибка инициализации модулей:', e );
		}
	} );
} )( jQuery );
