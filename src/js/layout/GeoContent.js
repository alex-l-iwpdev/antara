const GeoContent = ( $ ) => {
	const initGeo = () => {
		const geoContent = $( '.geo-content-shortcode' );
		if ( geoContent.length ) {
			let dataID = [];
			geoContent.map( function( i, el ) {
				dataID.push( $( el ).data( 'id' ) );
			} );

			const data = {
				action: appData.actionGeo,
				nonce: appData.nonceGeo,
				ids: dataID,
				country: appData.country || 'BE',
			};

			$.ajax( {
				type: 'POST',
				url: appData.ajaxUrl,
				data: data,
				cache: false,
				success: function( res ) {
					if ( res.success && res.data ) {
						res.data.forEach( function( item ) {
							$( '.geo-content-shortcode[data-id="' + item.id + '"]' ).html( item.content );
						} );
					}
				},
				error: function( xhr ) {
					console.log( 'error...', xhr );
					//error logging
				}
			} );
		}
	};

	// Откладываем тяжелый AJAX запрос, чтобы не блокировать загрузку страницы
	if ( window.innerWidth <= 768 ) {
		setTimeout( initGeo, 2000 );
	} else {
		initGeo();
	}

	const geoContentMobile = $( '.open-popup' );
	if(geoContentMobile.length){
		geoContentMobile.on('click', function(e){
			e.preventDefault();

			geoContentMobile.parent().find('.popup-cal').show();
		})
	}

	const closePopup = $( '.close-popup' );
	if(closePopup.length){
		closePopup.on('click', function(e){
			e.preventDefault();

			geoContentMobile.parent().parent().find('.popup-cal').hide();
		})
	}
};

export default GeoContent;
