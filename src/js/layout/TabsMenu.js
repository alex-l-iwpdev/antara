const TabsMenu = ( $ ) => {
	// Find all the containers with tabs on the page
	const tabContainers = document.querySelectorAll( '.Tabs_menu-wrapper' );

	// Going through each container
	if ( tabContainers ) {
		tabContainers.forEach( ( container ) => {
			// Hang one event listener on the entire container (this is more efficient)
			container.addEventListener( 'click', ( event ) => {
				// Find the nearest parent with the .tab-title class
				// This will work even if the click fell on the text inside the tab
				const clickedTab = event.target.closest(
					'.Tabs-wrapper-menu-item.tab-title',
				);

				// If the click was not taboo, do nothing
				if ( ! clickedTab ) {
					return;
				}

				// The magic happens here ✨
				// Ask the browser to smoothly scroll the element to the center of the visible area
				clickedTab.scrollIntoView( {
					behavior: 'smooth', // Smooth animation
					block: 'nearest', // Don't scroll vertically if you don't have to
					inline: 'center', // Center Horizontal
				} );
			} );
		} );
	}
};

export default TabsMenu;
