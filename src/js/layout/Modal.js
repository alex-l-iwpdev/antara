const Modal = ( $ ) => {
	// Предотвращаем двойную инициализацию
	const body = document.body;
	if ( body && body.dataset.modalInitialized === 'true' ) return;
	if ( body ) body.dataset.modalInitialized = 'true';

	const locationHField = $( '.form_first_step #input_4_8, .form_join #input_5_6' );
	const langHField = $( '.form_first_step #input_4_9, .form_join #input_5_7' );

	// Getting banner elements
	const modalFormOne = document.querySelector( '.modal-form-one' );
	const modalTop = document.getElementById( 'modal-top' );
	const brxeWrkwxk = document.getElementById( 'brxe-wrkwxk' );
	const soundSection = document.getElementById( 'sound' );
	const mindSection = document.getElementById( 'mind' );

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

	const translateText = {
		'en': {
			'default': 'Read more',
			'open': 'Read less',
		},
		'es': {
			'default': 'Leer más',
			'open': 'Leer menos',
		},
		'nl': {
			'default': 'Lees meer',
			'open': 'Lees minder',
		},
		'fr': {
			'default': 'Lire plus',
			'open': 'Lire moins',
		}
	};

	const getLanguage = () => {
		const cookieLang = getCookie( 'pll_language' );
		if ( cookieLang && translateText[ cookieLang.toLowerCase() ] ) {
			return cookieLang.toLowerCase();
		}

		const match = window.location.pathname.match( /^\/([a-z]{2})(\/|$)/i );
		if ( match && translateText[ match[ 1 ].toLowerCase() ] ) {
			return match[ 1 ].toLowerCase();
		}

		return 'en';
	};

	const updateElementText = ( $el, text ) => {
		const $text = $el.find( '.text' );
		if ( $text.length ) {
			$text.text( text );
			return;
		}

		const textNodes = $el.contents().filter( function() {
			return this.nodeType === 3 && this.nodeValue.trim().length > 0;
		} );

		if ( textNodes.length ) {
			textNodes.first().each( function() {
				const hasLeadingSpace = /^\s/.test( this.nodeValue );
				const hasTrailingSpace = /\s$/.test( this.nodeValue );
				this.nodeValue = ( hasLeadingSpace ? ' ' : '' ) + text + ( hasTrailingSpace ? ' ' : '' );
			} );
			return;
		}

		const $span = $el.find( 'span' );
		if ( $span.length ) {
			$span.first().text( text );
			return;
		}

		if ( ! $el.children().length ) {
			$el.text( text );
		}
	};

	const getElementText = ( $el ) => {
		const $text = $el.find( '.text' );
		if ( $text.length ) {
			return $text.text().trim();
		}

		const textNodes = $el.contents().filter( function() {
			return this.nodeType === 3 && this.nodeValue.trim().length > 0;
		} );

		if ( textNodes.length ) {
			return textNodes.first().text().trim();
		}

		const $span = $el.find( 'span' );
		if ( $span.length ) {
			return $span.first().text().trim();
		}

		return $el.text().trim();
	};

	$( '.read-more' ).click( function( e ) {
		e.preventDefault();
		const currentLang = getLanguage();
		const translations = translateText[ currentLang ] || translateText['nl'];
		const $this = $( this );
		const $hiddenText = $this.parent().parent().find( '.hidden-text' );
		const $icon = $this.find( '.fas' );
		const currentText = getElementText( $this );

		const isOpenText = currentText && Object.values( translateText ).some( t => t.open.toLowerCase() === currentText.toLowerCase() );
		const isOpen = ( $icon.length && $icon.hasClass( 'fa-minus' ) ) ||
			$this.hasClass( 'open' ) ||
			( $this.parents( '.experience-item' ).length && $this.parents( '.experience-item' ).hasClass( 'show' ) ) ||
			isOpenText ||
			( $hiddenText.length && $hiddenText.is( ':visible' ) );

		const isOpening = ! isOpen;

		if ( isOpening ) {
			$this.addClass( 'open' );
			$icon.removeClass( 'fa-plus' ).addClass( 'fa-minus' );
			updateElementText( $this, translations.open );
			if ( $hiddenText.length ) {
				$hiddenText.slideDown();
			}
			if ( $this.parents( '.experience-item' ).length ) {
				$( '.experience-item' ).not( $this.parents( '.experience-item' ) ).find( '.read-more' ).removeClass( 'open' ).each( function() {
					updateElementText( $( this ), translations.default );
				} );
			}
		} else {
			$this.removeClass( 'open' );
			$icon.removeClass( 'fa-minus' ).addClass( 'fa-plus' );
			updateElementText( $this, translations.default );
			if ( $hiddenText.length ) {
				$hiddenText.slideUp();
			}
		}
	} );
	$( '.read-more-next' ).click( function( e ) {
		e.preventDefault();
		const currentLang = getLanguage();
		const translations = translateText[ currentLang ] || translateText['nl'];
		const $this = $( this );
		const $hiddenText = $this.next();
		const $icon = $this.find( '.fas' );
		const currentText = getElementText( $this );

		const isOpenText = currentText && Object.values( translateText ).some( t => t.open.toLowerCase() === currentText.toLowerCase() );
		const isOpen = ( $icon.length && $icon.hasClass( 'fa-minus' ) ) ||
			$this.hasClass( 'open' ) ||
			isOpenText ||
			( $hiddenText.length && $hiddenText.is( ':visible' ) );

		const isOpening = ! isOpen;

		if ( isOpening ) {
			$this.addClass( 'open' );
			$icon.removeClass( 'fa-plus' ).addClass( 'fa-minus' );
			updateElementText( $this, translations.open );
			if ( $hiddenText.length ) {
				$hiddenText.slideDown();
			}
		} else {
			$this.removeClass( 'open' );
			$icon.removeClass( 'fa-minus' ).addClass( 'fa-plus' );
			updateElementText( $this, translations.default );
			if ( $hiddenText.length ) {
				$hiddenText.slideUp();
			}
		}
	} );
	$( '.read-more-text' ).click( function( e ) {
		e.preventDefault();
		const currentLang = getLanguage();
		const translations = translateText[ currentLang ] || translateText['nl'];
		const $this = $( this );
		const $hiddenContent = $this.prev();
		const currentText = getElementText( $this );

		const isOpenText = currentText && Object.values( translateText ).some( t => t.open.toLowerCase() === currentText.toLowerCase() );
		const isOpen = $this.hasClass( 'show-text' ) ||
			$this.hasClass( 'open' ) ||
			$hiddenContent.hasClass( 'show-text-content' ) ||
			isOpenText;

		const isOpening = ! isOpen;

		if ( isOpening ) {
			$this.addClass( 'show-text open' );
			$hiddenContent.addClass( 'show-text-content' );
			updateElementText( $this, translations.open );
		} else {
			$this.removeClass( 'show-text open' );
			$hiddenContent.removeClass( 'show-text-content' );
			updateElementText( $this, translations.default );
		}

		if ( typeof ScrollTrigger !== 'undefined' ) {
			setTimeout( () => {
				ScrollTrigger.refresh();
			}, 200 );
		}
	} );
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

	// Таймеры для очистки
	let topShowTimer = null;
	let topHideTimer = null;

	// --- LOGIC 1: modal-top after 5 seconds, disappears after 10 ---
	const modalTopClosed = localStorage.getItem( 'modalTopClosed' ) === 'true';

	if ( ! modalTopClosed && modalTop ) {
		topShowTimer = setTimeout( () => {
			if ( ! modalTopShown && modalTop ) {
				showBanner( modalTop );
				modalTopShown = true;
				topHideTimer = setTimeout( () => {
					hideBanner( modalTop );
					localStorage.setItem( 'modalTopClosed', 'true' );
				}, 10000 );
			}
		}, 5000 );

		// Close button listener
		modalTop.addEventListener( 'click', ( e ) => {
			// Check if clicked element has 'close' or 'close-button' class or is a button with 'close'
			if ( e.target.closest( '.close' ) || e.target.closest( '.close-button' ) || e.target.closest( '.close-modal' ) || e.target.closest( '[data-modal-close]' ) ) {
				hideBanner( modalTop );
				localStorage.setItem( 'modalTopClosed', 'true' );
				if ( topHideTimer ) clearTimeout( topHideTimer );
			}
		} );
	}

	// Единый обработчик scroll для двух логик ниже
	let isScrolling = false;
	const onScroll = () => {
		if ( isScrolling ) return;
		isScrolling = true;

		requestAnimationFrame( () => {
			// --- LOGIC 2: brxe-wrkwxk between sound and mind ---
			if ( soundSection && mindSection && brxeWrkwxk ) {
				const soundTop = soundSection.getBoundingClientRect().top;
				const mindTop = mindSection.getBoundingClientRect().top;
				const windowHeight = window.innerHeight;
				if ( soundTop <= windowHeight && mindTop > 0 ) {
					showBanner( brxeWrkwxk );
				} else {
					hideBanner( brxeWrkwxk );
				}
			}
			// --- LOGIC 3: modal-form-one when scrolling at 95% ---
			const scrollPercentage =
				( document.documentElement.scrollTop + document.body.scrollTop ) /
				( document.documentElement.scrollHeight - document.documentElement.clientHeight ) * 100;

			if ( scrollPercentage >= 95 && ! modalFormOneShown && modalFormOne ) {
				showBanner( modalFormOne );
				modalFormOneShown = true;
			}
			isScrolling = false;
		} );
	};
	window.addEventListener( 'scroll', onScroll, { passive: true } );

	// Очистка ресурсов при уходе со страницы
	window.addEventListener( 'pagehide', () => {
		window.removeEventListener( 'scroll', onScroll );
		if ( topShowTimer ) clearTimeout( topShowTimer );
		if ( topHideTimer ) clearTimeout( topHideTimer );
	}, { once: true } );

	const locationText = getCookie( 'location_name' );
	if ( locationText ) {

		if ( locationHField.length ) {
			locationHField.val( locationText );
		}

		if ( langHField.length ) {
			langHField.val( getCookie( 'pll_language' ) || 'EN' );
		}

		$( '.location-wrapper .brx-submenu-toggle span' ).text( locationText );
	}

	$( '.location-wrapper .menu-item a' ).click( function( e ) {
		e.preventDefault();

		const location = $( this ).attr( 'location' );
		const locationName = $( this ).find( 'span' ).length ? $( this ).find( 'span' ).text() : $( this ).text();

		const date = new Date();
		date.setTime( date.getTime() + ( 7 * 24 * 60 * 60 * 1000 ) ); // 7 days
		document.cookie = `location=${location}; expires=${date.toUTCString()}; path=/`;
		document.cookie = `location_name=${encodeURIComponent( locationName )}; expires=${date.toUTCString()}; path=/`;

		document.location.reload();
	} );

	const welcomeModal = $( 'footer .brxe-welcome-modal' );
	const geoContent = $( '.geo-content-shortcode' );
	if ( welcomeModal.length && geoContent.length ) {
		const modalFlag = getCookie( 'welcome-modal' );
		const location = getCookie( 'location' );
		if ( ! modalFlag || ! location ) {
			welcomeModal.addClass( 'open' );
			welcomeModal.find( '[name="location"], [name="language"]' ).change( function( e ) {
				const $form = $( this ).closest( 'form' );
				const $locationInputs = $form.find( 'input[name="location"]' );
				const $languageInputs = $form.find( 'input[name="language"]' );

				if ( $( this ).attr( 'name' ) === 'location' ) {
					let location = $( this ).parent().find( 'label' ).text();
					const date = new Date();
					date.setTime( date.getTime() + ( 7 * 24 * 60 * 60 * 1000 ) ); // 7 days
					document.cookie = `location_name=${encodeURIComponent( location )}; expires=${date.toUTCString()}; path=/`;
				}

				if ( $locationInputs.is( ':checked' ) && $languageInputs.is( ':checked' ) ) {
					$form.submit();
				}
			} );

			welcomeModal.find( '.location-language-form' ).submit( function( e ) {
				e.preventDefault();

				const $form = $( this );
				const $locationInputs = $form.find( 'input[name="location"]' );
				const $languageInputs = $form.find( 'input[name="language"]' );

				$form.find( '.radio-button' ).removeClass( 'error' );

				let hasError = false;

				if ( ! $locationInputs.is( ':checked' ) ) {
					$locationInputs.first().closest( '.radio-button' ).addClass( 'error' );
					hasError = true;
				}

				if ( ! $languageInputs.is( ':checked' ) ) {
					$languageInputs.first().closest( '.radio-button' ).addClass( 'error' );
					hasError = true;
				}

				if ( hasError ) {
					return false;
				}

				const $submitBtn = $form.find( 'button[type="submit"]' );
				const data = $form.serialize();

				$submitBtn.prop( 'disabled', true ).css( 'opacity', '0.5' );

				$.ajax( {
					type: 'POST',
					url: appData.ajaxUrl,
					data: data,
					success: function( res ) {
						if ( res.success && res.data.redirect_url ) {
							window.location.href = res.data.redirect_url;
						} else {
							// Fallback if something went wrong
							$form.off( 'submit' ).submit();
						}
					},
					error: function( xhr ) {
						console.log( 'error...', xhr );
						// Fallback to standard form submission on error
						$form.off( 'submit' ).submit();
					}
				} );
			} );
		}

		welcomeModal.find( '.icon-close' ).click( function( e ) {
			e.preventDefault();
			welcomeModal.removeClass( 'open' );

			const data = {
				action: 'get_location',
			};

			$.ajax( {
				type: 'POST',
				url: appData.ajaxUrl,
				data: data,
				success: function( res ) {
					if ( res.success ) {
						$( '.location-wrapper .brx-submenu-toggle span' ).text( res.data.location );
					}
				},
				error: function( xhr ) {
					console.log( 'error...', xhr );
					//error logging
				}
			} );
		} );
	}
};

export default Modal;
