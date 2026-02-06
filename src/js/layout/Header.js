const Header = ( $ ) => {

	const menuBtn = document.querySelector( '.btn-menu' );
	if ( menuBtn ) {
		menuBtn.addEventListener( 'click', function() {
			this.classList.toggle( 'active' );

			const header = document.querySelector( 'header' );
			if ( header ) {
				header.classList.toggle( 'active' );
			}
		} );
	}

	function updateMenuPadding() {
		const header = document.querySelector( '.header' );
		const menus = document.querySelectorAll( '.menu-open, .menu-open-mobil' );

		if ( header && menus.length > 0 ) {
			const headerHeight = header.offsetHeight;

			menus.forEach( ( menu ) => {
				menu.style.paddingTop = `${headerHeight}px`;

				const menuHeight = menu.scrollHeight;
				document.documentElement.style.setProperty(
					`--menu-height-${menu.classList.contains( 'menu-open-mobil' ) ? 'mobil' : 'desktop'}`,
					menuHeight + 'px',
				);
			} );
		}
	}

	updateMenuPadding();
	window.addEventListener( 'resize', updateMenuPadding );

	// Change getElementById to querySelector and specify a class with a dot in front of it
	const header = document.querySelector( '.header' );
	if ( ! header ) return; // Check if there is a header on the page

	let lastScrollY = window.scrollY; // Previous scroll position
	const scrollThreshold = window.innerHeight * 0.03; // 3% of browser window height

	window.addEventListener( 'scroll', () => {
		const currentScrollY = window.scrollY;

		// If the scroll is less than 3% from the top of the page, the header is always visible
		if ( currentScrollY < scrollThreshold ) {
			header.classList.remove( 'header-hidden' );
			lastScrollY = currentScrollY;
			return;
		}

		// The logic of hiding/appearing when scrolling
		if ( currentScrollY > lastScrollY ) {
			// Scroll down
			header.classList.add( 'header-hidden' );
		} else {
			// Scroll up
			header.classList.remove( 'header-hidden' );
		}

		lastScrollY = currentScrollY;
	} );
};

export default Header;
