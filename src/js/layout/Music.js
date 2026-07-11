import gsap from 'gsap';

const Music = ( $ ) => {
	const CFG = {
		POINTS: 25, LEFT: 28, RIGHT: 12, VIEW: 80, BASE: 13, AMP: 2, FREQ: 0.4, SPEED: 1,
	};

	// Global Active Button List
	const activeAudioButtons = [];

	// Take all the buttons at once
	const adioBtns = document.querySelectorAll( '.audio-btn' );
	if ( adioBtns.length ) {
		adioBtns.forEach( init );
	}

	function init( btn ) {
		const audioId = btn.dataset.audio;
		const audio = document.getElementById( audioId );
		const path = btn.querySelector( '.wave-path' );

		const STEP_X = ( CFG.VIEW - CFG.LEFT - CFG.RIGHT ) / ( CFG.POINTS - 1 );

		function draw( amp = CFG.AMP, phase = 0 ) {
			let d = `M${CFG.LEFT} ${CFG.BASE}`;
			for ( let i = 1; i < CFG.POINTS; i++ ) {
				const x = ( CFG.LEFT + i * STEP_X ).toFixed( 2 );
				const y = ( CFG.BASE + Math.sin( phase + i * CFG.FREQ ) * amp ).toFixed( 2 );
				d += ` L${x} ${y}`;
			}

			path.setAttribute( 'd', d );
		}

		draw( 0 );

		const driver = { phase: 0 };
		const tl = gsap.to( driver, {
			phase: Math.PI * 2,
			duration: CFG.SPEED,
			ease: 'none',
			repeat: -1,
			paused: true,
			onUpdate: () => draw( CFG.AMP, driver.phase ),
		} );

		function flatten() {
			const st = { amp: CFG.AMP };
			gsap.to( st, {
				amp: 0, duration: 0.3, onUpdate: () => draw( st.amp, driver.phase ),
			} );
		}

		btn.addEventListener( 'click', () => {
			const isPlaying = btn.classList.contains( 'playing' );

			if ( isPlaying ) {
				btn.classList.remove( 'playing' );
				tl.pause();
				audio.pause();
				flatten();
			} else {
				// Stopping all the others
				activeAudioButtons.forEach( ( {
					btn: otherBtn, tl: otherTl, audio: otherAudio, flatten: otherFlatten,
				} ) => {
					otherBtn.classList.remove( 'playing' );
					otherTl.pause( 0 );
					otherAudio.pause();
					otherFlatten();
				}, );

				// Updating the list of active
				activeAudioButtons.length = 0;
				activeAudioButtons.push( { btn, tl, audio, flatten } );

				// Running the current one
				btn.classList.add( 'playing' );
				tl.play();
				audio.play();
			}
		} );

		audio.addEventListener( 'ended', () => {
			btn.classList.remove( 'playing' );
			tl.pause( 0 );
			flatten();
		} );
	}
};

export default Music;
