const Header = ( $ ) => {
	// Предотвращаем повторную инициализацию
	const body = document.body;
	if ( body && body.dataset.headerInitialized === 'true' ) return;
	if ( body ) body.dataset.headerInitialized = 'true';

	const menuBtn = document.querySelector( '.btn-menu' );
	const header = document.querySelector( '.header' );
	const subMenuIcon = $('.new-menu-wrapper .icon-plus');
	const menuItem = $('.new-menu-wrapper .menu-item');
	menuItem.hover(function(){
		if (window.innerWidth <= 767) return;
		const subMenu = $(this).find('.sub-menu');
		$('.new-menu-wrapper .sub-menu').hide();
		$('.new-menu-wrapper .icon-plus path:first').show();
		if(subMenu.length){
			subMenu.show();
			$(this).find('.icon-plus path:first').hide();
		}
	});

	subMenuIcon.click(function(e){
		e.preventDefault();
		const subMenu = $(this).next('.sub-menu');
		const verticalBar = $(this).find('path:first');
		if (subMenu.is(':visible')) {
			verticalBar.show();
			subMenu.slideUp();
		} else {
			verticalBar.hide();
			subMenu.slideDown();
		}
	});

	// Add current-menu-item based on URL
	const currentUrl = window.location.href.replace(/\/$/, "");
	const currentPath = window.location.pathname;
	const isHome = currentPath === '/' || currentPath === '/fr/' || currentPath === '/nl/' || currentPath === '/es/' || currentPath === '/ca/' || currentPath === '/index.php';

	$('.new-menu-wrapper .current-menu-item').removeClass('current-menu-item');

	// Always hide sub-menus and reset icons initially
	$('.new-menu-wrapper .sub-menu').hide();
	$('.new-menu-wrapper .icon-plus path:first').show();

	// Small fix to ensure they stay hidden if somehow they were opened by CSS or other scripts
	$('.new-menu-wrapper .sub-menu').css('display', 'none');

	if (isHome) {
		const firstMenuItem = $('.new-menu-wrapper .menu-item').first();
		const firstSubMenu = firstMenuItem.find('.sub-menu');

		// Add current-menu-item to the top-level item on home page
		firstMenuItem.addClass('current-menu-item');

		if (firstSubMenu.length) {
			firstSubMenu.find('.menu-item').first().addClass('current-menu-item');
			// Open on home page only for desktop
			if (window.innerWidth > 767) {
				firstSubMenu.css('display', 'block');
				firstMenuItem.find('.icon-plus path:first').hide();
			} else {
				// Ensure it's hidden on mobile even if something else tried to show it
				firstSubMenu.css('display', 'none');
				firstMenuItem.find('.icon-plus path:first').show();
			}
		}
	}

	$('.new-menu-wrapper a').each(function() {
		const href = $(this).attr('href');
		if (href) {
			const normalizedHref = href.replace(/\/$/, "");
			if (normalizedHref === currentUrl) {
				const parentMenuItem = $(this).closest('.menu-item');
				parentMenuItem.addClass('current-menu-item');

				// If we are inside a sub-menu, also add current-menu-item to the top-level parent
				const closestSubMenu = $(this).closest('.sub-menu');
				if (closestSubMenu.length) {
					closestSubMenu.closest('.menu-item').addClass('current-menu-item');
				}

				// For desktop, if active item is inside a sub-menu, open it
				if (window.innerWidth > 767) {
					const closestSubMenu = $(this).closest('.sub-menu');
					if (closestSubMenu.length) {
						closestSubMenu.css('display', 'block');
						closestSubMenu.closest('.menu-item').find('.icon-plus path:first').hide();
					}
				} else {
					// Ensure hidden on mobile
					const closestSubMenu = $(this).closest('.sub-menu');
					if (closestSubMenu.length) {
						closestSubMenu.css('display', 'none');
						closestSubMenu.closest('.menu-item').find('.icon-plus path:first').show();
					}
				}
			}
		}
	});

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
