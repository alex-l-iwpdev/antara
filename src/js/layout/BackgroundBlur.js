import gsap from 'gsap';

const BackgroundBlur = ( $ ) => {

	function floatRandomly( el ) {
		const vw = window.innerWidth;
		const vh = window.innerHeight;

		function move() {
			gsap.to( el, {
				x: gsap.utils.random( -vw / 2, vw / 2 ),
				y: gsap.utils.random( -vh / 2, vh / 2 ),
				duration: gsap.utils.random( 20, 50 ),
				ease: 'sine.inOut',
				onComplete: move,
			} );
		}

		move();
	}

	const bg = document.querySelectorAll( '.bg-blur' );
	if ( bg.length > 0 ) {
		bg.forEach( ( el ) => {
			floatRandomly( el );
		} );
	}
};

export default BackgroundBlur;
