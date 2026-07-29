import gsap from 'gsap';

const Music = ( $ ) => {
	/* Global Wave Settings */
	const CFG = {
		POINTS: 25,
		LEFT: 38,
		RIGHT: 12, 
		VIEW: 120,
		BASE: 13,
		AMP: 2,
		FREQ: 0.4,
		SPEED: 1,
	};

	// Global Active Button List
	let activeAudio = null;

	// Take all the buttons at once
	document.querySelectorAll( '.audio-btn' ).forEach( init );

	function init( btn ) {
		const audioId = btn.dataset.audio;
		const audio = document.getElementById( audioId );
		const path = btn.querySelector( '.wave-path' );
		if ( ! audio || ! path ) return;

		const STEP_X = ( CFG.VIEW - CFG.LEFT - CFG.RIGHT ) / ( CFG.POINTS - 1 );

		function draw( amp = CFG.AMP, phase = 0 ) {
			let d = `M${ CFG.LEFT } ${ CFG.BASE }`;
			for ( let i = 1; i < CFG.POINTS; i++ ) {
				const x = ( CFG.LEFT + i * STEP_X ).toFixed( 2 );
				const y = ( CFG.BASE + Math.sin( phase + i * CFG.FREQ ) * amp ).toFixed( 2 );
				d += ` L${ x } ${ y }`;
			}
			path.setAttribute( 'd', d );
		}

		draw( 0 ); // Start Line

		let tl = null;
		const driver = { phase: 0 };

		function startAnimation() {
			if ( ! tl ) {
				tl = gsap.to( driver, {
					phase: Math.PI * 2,
					duration: CFG.SPEED,
					ease: 'none',
					repeat: -1,
					onUpdate: () => draw( CFG.AMP, driver.phase ),
				} );
			} else {
				tl.play();
			}
		}

		function stopAnimation() {
			if ( tl ) {
				tl.pause();
				const st = { amp: CFG.AMP };
				gsap.to( st, {
					amp: 0,
					duration: 0.3,
					onUpdate: () => draw( st.amp, driver.phase ),
				} );
			}
		}

		btn.addEventListener( 'click', () => {
			const isPlaying = btn.classList.contains( 'playing' );

			if ( isPlaying ) {
				btn.classList.remove( 'playing' );
				audio.pause();
				stopAnimation();
				activeAudio = null;
			} else {
				if ( activeAudio ) {
					activeAudio.btn.classList.remove( 'playing' );
					activeAudio.audio.pause();
					activeAudio.stopAnimation();
				}

				activeAudio = { btn, audio, stopAnimation };
				btn.classList.add( 'playing' );
				audio.play();
				startAnimation();
			}
		} );

		audio.addEventListener( 'ended', () => {
			btn.classList.remove( 'playing' );
			stopAnimation();
			if ( activeAudio && activeAudio.btn === btn ) {
				activeAudio = null;
			}
		} );
	}
};

export default Music;
