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

	document.querySelectorAll( '.services_tab_open-item' ).forEach( ( tab ) => {
		const btn = tab.querySelector( '.services_tab_open-btn' );
		const info = tab.querySelector( '.services_tab_open-info' );
		const translateSrting = {
			'es': {
				'open': 'Leer más',
				'close': 'Leer menos',
			},
			'en': {
				'open': 'Read more',
				'close': 'Read less',
			},
			'nl': {
				'open': 'Meer lezen',
				'close': 'Toon minder',
			},
			'fr': {
				'open': 'En savoir plus',
				'close': 'Masquer',
			}
		};

		const getCookie = ( name ) => {
			const value = `; ${document.cookie}`;
			const parts = value.split( `; ${name}=` );
			if ( parts.length === 2 ) return parts.pop().split( ';' ).shift();
		};

		const lang = getCookie( 'pll_language' ) || 'nl'; // По умолчанию nl, как указано в описании
		const translations = translateSrting[lang] || translateSrting['en'];


		// Проверка осталась, а сообщение в консоль - убрали
		if ( ! btn || ! info ) {
			return;
		}

		const text = btn.querySelector( '.text' );
		const icon = btn.querySelector( '.icon' );

		if ( ! text || ! icon ) {
			return;
		}

		let isOpen = false;

		// Устанавливаем начальное значение текста
		text.textContent = translations.open;

		btn.addEventListener( 'click', () => {
			console.log('click', isOpen);
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
