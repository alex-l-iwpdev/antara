import gsap from 'gsap';

const Anchors = ( $ ) => {
	// Prevent double initialization in case of partial reloads
	const body = document.body;
	if ( body && body.dataset.anchorsInitialized === 'true' ) {
		return;
	}
	if ( body ) {
		body.dataset.anchorsInitialized = 'true';
	}

	const sidebarItems = document.querySelectorAll( '.sidebar-item' );
	const sections = document.querySelectorAll( 'section[id], div[id].brxe-section' );
	const header = document.querySelector( '.header, header' );

	const getHeaderOffset = () => {
		if ( ! header ) return 0;
		const style = getComputedStyle( header );
		const isFixed = style.position === 'fixed' || style.position === 'sticky';
		return isFixed ? header.offsetHeight : 0;
	};

	const activateSidebarItem = ( id ) => {
		sidebarItems.forEach( ( item ) => {
			const href = item.getAttribute( 'href' );
			const itemTargetId = href && href.startsWith( '#' ) ? href.slice( 1 ) : item.dataset.section;

			if ( itemTargetId === id || item.dataset.section === id ) {
				item.classList.add( 'active' );
			} else {
				item.classList.remove( 'active' );
			}
		} );
	};

	// Храним состояние видимости для каждой секции
	const visibilityMap = new Map();

	const updateActiveItem = () => {
		let bestSection = null;
		let maxRatio = -1;

		visibilityMap.forEach( ( ratio, id ) => {
			if ( ratio > maxRatio ) {
				maxRatio = ratio;
				bestSection = id;
			}
		} );

		if ( bestSection && maxRatio > 0.1 ) {
			activateSidebarItem( bestSection );
		}
	};

	const refreshObserver = () => {
		const currentSections = document.querySelectorAll( 'section[id], div[id].brxe-section' );
		currentSections.forEach( ( section ) => {
			observer.unobserve( section );
			observer.observe( section );
		} );
	};

	const scrollToId = ( id ) => {
		if ( ! id ) return;
		const target = document.getElementById( id );
		if ( ! target ) return;

		const extraOffset = getHeaderOffset() + 100;
		const rect = target.getBoundingClientRect();
		const absoluteY = window.scrollY + rect.top - extraOffset;

		gsap.to( window, {
			duration: 2.5,
			ease: 'power4.inOut',
			scrollTo: { y: absoluteY, autoKill: true },
		} );
	};

	// IntersectionObserver для подсветки активного пункта
	const observer = new IntersectionObserver(
		( entries ) => {
			entries.forEach( ( entry ) => {
				if ( entry.target.id ) {
					visibilityMap.set( entry.target.id, entry.intersectionRatio );
				}
			} );
			updateActiveItem();
		},
		{
			rootMargin: '-15% 0px -45% 0px',
			threshold: [ 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1 ],
		},
	);

	sections.forEach( ( section ) => {
		observer.observe( section );
	} );

	// Повторная инициализация наблюдателя через небольшую задержку для динамического контента
	setTimeout( refreshObserver, 1000 );

	// Перехват кликов
	const selector = 'a.sidebar-item[href^="#"], a[data-brx-anchor][href^="#"], .sidebar a[href^="#"]';
	const links = Array.from( document.querySelectorAll( selector ) );

	const handleClick = ( e ) => {
		const link = e.currentTarget;
		const href = link.getAttribute( 'href' ) || '';
		if ( ! href.startsWith( '#' ) ) return;
		const id = href.slice( 1 );
		const target = document.getElementById( id );
		if ( ! target ) return;

		e.preventDefault();
		e.stopPropagation();
		e.stopImmediatePropagation();
		scrollToId( id );
	};

	links.forEach( ( link ) => {
		link.addEventListener( 'click', handleClick, true );
	} );

	if ( window.location.hash && window.location.hash.length > 1 ) {
		const id = decodeURIComponent( window.location.hash.slice( 1 ) );
		setTimeout( () => scrollToId( id ), 100 );
	}

	// Cleanup on page hide/unload to avoid lingering observers and duplicate listeners
	const cleanup = () => {
		try {
			observer.disconnect();
		} catch ( e ) {
		}
		links.forEach( ( link ) => {
			link.removeEventListener( 'click', handleClick, true );
		} );
	};
	window.addEventListener( 'pagehide', cleanup, { once: true } );
	window.addEventListener( 'beforeunload', cleanup, { once: true } );
};

export default Anchors;
