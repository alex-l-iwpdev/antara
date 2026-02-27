const GeoContent = ( $ ) => {
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

export default GeoContent;
