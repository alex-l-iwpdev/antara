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
							const targets = $( '.geo-content-shortcode[data-id="' + item.id + '"]' );
							targets.each( ( i, el ) => {
								let content = item.content;
								if ( content.includes( 'id="#' ) ) {
									content = content.replace( /id="#([^"]+)"/g, 'id="$1"' );
								}
								$( el ).html( content );
							} );
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

	if ( window.innerWidth <= 768 ) {
		if ( window.requestIdleCallback ) {
			window.requestIdleCallback( () => setTimeout( initGeo, 1000 ) );
		} else {
			setTimeout( initGeo, 2000 );
		}
	} else {
		initGeo();
	}

	$( document ).on( 'click', '.open-popup', function( e ) {
		e.preventDefault();
		$( this ).parent().find( '.popup-cal' ).show();
	} );

	$( document ).on( 'click', '#close-popup', function( e ) {
		e.preventDefault();
		$( this ).closest( '.popup-cal' ).hide();
	} );
};

export default GeoContent;
