const Tabs = ( $ ) => {
	// Choosing all tab wrappers
	const tabWrappers = document.querySelectorAll( '.services_tabs_wrapp' );

	tabWrappers.forEach( wrapper => {
		const tabTitles = wrapper.querySelectorAll( '.tab-title' );
		const tabPanes = wrapper.querySelectorAll( '.tab-pane' );
		const serviceButtons = wrapper.querySelectorAll( '.btn-primary[services-btn]' );

		tabTitles.forEach( title => {
			title.addEventListener( 'click', function() {
				const serviceType = this.getAttribute( 'services' );

				// Removing the activity class from all tabs and content
				tabTitles.forEach( t => {
					t.classList.remove( 'brx-open' );
					t.setAttribute( 'aria-selected', 'false' );
					t.setAttribute( 'tabindex', '-1' );
				} );
				tabPanes.forEach( p => {
					p.classList.remove( 'brx-open' );
					p.setAttribute( 'tabindex', '-1' );
				} );

				// Adding an activity class to the current taboo and its content
				this.classList.add( 'brx-open' );
				this.setAttribute( 'aria-selected', 'true' );
				this.setAttribute( 'tabindex', '0' );

				const targetPane = wrapper.querySelector( `.tab-pane[aria-labelledby="${this.id}"]` );
				if ( targetPane ) {
					targetPane.classList.add( 'brx-open' );
					targetPane.setAttribute( 'tabindex', '0' );
				}

				// Hiding all buttons
				serviceButtons.forEach( btn => {
					btn.style.display = 'none';
				} );

				// Showing the necessary buttons (all that match the serviceType)
				const targetButtons = wrapper.querySelectorAll( `.btn-primary[services-btn="${serviceType}"]` );
				targetButtons.forEach( btn => {
					btn.style.display = 'flex'; // Use 'flex' like you have in HTML
				} );

			} );
		} );

		// Initialization: showing buttons for an active tab when loading a page
		const initialOpenTab = wrapper.querySelector( '.tab-title.brx-open' );
		if ( initialOpenTab ) {
			const initialServiceType = initialOpenTab.getAttribute( 'services' );
			serviceButtons.forEach( btn => {
				btn.style.display = 'none';
			} );
			const initialButtons = wrapper.querySelectorAll( `.btn-primary[services-btn="${initialServiceType}"]` ); // И тут тоже меняем на querySelectorAll
			initialButtons.forEach( btn => {
				btn.style.display = 'flex';
			} );
		} else {
			// If there is no tab, hide all buttons
			serviceButtons.forEach( btn => {
				btn.style.display = 'none';
			} );
		}
	} );
};

export default Tabs;
