const Language = ( $ ) => {
	const switcher = $( '.brxe-polylang-language-switcher' );
	if ( switcher.length ) {
		// Store original full language names to restore them on desktop sizes
		switcher.find( 'a' ).each( function() {
			const $a = $( this );
			if ( ! $a.attr( 'data-original-text' ) ) {
				$a.attr( 'data-original-text', $a.text() );
			}
		} );

		// Create/get a span to display the current language next to the SVG
		let displaySpan = $( '.Language-wrapper .current-lang-display' );
		if ( ! displaySpan.length ) {
			displaySpan = $( '<span class="current-lang-display"></span>' );
			$( '.Language-wrapper svg' ).after( displaySpan );
		}

		let wasMobile = null;
		const updateLanguageSwitcher = () => {
			const isMobile = window.innerWidth < 768;
			
			// Only update DOM if the state changed (mobile <-> desktop)
			if ( wasMobile === isMobile ) return;
			wasMobile = isMobile;

			switcher.find( 'a' ).each( function() {
				const $a = $( this );
				if ( isMobile ) {
					const text = $a.attr( 'lang' )?.split( '-' )[ 0 ];
					if ( text ) $a.text( text );
				} else {
					const originalText = $a.attr( 'data-original-text' );
					if ( originalText ) $a.text( originalText );
				}
			} );

			const currentLang = $( '.current-lang' ).first().text();
			if ( currentLang ) {
				displaySpan.text( currentLang );
			}
		};

		// Run initially
		updateLanguageSwitcher();

		// Run on window resize
		$( window ).on( 'resize', updateLanguageSwitcher );
	}

	const getCookie = ( name ) => {
		const value = `; ${document.cookie}`;
		const parts = value.split( `; ${name}=` );
		if ( parts.length === 2 ) {
			const cookieValue = parts.pop().split( ';' ).shift();
			try {
				return decodeURIComponent( cookieValue );
			} catch ( e ) {
				return cookieValue;
			}
		}
	};

	// Browser language detection and pll_language cookie setting
	const supportedLanguages = ['fr', 'nl', 'es', 'en'];
	const browserLang = navigator.language.split('-')[0];

	if (supportedLanguages.includes(browserLang)) {
		const pllCookie = getCookie('pll_language');
		if (!pllCookie || pllCookie.trim() === '') {
			const date = new Date();
			date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days
			document.cookie = `pll_language=${browserLang}; expires=${date.toUTCString()}; path=/`;
		}
	}

	const lang = getCookie( 'pll_language' ) || 'nl';
	const translateSrting = {
		'es': { 'open': 'Leer más', 'close': 'Leer menos' },
		'en': { 'open': 'Read more', 'close': 'Read less' },
		'nl': { 'open': 'Meer lezen', 'close': 'Toon minder' },
		'fr': { 'open': 'En savoir plus', 'close': 'Masquer' }
	};
	const translations = translateSrting[lang] || translateSrting['en'];

	document.querySelectorAll( '.services_tab_open-item' ).forEach( ( tab ) => {
		const btn = tab.querySelector( '.services_tab_open-btn' );
		const info = tab.querySelector( '.services_tab_open-info' );

		if ( ! btn || ! info ) return;

		const text = btn.querySelector( '.text' );
		const icon = btn.querySelector( '.icon' );

		if ( ! text || ! icon ) return;

		let isOpen = false;
		text.textContent = translations.open;

		btn.addEventListener( 'click', () => {
			if ( ! isOpen ) {
				info.style.height = info.scrollHeight + 'px';
				text.textContent = translations.close;
				icon.textContent = '–';
				isOpen = true;
			} else {
				info.style.height = '0px';
				text.textContent = translations.open;
				icon.textContent = '+';
				isOpen = false;
			}
		} );
	} );
};

export default Language;
