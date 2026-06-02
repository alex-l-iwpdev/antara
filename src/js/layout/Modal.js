const Modal = ( $ ) => {
	// Предотвращаем двойную инициализацию
	const body = document.body;
	if ( body && body.dataset.modalInitialized === 'true' ) return;
	if ( body ) body.dataset.modalInitialized = 'true';

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

	$('.read-more').click(function(e) {
		e.preventDefault();
		if($(this).find('.fas').hasClass('fa-plus')){
			$(this).find('.fas').removeClass('fa-plus').addClass('fa-minus');
			$(this).parent().parent().find('.hidden-text').slideDown();
		}else{
			$(this).find('.fas').removeClass('fa-minus').addClass('fa-plus');
			$(this).parent().parent().find('.hidden-text').slideUp();
		}
	});
	$('.read-more-next').click(function(e) {
		e.preventDefault();
		if($(this).find('.fas').hasClass('fa-plus')){
			$(this).find('.fas').removeClass('fa-plus').addClass('fa-minus');
			$(this).next().slideDown();
		}else{
			$(this).find('.fas').removeClass('fa-minus').addClass('fa-plus');
			$(this).next().slideUp();
		}
	});
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

	const welcomeModal = $( '.page-id-1068 footer .brxe-welcome-modal' );
	if ( welcomeModal.length ) {
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
