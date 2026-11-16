import { ScrollTrigger } from 'gsap/ScrollTrigger';

const EventPage = ( $ ) => {
	const locationSelect = document.getElementById( 'location' );
	const eventSelect = document.getElementById( 'event-type' );
	const hasFilterBtns = document.querySelector( '.filter-btn' );

	if ( ! locationSelect && ! eventSelect && ! hasFilterBtns && ! document.querySelector( '[data-location], [data-event], .event-items' ) ) {
		return;
	}

	const normalize = ( value ) => ( value || '' ).toString().trim().toLowerCase();

	const ALL_VALUES = [ '', 'all', '*', 'any', 'alle', 'tous', 'tout', 'toutes' ];

	// Возвращает объект с выбранным значением или null, если выбрано "все"
	const getFilterData = ( select ) => {
		if ( ! select || select.selectedIndex < 0 ) {
			return null;
		}

		const option = select.options[ select.selectedIndex ];
		const value = normalize( select.value );
		const text = normalize( option?.textContent );

		if ( ! option || option.disabled || ALL_VALUES.includes( value ) || ALL_VALUES.includes( text ) ) {
			return null;
		}

		return {
			value,
			text,
			option,
		};
	};

	const matchFilter = ( itemValRaw, filterData ) => {
		if ( ! filterData ) {
			return true;
		}

		const itemVal = normalize( itemValRaw );
		if ( ! itemVal ) {
			return false;
		}

		const filterVal = filterData.value;
		const filterText = filterData.text;

		if ( itemVal === filterVal || itemVal === filterText ) {
			return true;
		}

		const parts = itemVal.split( /[,|\s]+/ ).map( ( s ) => s.trim() ).filter( Boolean );
		if ( parts.includes( filterVal ) || parts.includes( filterText ) ) {
			return true;
		}

		if ( filterVal && ( itemVal.includes( filterVal ) || filterVal.includes( itemVal ) ) ) {
			return true;
		}

		if ( filterText && ( itemVal.includes( filterText ) || filterText.includes( itemVal ) ) ) {
			return true;
		}

		return false;
	};

	const syncFilterButtons = ( activeOption ) => {
		const evEl = document.getElementById( 'event-type' ) || document.querySelector( 'select[name="event-type"]' ) || eventSelect;
		const filterData = activeOption || getFilterData( evEl );

		$( '.filter-btn' ).each( function () {
			const $btn = $( this );
			const target = normalize(
				$btn.attr( 'data-target' ) ||
				$btn.data( 'target' ) ||
				$btn.attr( 'data-event' ) ||
				$btn.attr( 'data-filter' ) ||
				$btn.attr( 'data-value' ) ||
				$btn.text(),
			);

			if ( ! filterData ) {
				$btn.toggleClass( 'active', ALL_VALUES.includes( target ) );
			} else {
				const isMatch = (
					target === filterData.value ||
					target === filterData.text ||
					( target && filterData.value.includes( target ) ) ||
					( target && filterData.text.includes( target ) ) ||
					( target && target.includes( filterData.value ) )
				);
				$btn.toggleClass( 'active', isMatch );
			}
		} );
	};

	const applyFilters = () => {
		const locEl = document.getElementById( 'location' ) || document.querySelector( 'select[name="location"]' ) || locationSelect;
		const evEl = document.getElementById( 'event-type' ) || document.querySelector( 'select[name="event-type"]' ) || eventSelect;

		const locationData = getFilterData( locEl );
		const eventData = getFilterData( evEl );

		const items = document.querySelectorAll( '[data-location], [data-event]' );

		items.forEach( ( item ) => {
			let visible = true;

			if ( locationData && item.hasAttribute( 'data-location' ) ) {
				visible = visible && matchFilter( item.dataset.location || item.getAttribute( 'data-location' ), locationData );
			}

			if ( eventData && item.hasAttribute( 'data-event' ) ) {
				visible = visible && matchFilter( item.dataset.event || item.getAttribute( 'data-event' ), eventData );
			}

			item.style.display = visible ? 'block' : 'none';
		} );

		// Проверка видимости карточек в контейнерах .event-items и управление блоком .no-events
		const eventContainers = document.querySelectorAll( '.event-items' );
		if ( eventContainers.length > 0 ) {
			eventContainers.forEach( ( container ) => {
				const containerItems = container.querySelectorAll( '.event-item, [data-location], [data-event]' );
				const hasVisible = Array.from( containerItems ).some( ( item ) => item.style.display !== 'none' );

				let noEventsElements = [];
				if ( container.parentElement ) {
					noEventsElements = Array.from( container.parentElement.querySelectorAll( '.no-events' ) );
				}
				if ( ! noEventsElements.length && container.nextElementSibling?.classList?.contains( 'no-events' ) ) {
					noEventsElements = [ container.nextElementSibling ];
				}
				if ( ! noEventsElements.length ) {
					noEventsElements = Array.from( document.querySelectorAll( '.no-events' ) );
				}

				noEventsElements.forEach( ( noEventsEl ) => {
					noEventsEl.style.display = hasVisible ? 'none' : 'flex';
				} );
			} );
		} else {
			const allItems = document.querySelectorAll( '.event-item, [data-location], [data-event]' );
			if ( allItems.length > 0 ) {
				const hasVisible = Array.from( allItems ).some( ( item ) => item.style.display !== 'none' );
				document.querySelectorAll( '.no-events' ).forEach( ( noEventsEl ) => {
					noEventsEl.style.display = hasVisible ? 'none' : 'flex';
				} );
			}
		}

		syncFilterButtons( eventData );

		try {
			ScrollTrigger?.refresh?.();
		} catch ( err ) {
			// ignore
		}
	};

	const setEventTypeFilter = ( targetRaw ) => {
		const evEl = document.getElementById( 'event-type' ) || document.querySelector( 'select[name="event-type"]' ) || eventSelect;
		if ( ! evEl ) {
			return false;
		}

		const target = normalize( targetRaw );
		if ( ! target ) {
			return false;
		}

		const options = Array.from( evEl.options || [] );
		let option = null;

		if ( ALL_VALUES.includes( target ) ) {
			option = options.find(
				( opt ) => ALL_VALUES.includes( normalize( opt.value ) ) || ALL_VALUES.includes( normalize( opt.textContent ) ),
			) || options[0];
		} else {
			option =
				options.find( ( opt ) => normalize( opt.value ) === target ) ||
				options.find( ( opt ) => normalize( opt.textContent ) === target ) ||
				options.find( ( opt ) => normalize( opt.dataset?.target ) === target ) ||
				options.find( ( opt ) => normalize( opt.dataset?.event ) === target ) ||
				options.find( ( opt ) => normalize( opt.value ) && ( normalize( opt.value ).includes( target ) || target.includes( normalize( opt.value ) ) ) ) ||
				options.find( ( opt ) => normalize( opt.textContent ) && ( normalize( opt.textContent ).includes( target ) || target.includes( normalize( opt.textContent ) ) ) );
		}

		if ( ! option ) {
			return false;
		}

		// Устанавливаем значение в нативном селекте
		evEl.value = option.value;
		options.forEach( ( opt, idx ) => {
			opt.selected = ( idx === option.index );
			if ( idx === option.index ) {
				opt.setAttribute( 'selected', 'selected' );
			} else {
				opt.removeAttribute( 'selected' );
			}
		} );
		evEl.selectedIndex = option.index;

		const $select = $( evEl );
		$select.val( option.value );
		$select.prop( 'selectedIndex', option.index );

		// Обновляем Selectric
		if ( typeof $select.selectric === 'function' ) {
			try {
				$select.selectric( 'refresh' );
			} catch ( err ) {
				// fallback
			}
		}

		const $wrapper = $select.closest( '.selectric-wrapper' );
		if ( $wrapper.length ) {
			$wrapper.find( '.label' ).text( ( option.textContent || option.value ).trim() );
			$wrapper.find( '.selectric-items li' ).removeClass( 'selected highlighted' );
			$wrapper.find( `.selectric-items li[data-index="${ option.index }"]` ).addClass( 'selected highlighted' );
		}

		// Вызываем события change и запускаем фильтрацию
		$select.trigger( 'change' );
		try {
			evEl.dispatchEvent( new Event( 'change', { bubbles: true } ) );
		} catch ( err ) {
			// ignore
		}

		applyFilters();
		return true;
	};

	const onFilterBtnClick = ( e ) => {
		const btn = e.target.closest( '.filter-btn, [data-target]' );
		if ( ! btn ) {
			return;
		}

		const targetRaw =
			btn.getAttribute( 'data-target' ) ||
			$( btn ).data( 'target' ) ||
			btn.getAttribute( 'data-event' ) ||
			btn.getAttribute( 'data-filter' ) ||
			btn.getAttribute( 'data-value' ) ||
			btn.textContent ||
			'';

		if ( targetRaw ) {
			setEventTypeFilter( targetRaw );
		}
	};


	$( document )
		.off( 'change.eventPage' )
		.on( 'change.eventPage', '#location, #event-type, select[name="location"], select[name="event-type"]', applyFilters );

	// Кнопки .filter-btn[data-target] обрабатываем в capture-фазе и через делегирование
	document.addEventListener( 'click', onFilterBtnClick, true );

	$( document )
		.off( 'click.eventPage' )
		.on( 'click.eventPage', '.filter-btn', function ( e ) {
			onFilterBtnClick( e );
		} );

	applyFilters();
};

export default EventPage;
