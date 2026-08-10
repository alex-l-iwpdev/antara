const Forms = ( $ ) => {
	$('.footer-email').click(function(){
		$('.gfield--type-name').removeClass('name-hidden'); 
	});
	console.log('[data-button_text]')
	// Предотвращаем повторную инициализацию
	const body = document.body;
	if ( body && body.dataset.formsInitialized === 'true' ) return;
	if ( body ) body.dataset.formsInitialized = 'true';

	const cleanups = [];
	if($('select').length){
		$('select').selectric({
			maxHeight: 368,
		}); 
	}
	document.querySelectorAll( '.form-group' ).forEach( ( group ) => { 
		console.log(group);
		const input = group.querySelector( 'input' );
		const label = group.querySelector( 'label' );
		if ( ! input || ! label ) return;

		const updateLabel = () => {
			if ( document.activeElement === input || input.value.trim() !== '' ) {
				label.classList.add( 'floating' );
			} else {
				label.classList.remove( 'floating' );
			}
		};

		input.addEventListener( 'focus', updateLabel );
		input.addEventListener( 'blur', updateLabel );
		input.addEventListener( 'input', updateLabel );
		cleanups.push( () => {
			input.removeEventListener( 'focus', updateLabel );
			input.removeEventListener( 'blur', updateLabel );
			input.removeEventListener( 'input', updateLabel );
		} );

		updateLabel();
	} );

	window.addEventListener( 'pagehide', () => {
		cleanups.forEach( ( fn ) => {
			try {
				fn();
			} catch ( e ) {
			}
		} );
	}, { once: true } );
	const input = $('[class*="gfield--input-"]:not(.select) input, [class^="gfield--input-"]:not(.select) input, .textarea textarea') 
	if ( input.length ) {
		input.focus( function() {
			$( this ).parents('[class*="gfield--input-"]:not(.select), .textarea').addClass( 'focus' );
		} );
		input.blur( function() {
			if ( $( this ).val().length === 0 ) {
				$( this ).parents('[class*="gfield--input-"]:not(.select), .textarea').removeClass( 'focus' );
			}
		} );
		input.each( function() {
			if ( $( this ).val().length === 0 ) {
				$( this ).parents('[class*="gfield--input-"]:not(.select)w, .textarea').removeClass( 'focus' );
			} else {
				$( this ).parents('[class*="gfield--input-"]:not(.select), .textarea').addClass( 'focus' );
			}
		} );
	}

	
};

export default Forms;
