const Header = ( $ ) => {
	// Предотвращаем повторную инициализацию
	const body = document.body;
	if ( body && body.dataset.headerInitialized === 'true' ) return;
	if ( body ) body.dataset.headerInitialized = 'true';

	const menuBtn = document.querySelector( '.btn-menu' );
	const header = document.querySelector( '.header' );
	if ( menuBtn ) {
		const onMenuClick = function() {
			this.classList.toggle( 'active' );
			const headerEl = document.querySelector( 'header' );
			if ( headerEl ) headerEl.classList.toggle( 'active' );
		};
		menuBtn.addEventListener( 'click', onMenuClick );
		window.addEventListener( 'pagehide', () => {
			menuBtn.removeEventListener( 'click', onMenuClick );
		}, { once: true } );
	}

	function updateMenuPadding() {
		const headerEl = document.querySelector( '.header' );
		const menus = document.querySelectorAll( '.menu-open, .menu-open-mobil' );
		if ( headerEl && menus.length > 0 ) {
			const headerHeight = headerEl.offsetHeight;
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
	const onResize = () => updateMenuPadding();
	window.addEventListener( 'resize', onResize );

	if ( ! header ) return; // Check if there is a header on the page
	let lastScrollY = window.scrollY; // Previous scroll position
	const scrollThreshold = window.innerHeight * 0.03; // 3% of browser window height

	const onScroll = () => {
		const currentScrollY = window.scrollY;
		if ( currentScrollY < scrollThreshold ) {
			header.classList.remove( 'header-hidden' );
			lastScrollY = currentScrollY;
			return;
		}
		if ( currentScrollY > lastScrollY ) {
			header.classList.add( 'header-hidden' );
		} else {
			header.classList.remove( 'header-hidden' );
		}
		lastScrollY = currentScrollY;
	};
	window.addEventListener( 'scroll', onScroll, { passive: true } );

	window.addEventListener( 'pagehide', () => {
		window.removeEventListener( 'resize', onResize );
		window.removeEventListener( 'scroll', onScroll );
	}, { once: true } );
};

export default Header;
