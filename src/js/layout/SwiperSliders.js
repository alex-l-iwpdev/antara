import Swiper from 'swiper';

const SwiperSliders = ( $ ) => {
	const body = document.body;
	if ( body && body.dataset.swipersInitialized === 'true' ) {
		return;
	}
	if ( body ) body.dataset.swipersInitialized = 'true';

	let swipers = [];
	const maybeInit = ( selector, options ) => {
		const el = document.querySelector( selector );
		if ( ! el ) return;

		const init = () => {
			try {
				const s = new Swiper( selector, options );
				swipers.push( s );
			} catch ( e ) {
				console.warn( 'Swiper init failed for', selector, e );
			}
		};

		if ( window.innerWidth <= 768 && 'IntersectionObserver' in window ) {
			const io = new IntersectionObserver( ( entries ) => {
				entries.forEach( entry => {
					if ( entry.isIntersecting ) {
						init();
						io.disconnect();
					}
				} );
			}, { rootMargin: '200px' } );
			io.observe( el );
		} else {
			init();
		}
	};

	maybeInit( '.event-slider-sound', {
		slidesPerView: 'auto',
		spaceBetween: 0,
		navigation: {
			nextEl: '.event-slider-sound_arrow-right',
			prevEl: '.event-slider-sound_arrow-left',
		},
	} );

	maybeInit( '.event-slider-gong', {
		slidesPerView: 'auto',
		spaceBetween: 0,
		navigation: {
			nextEl: '.event-slider-gong_arrow-right',
			prevEl: '.event-slider-gong_arrow-left',
		},
	} );

	maybeInit( '.event-slider-circles', {
		slidesPerView: 'auto',
		spaceBetween: 0,
		navigation: {
			nextEl: '.event-slider-circles_arrow-right',
			prevEl: '.event-slider-circles_arrow-left',
		},
	} );

	const cleanup = () => {
		swipers.forEach( ( s ) => {
			try {
				s.destroy( true, true );
			} catch ( e ) {
			}
		} );
		swipers = [];
	};
	window.addEventListener( 'pagehide', cleanup, { once: true } );
	window.addEventListener( 'beforeunload', cleanup, { once: true } );
};

export default SwiperSliders;
