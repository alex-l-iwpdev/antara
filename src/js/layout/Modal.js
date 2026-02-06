const Modal = ( $ ) => {
	// Getting banner elements
	const modalFormOne = document.querySelector( '.modal-form-one' );
	const modalTop = document.getElementById( 'modal-top' );
	const brxeWrkwxk = document.getElementById( 'brxe-wrkwxk' );
	const soundSection = document.getElementById( 'sound' );
	const mindSection = document.getElementById( 'mind' );

	// Flags
	let modalFormOneShown = false;
	let modalTopShown = false;

	// Hide all banners by default
	if ( modalFormOne ) modalFormOne.style.display = 'none';
	if ( modalTop ) modalTop.style.display = 'none';
	if ( brxeWrkwxk ) brxeWrkwxk.style.display = 'none';

	// Function for showing/hiding a banner
	function showBanner( banner ) {
		if ( banner ) banner.style.display = 'block';
	}

	function hideBanner( banner ) {
		if ( banner ) banner.style.display = 'none';
	}

	// --- LOGIC 1: modal-top after 5 seconds, disappears after 10 ---
	setTimeout( () => {
		if ( ! modalTopShown && modalTop ) {
			showBanner( modalTop );
			modalTopShown = true;

			setTimeout( () => {
				hideBanner( modalTop );
			}, 10000 );
		}
	}, 5000 );

	// --- LOGIC 2: brxe-wrkwxk between sound and mind ---
	window.addEventListener( 'scroll', () => {
		if ( soundSection && mindSection && brxeWrkwxk ) {
			const soundTop = soundSection.getBoundingClientRect().top;
			const mindTop = mindSection.getBoundingClientRect().top;
			const windowHeight = window.innerHeight;

			// Checking if we are in the zone between sound and mind
			if ( soundTop <= windowHeight && mindTop > 0 ) {
				showBanner( brxeWrkwxk );
			} else {
				hideBanner( brxeWrkwxk );
			}
		}
	} );

	// --- LOGIC 3: modal-form-one when scrolling at 95% ---
	window.addEventListener( 'scroll', () => {
		const scrollPercentage =
			( document.documentElement.scrollTop + document.body.scrollTop ) /
			( document.documentElement.scrollHeight - document.documentElement.clientHeight ) * 100;

		if ( scrollPercentage >= 95 && ! modalFormOneShown ) {
			showBanner( modalFormOne );
			modalFormOneShown = true;
		}
	} );
};

export default Modal;
