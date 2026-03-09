import gsap from 'gsap';

const BackgroundBlur = ( $ ) => {
	// Предотвращаем повторную инициализацию
	const body = document.body;
	if ( body && body.dataset.backgroundBlurInitialized === 'true' ) {
		return;
	}
	if ( body ) body.dataset.backgroundBlurInitialized = 'true';

	// Храним активные твины для возможности остановки
	const tweens = new WeakMap();
	let docVisible = document.visibilityState === 'visible';

	function stopTween( el ) {
		const t = tweens.get( el );
		if ( t ) {
			try {
				t.kill();
			} catch ( e ) {
			}
			tweens.delete( el );
		}
	}

	function floatRandomly( el ) {
		function move() {
			if ( ! docVisible ) return; // не стартуем, если вкладка скрыта
			const vw = window.innerWidth;
			const vh = window.innerHeight;
			const t = gsap.to( el, {
				x: gsap.utils.random( -vw / 2, vw / 2 ),
				y: gsap.utils.random( -vh / 2, vh / 2 ),
				z: 0.1, // принудительное 3D ускорение для Safari
				rotation: 0.01, // еще один хак для стабилизации рендеринга в Safari
				duration: gsap.utils.random( 20, 50 ),
				ease: 'sine.inOut',
				force3D: true,
				onComplete: move,
			} );
			tweens.set( el, t );
		}

		move();
	}

	const bg = document.querySelectorAll( '.bg-blur' );
	if ( bg.length > 0 ) {
		bg.forEach( ( el ) => {
			floatRandomly( el );
		} );
	}

	const onVisibility = () => {
		docVisible = document.visibilityState === 'visible';
		if ( ! docVisible ) {
			bg.forEach( stopTween );
		} else {
			bg.forEach( ( el ) => {
				if ( ! tweens.get( el ) ) floatRandomly( el );
			} );
		}
	};
	document.addEventListener( 'visibilitychange', onVisibility );

	const cleanup = () => {
		document.removeEventListener( 'visibilitychange', onVisibility );
		bg.forEach( stopTween );
	};
	window.addEventListener( 'pagehide', cleanup, { once: true } );
};

export default BackgroundBlur;
