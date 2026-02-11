const Forms = ( $ ) => {
	// Предотвращаем повторную инициализацию
	const body = document.body;
	if ( body && body.dataset.formsInitialized === 'true' ) return;
	if ( body ) body.dataset.formsInitialized = 'true';

	const cleanups = [];

	document.querySelectorAll( '.form-group' ).forEach( ( group ) => {
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
};

export default Forms;
