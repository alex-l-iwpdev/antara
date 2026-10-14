const FbEvents = ($)=>{
	const contact_btn = $( '.contact_btn, .footer-menu-link, .contact_data a' );
	if ( contact_btn.length ) {
		contact_btn.click( function() {
			fbq( 'track', 'Contact', [ { 'content_name': $( '[data-event_name]' ).data( 'event_name' )}] );
		} );
	}

	//View Content Event
	const fbContactView = $( '[data-event_name]' );
	if ( fbContactView.length ) {
		fbq( 'track', 'ViewContent', [ { 'content_name': fbContactView.data( 'event_name' )||'', 'content_category':fbContactView.data( 'event_category' )||''}] );
	}

	const fbInitiateCheckout = $( '.open-popup' );
	if ( fbInitiateCheckout.length ) {
		fbInitiateCheckout.click(function( e ){
			fbq( 'track', 'InitiateCheckout', [ { 'content_name': $( '[data-event_name]' ).data( 'event_name' )||''}] );
		})
	}

	const bfLead = $( '#gform_submit_button_5, #gform_submit_button_6' );
	if ( bfLead.length ) {
		bfLead.click(function( e ){
			fbq( 'track', 'Lead', [ { 'content_name': $( '[data-event_name]' ).data( 'event_name' )||''}] );
		});
	}
}

export default FbEvents;
