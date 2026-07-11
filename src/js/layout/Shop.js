const Shop = ( $ ) => {
	// Opening a card
	const shopListItemsLink = document.querySelectorAll( '.shop-list-item-link' );
	if ( shopListItemsLink ) {
		shopListItemsLink.forEach( ( link ) => {
			link.addEventListener( 'click', ( e ) => {
				e.preventDefault();

				const item = link.closest( '.shop-list-item' );
				const openBlock = item.querySelector( '.shop-list-item-open' );

				if ( openBlock ) {
					openBlock.style.display = 'flex';
					openBlock.style.opacity = '0';
					openBlock.style.transition = 'opacity 0.4s ease';

					requestAnimationFrame( () => {
						openBlock.style.opacity = '1';
					} );
				}
			} );
		} );
	}

	const shopListItemClose = document.querySelectorAll( '.shop-list-item-close' );

	if ( shopListItemClose ) {
		shopListItemClose.forEach( ( closeBtn ) => {
			closeBtn.addEventListener( 'click', ( e ) => {
				e.preventDefault();

				const item = closeBtn.closest( '.shop-list-item' );
				const openBlock = item.querySelector( '.shop-list-item-open' );

				if ( openBlock ) {
					openBlock.style.transition = 'opacity 0.4s ease';
					openBlock.style.opacity = '0';

					// After the animation is completed (after 400ms) hide
					setTimeout( () => {
						openBlock.style.display = 'none';
					}, 400 );
				}
			} );
		} );
	}

	const items = document.querySelectorAll( '.shop-list-item' );
	const imgs = document.querySelectorAll( '.shop-conent-img' );

	// Show the first product-img by default
	if ( imgs.length ) {
		imgs[ 0 ].classList.add( 'active' );
	}

	items.forEach( ( item ) => {
		item.addEventListener( 'mouseenter', () => {
			const product = item.getAttribute( 'product' );

			imgs.forEach( ( img ) => {
				if ( img.getAttribute( 'product-img' ) === product ) {
					img.classList.add( 'active' );
				} else {
					img.classList.remove( 'active' );
				}
			} );
		} );
	} );
};

export default Shop;
