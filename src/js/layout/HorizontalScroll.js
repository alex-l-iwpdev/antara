import gsap from 'gsap';

const HorizontalScroll = ( $ ) => {
	// Get our horizontal container safely
	const horizontalWrapper = document.querySelector( '.horizontal-scroll-wrapper' );
	if ( ! horizontalWrapper ) return;

	// Limit sections to those inside the wrapper to avoid layout mismatches
	const horizontalSections = Array.from(
		horizontalWrapper.querySelectorAll( '.horizontal-section' ),
	);

	// Calculate the total width of all partitions
	let totalWidth = 0;
	horizontalSections.forEach( ( section ) => {
		totalWidth += section.offsetWidth;
	} );

	// Clamp scroll distance to non-negative and early-exit if nothing to scroll
	const scrollDistance = Math.max( 0, totalWidth - window.innerWidth );
	if ( scrollDistance === 0 ) return;

	// Creating a ScrollTrigger Animation
	const tween = gsap.to( horizontalWrapper, {
		x: -scrollDistance, // Move the container to the left by the calculated distance
		ease: 'none', // Linear animation
		scrollTrigger: {
			trigger: horizontalWrapper, // The trigger is the container itself
			pin: true, // "Pin the container" to the screen while the horizontal scroll is going on
			scrub: 1, // Linking the animation to the scroll, the higher the number, the more "linked" the scroll
			start: 'top top', // The animation will start when the top of the trigger reaches the top of the viewport
			end: () => '+=' + scrollDistance, // The animation will end when we scroll to scrollDistance
		},
	} );

	// Keep ScrollTrigger sizing in sync on resize/orientation
	const onResize = () => {
		try {
			if ( tween && tween.scrollTrigger ) tween.scrollTrigger.refresh();
		} catch ( e ) {
		}
	};
	window.addEventListener( 'resize', onResize );
	window.addEventListener( 'orientationchange', onResize );

	// Cleanup on page hide/unload to avoid lingering ScrollTriggers
	const cleanup = () => {
		try {
			window.removeEventListener( 'resize', onResize );
			window.removeEventListener( 'orientationchange', onResize );
			if ( tween && tween.scrollTrigger ) tween.scrollTrigger.kill();
			if ( tween ) tween.kill();
		} catch ( e ) {
		}
	};
	window.addEventListener( 'pagehide', cleanup, { once: true } );
	window.addEventListener( 'beforeunload', cleanup, { once: true } );
};

export default HorizontalScroll;
