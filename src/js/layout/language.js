const Language = ( $ ) => {
	const switcher = $( '.brxe-polylang-language-switcher' );
	if ( switcher.length && $(window).width() < 767 ) {
		switcher.find( 'a' ).map( function() {
			const text = $( this ).attr( 'lang' ).split( '-' )[ 0 ];

			$( this ).text( text );
		} );
	}

	const currentLang = $( '.current-lang' ).text();
	$( '.Language-wrapper svg' ).after( currentLang );

	// Browser language detection and pll_language cookie setting
	const supportedLanguages = ['fr', 'nl', 'es', 'en'];
	const browserLang = navigator.language.split('-')[0];

	if (supportedLanguages.includes(browserLang)) {
		const getCookie = (name) => {
			const value = `; ${document.cookie}`;
			const parts = value.split(`; ${name}=`);
			if (parts.length === 2) return parts.pop().split(';').shift();
		};

		const pllCookie = getCookie('pll_language');
		if (!pllCookie || pllCookie.trim() === '') {
			const date = new Date();
			date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days
			document.cookie = `pll_language=${browserLang}; expires=${date.toUTCString()}; path=/`;
		}
	}
};

export default Language;
