const Header = ( $ ) => {
	// Предотвращаем повторную инициализацию
	const body = document.body;
	if ( body && body.dataset.headerInitialized === 'true' ) return;
	if ( body ) body.dataset.headerInitialized = 'true';

	const menuBtn = document.querySelector( '.btn-menu' );
	const header = document.querySelector( '.header' );
	const subMenuIcon = $('.new-menu-wrapper .icon-plus');
	subMenuIcon.click(function(){
		if($(this).find('path:first').is(':visible')){
			$(this).find('path:first').hide();
			$(this).next().hide();
		}else{
			$(this).find('path:first').show();
			$(this).next().show();
		}
		$(this).next().slideToggle();
	})
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

	let headerHeight = 0;
	function updateMenuPadding() {
		const headerEl = document.querySelector( '.header' );
		const menus = document.querySelectorAll( '.menu-open, .menu-open-mobil' );
		if ( headerEl && menus.length > 0 ) {
			headerHeight = headerEl.offsetHeight;
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
	let resizeTimeout;
	const onResize = () => {
		clearTimeout(resizeTimeout);
		resizeTimeout = setTimeout(updateMenuPadding, 100);
	};
	window.addEventListener( 'resize', onResize );

	if ( ! header ) return;
	let lastScrollY = window.scrollY;
	const banner = document.querySelector( '.banner' );

	if ( banner && 'IntersectionObserver' in window ) {
		const themeObserver = new IntersectionObserver( ( [ entry ] ) => {
			if ( ! entry.isIntersecting ) {
				header.classList.add( 'dark' );
			} else {
				header.classList.remove( 'dark' );
			}
		}, {
			threshold: 0,
			rootMargin: `-${headerHeight || 80}px 0px 0px 0px`
		} );
		themeObserver.observe( banner );
	}

	window.addEventListener( 'pagehide', () => {
		window.removeEventListener( 'resize', onResize );
		window.removeEventListener( 'scroll', onScroll );
	}, { once: true } );
};

export default Header;
