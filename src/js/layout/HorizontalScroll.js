import gsap from 'gsap';

const HorizontalScroll = ( $ ) => {
	// We get our horizontal container
	const horizontalWrapper = document.querySelector(
		'.horizontal-scroll-wrapper',
	);
	// Get all the horizontal sections inside
	const horizontalSections = gsap.utils.toArray( '.horizontal-section' );

	// Calculate the total width of all partitions
	// Use clientWidth because each partition is 100vw,
	// and we need them to shift to their full width
	let totalWidth = 0;
	horizontalSections.forEach( ( section ) => {
		totalWidth += section.offsetWidth;
	} );

	const scrollDistance = totalWidth - window.innerWidth;

	// Creating a ScrollTrigger Animation
	gsap.to( horizontalWrapper, {
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
};

export default HorizontalScroll;
