import gsap from 'gsap';

const Scroll = ( $ ) => {
	// Простая проверка на мобильное устройство: отключаем тяжелую карусель
	const isMobile = ( typeof window !== 'undefined' && window.innerWidth <= 768 ) || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test( navigator.userAgent );
	if ( isMobile ) {
		console.log('[Scroll] Отключено на мобильных устройствах для оптимизации');
		return;
	}
	const mod = ( n, m ) => ( ( n % m ) + m ) % m;

	const initScrollBasedScroller = () => {
		const scrollers = document.querySelectorAll( '.scroller' );
		console.log( `Scroll: Found ${scrollers.length} scrollers` );

		scrollers.forEach( ( scroller, index ) => {
			if ( scroller.dataset.initialized ) {
				return;
			}
			console.log( `Scroll: Initializing scroller ${index}` );
			scroller.dataset.initialized = 'true';

			const wrapper = scroller.querySelector( '.scroller-wrapper' );
			if ( ! wrapper ) {
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
				const maxTotalWidth = Math.max( minTotalWidth, containerWidth * 5 ); // Защитный лимит

				if ( ! unitWidth || unitWidth < 5 ) {
				} else {
					let guard = 0;
					let lastTotalWidth = totalWidth;
					let clonesSetsAdded = 0;
					const maxSets = 20; // Максимум 20 повторений набора элементов

					while ( totalWidth < minTotalWidth && totalWidth < maxTotalWidth ) {
						if ( guard++ > 100 ) {
							break;
						}
						if ( clonesSetsAdded >= maxSets ) {
							break;
						}

						items.forEach( ( item ) => {
							const cloneEnd = item.cloneNode( true );
							cloneEnd.classList.add( 'scroller-clone' );
							processClone( cloneEnd );
							wrapper.appendChild( cloneEnd );
						} );

						clonesSetsAdded++;
						const newTotal = wrapper.scrollWidth;
						if ( newTotal <= lastTotalWidth ) {
							break;
						}
						totalWidth = newTotal;
						lastTotalWidth = newTotal;
					}
				}
			}

			// === Полностью переписанная анимация ===
			let lastScrollTop = window.scrollY;
			let unit = unitWidth;
			let pos = 0;
			let momentum = 0;
			let currentVelocity = 1.0;
			const baseSpeedPx = 1.0;
			const speedFactor = 0.05; // Было 0.1, уменьшаем в 2 раза
			const maxMomentum = 5.0;  // Максимальный добавочный импульс (примерно в 5 раз быстрее базы)

			const onScroll = () => {
				const st = window.scrollY;
				let delta = st - lastScrollTop;
				lastScrollTop = st;

				const maxDelta = 80; // Снижаем максимальную дельту
				if ( Math.abs( delta ) > maxDelta ) delta = maxDelta * Math.sign( delta );

				momentum += delta * speedFactor;

				// Ограничиваем импульс, чтобы карусель не улетала
				if ( Math.abs( momentum ) > maxMomentum ) {
					momentum = maxMomentum * Math.sign( momentum );
				}
			};
			window.addEventListener( 'scroll', onScroll, { passive: true } );

			const xSetter = gsap.quickSetter( wrapper, 'x', 'px' );

			let docVisible = document.visibilityState === 'visible';
			let inView = true;
			const onVisibility = () => {
				docVisible = document.visibilityState === 'visible';
			};
			document.addEventListener( 'visibilitychange', onVisibility );

			const io = new IntersectionObserver( ( entries ) => {
				entries.forEach( ( entry ) => {
					if ( entry.target === scroller ) inView = entry.isIntersecting;
				} );
			} );
			io.observe( scroller );

			const update = () => {
				if ( ! ( docVisible && inView ) ) return;
				if ( ! unit ) {
					unit = getUnitWidth();
					console.log( 'Scroll: update unit width:', unit );
					if ( ! unit ) return;
				}
				const dt = gsap.ticker.deltaRatio();

				// Плавная интерполяция скорости
				const targetVelocity = baseSpeedPx + momentum;
				currentVelocity += ( targetVelocity - currentVelocity ) * 0.08 * dt; // Снижено с 0.1 до 0.08 для большей инерции и плавности

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
				momentum *= Math.pow( 0.85, dt ); // Более интенсивное затухание (было 0.9)
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
			const onResize = () => {
				recalc();
			};
			window.addEventListener( 'resize', onResize );

			// Cleanup listeners and ticker on page hide
			const cleanup = () => {
				gsap.ticker.remove( update );
				document.removeEventListener( 'visibilitychange', onVisibility );
				try {
					io.disconnect();
				} catch ( e ) {
				}
				try {
					ro.disconnect();
				} catch ( e ) {
				}
				window.removeEventListener( 'scroll', onScroll );
				window.removeEventListener( 'resize', onResize );
			};
			window.addEventListener( 'pagehide', cleanup, { once: true } );
			window.addEventListener( 'beforeunload', cleanup, { once: true } );
		} );
	};

	initScrollBasedScroller();
};

export default Scroll;
