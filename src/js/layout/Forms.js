const Forms = ( $ ) => {
	const formsEl = document.querySelectorAll( '.form-group' );

	if ( formsEl ) {
		formsEl.forEach( ( group ) => {
			const input = group.querySelector( 'input' );
			const label = group.querySelector( 'label' );

			if ( ! input || ! label ) {
				return;
			}

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

			updateLabel();
		} );
	}

};

export default Forms;
