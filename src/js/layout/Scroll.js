import gsap from 'gsap';

const Scroll = ( $ ) => {
	const mod = ( n, m ) => ( ( n % m ) + m ) % m;

	const initScrollBasedScroller = () => {
		const scrollers = document.querySelectorAll( '.scroller' );
		console.log( 'Scroll.js: Найдено скроллеров:', scrollers.length );

		scrollers.forEach( ( scroller, index ) => {
			console.log( `Scroll.js [${index}]: Инициализация...` );
			if ( scroller.dataset.initialized ) {
				console.log( `Scroll.js [${index}]: Уже инициализирован.` );
				return;
			}
			scroller.dataset.initialized = 'true';

			const wrapper = scroller.querySelector( '.scroller-wrapper' );
			if ( ! wrapper ) {
				console.error( `Scroll.js: Скроллер ${index} не имеет .scroller-wrapper` );
				return;
			}

			// Отключаем нативную анимацию Bricks и конфликтующие стили
			scroller.removeAttribute( 'data-animated' );
			scroller.classList.remove( 'bricks-animated' ); // На всякий случай
			scroller.style.setProperty( '--_animation-state', 'paused', 'important' );

			// Принудительные стили для контейнера и враппера
			scroller.style.overflow = 'hidden';
			scroller.style.position = 'relative';

			wrapper.style.display = 'flex';
			wrapper.style.flexWrap = 'nowrap';
			wrapper.style.willChange = 'transform';
			wrapper.style.setProperty( 'transition', 'none', 'important' );
			wrapper.style.setProperty( 'animation', 'none', 'important' ); // Блокируем CSS анимацию
			wrapper.style.setProperty( 'scroll-behavior', 'auto', 'important' );

			// <--- NEW: Убираем <noscript> теги, чтобы не мешали ---
			wrapper.querySelectorAll( 'noscript' ).forEach( ns => ns.remove() );

			// Сначала очищаем старые клоны, чтобы в items попали только оригиналы
			wrapper.querySelectorAll( '.scroller-clone' ).forEach( el => el.remove() );

			const items = Array.from( wrapper.children );
			if ( items.length === 0 ) return;

			// Принудительно отключаем сжатие оригинальных элементов
			items.forEach( item => item.style.flexShrink = '0' );

			const processClone = ( clone ) => {
				clone.style.flexShrink = '0';
				const img = clone.querySelector( 'img' );
				if ( img ) {
					if ( img.dataset.src ) img.src = img.dataset.src;
					if ( img.dataset.srcset ) img.srcset = img.dataset.srcset;
					img.classList.remove( 'lazyload', 'lazyloading' );
					img.classList.add( 'lazyloaded' );
				}
			};

			// Helper: точная ширина оригинального блока с учетом column-gap
			const getUnitWidth = () => {
				const style = getComputedStyle( wrapper );
				const gap = parseFloat( style.columnGap ) || 0;
				let sum = 0;
				items.forEach( el => {
					sum += el.offsetWidth;
				} );
				return sum + gap * items.length;
			};

			// === Добавляем дубли в начало и конец ===
			const containerWidth = scroller.offsetWidth || window.innerWidth;

			// Сохраняем ширину оригинального контента (unit)
			let unitWidth = getUnitWidth();

			console.log( `Scroll.js [${index}]: Начальная ширина (unit):`, unitWidth, 'Контейнер:', containerWidth );

			if ( items.length > 0 ) {
				// Один набор клонов в начало (нужен для бесшовности при x = -unit)
				items.slice().reverse().forEach( ( item ) => {
					const cloneStart = item.cloneNode( true );
					cloneStart.classList.add( 'scroller-clone' );
					processClone( cloneStart );
					wrapper.insertBefore( cloneStart, wrapper.firstChild );
				} );

				// Клонируем в конец, пока суммарная ширина не покроет нужный диапазон (2*unit + containerWidth)
				let totalWidth = wrapper.scrollWidth;
				const minTotalWidth = unitWidth * 2 + containerWidth;

				while ( totalWidth < minTotalWidth ) {
					items.forEach( ( item ) => {
						const cloneEnd = item.cloneNode( true );
						cloneEnd.classList.add( 'scroller-clone' );
						processClone( cloneEnd );
						wrapper.appendChild( cloneEnd );
					} );
					totalWidth = wrapper.scrollWidth;
				}
			}

			// === Полностью переписанная анимация ===
			let lastScrollTop = window.scrollY;
			let unit = unitWidth;
			let pos = 0;
			let momentum = 0;
			let currentVelocity = 1.0;
			const baseSpeedPx = 1.0;
			const speedFactor = 0.1;

			window.addEventListener( 'scroll', () => {
				const st = window.scrollY;
				let delta = st - lastScrollTop;
				lastScrollTop = st;

				const maxDelta = 100;
				if ( Math.abs( delta ) > maxDelta ) delta = maxDelta * Math.sign( delta );

				momentum += delta * speedFactor;
			}, { passive: true } );

			const xSetter = gsap.quickSetter( wrapper, 'x', 'px' );

			const update = () => {
				if ( ! unit ) {
					unit = getUnitWidth();
					if ( ! unit ) return;
				}
				const dt = gsap.ticker.deltaRatio();

				// Плавная интерполяция скорости
				const targetVelocity = baseSpeedPx + momentum;
				currentVelocity += ( targetVelocity - currentVelocity ) * 0.1 * dt;

				// Обновляем позицию (двигаемся влево, поэтому вычитаем)
				pos += currentVelocity * dt;

				// Зацикливание
				if ( pos >= unit ) {
					pos -= unit;
				} else if ( pos < 0 ) {
					pos += unit;
				}

				// x = -unit (начало оригинального блока) - pos
				xSetter( -unit - pos );

				// Декей импульса
				momentum *= Math.pow( 0.9, dt );

				if ( gsap.ticker.frame % 300 === 0 && index === 0 ) {
					console.log( `Scroll.js [0]: unit=${unit.toFixed( 1 )}, pos=${pos.toFixed( 1 )}, v=${currentVelocity.toFixed( 2 )}` );
				}
			};

			gsap.ticker.add( update );

			// Runtime-пересчет, когда размеры контента меняются (картинки/шрифты)
			const recalc = () => {
				const newUnit = getUnitWidth();
				if ( newUnit && Math.abs( newUnit - unit ) > 1 ) {
					// Корректируем pos, чтобы избежать прыжка при изменении ширины
					pos = mod( pos + ( unit - newUnit ), newUnit );
					unit = newUnit;
				}
			};

			const ro = new ResizeObserver( recalc );
			try {
				ro.observe( wrapper );
			} catch ( e ) {
			}
			wrapper.querySelectorAll( 'img' ).forEach( img => {
				if ( ! img.complete ) {
					img.addEventListener( 'load', recalc, { once: true } );
					if ( 'decode' in img ) img.decode().catch( () => {
					} );
				}
			} );

			// Пересчет при изменении размера окна
			window.addEventListener( 'resize', () => {
				recalc();
			} );
		} );
	};

	initScrollBasedScroller();
};

export default Scroll;
