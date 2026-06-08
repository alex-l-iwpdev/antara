const Video = ( $ ) => {
	const videoWrapper = document.getElementById( 'brxe-ncokqr' );
	if ( ! videoWrapper ) {
		console.log( '[Video] Видео-обертка с ID brxe-ncokqr не найдена' );
		return;
	}

	const video = videoWrapper.querySelector( 'video' );
	if ( ! video ) {
		console.log( '[Video] Элемент <video> внутри #brxe-ncokqr не найден' );
		return;
	}

	// Простая проверка на мобильное устройство
	const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test( navigator.userAgent ) || ( window.innerWidth <= 768 );

	console.log( `[Video] Обнаружено устройство: ${ isMobile ? 'Мобильное' : 'Десктоп' }` );

	if ( isMobile ) {
		console.log( '[Video] Попытка принудительного запуска видео на мобильном...' );

		// Получаем ассеты
		const assets = window.videoAssets || ( typeof appData !== 'undefined' ? appData.videoAssets : null );

		// Принудительная настройка атрибутов для мобильного Safari
		const forceSetup = () => {
			video.setAttribute( 'muted', '' );
			video.setAttribute( 'playsinline', '' );
			video.setAttribute( 'webkit-playsinline', '' );
			video.setAttribute( 'autoplay', '' );
			video.setAttribute( 'loop', '' );
			video.muted = true;
			video.playsInline = true;

			// Стили для гарантированной видимости
			videoWrapper.style.setProperty('display', 'block', 'important');
			videoWrapper.style.setProperty('position', 'absolute', 'important');
			videoWrapper.style.setProperty('top', '0', 'important');
			videoWrapper.style.setProperty('left', '0', 'important');
			videoWrapper.style.setProperty('width', '100%', 'important');
			videoWrapper.style.setProperty('height', '100%', 'important');
			videoWrapper.style.setProperty('z-index', '1', 'important');
			videoWrapper.style.setProperty('pointer-events', 'none', 'important');

			video.style.setProperty('width', '100%', 'important');
			video.style.setProperty('height', '100%', 'important');
			video.style.setProperty('object-fit', 'cover', 'important');

			// Bricks может скрывать видео через этот класс или data-src
			video.classList.remove('bricks-lazy-hidden');

			if ( assets && assets.mobile_video ) {
				const currentSrc = video.currentSrc || video.src;
				const mobileSrc = assets.mobile_video;

				if ( ! currentSrc.includes( mobileSrc ) ) {
					console.log( '[Video] Установка мобильного источника' );
					video.src = mobileSrc;
					if ( assets.mobile_poster ) {
						video.poster = assets.mobile_poster;
					}
					video.load();
				}
			} else if (video.hasAttribute('data-src') && !video.src) {
				// Если ассетов нет, но есть data-src от Bricks
				console.log( '[Video] Установка src из data-src' );
				video.src = video.getAttribute('data-src');
				video.load();
			}
		};

		forceSetup();

		const playVideo = () => {
			console.log( '[Video] Вызов video.play()' );
			const playPromise = video.play();

			if ( playPromise !== undefined ) {
				playPromise.then( () => {
					console.log( '[Video] Видео успешно запущено' );
					// После запуска устанавливаем opacity в 1 по просьбе пользователя
					setTimeout(() => {
						videoWrapper.style.setProperty('opacity', '1', 'important');
						videoWrapper.style.setProperty('visibility', 'visible', 'important');
						console.log( '[Video] Opacity установлено в 1 после запуска' );
					}, 500);
				} ).catch( ( error ) => {
					console.warn( '[Video] Ошибка автоплея:', error );

					const startOnInteraction = () => {
						console.log( '[Video] Запуск по клику/тапу' );
						video.play().then( () => {
							// После запуска устанавливаем opacity в 1 по просьбе пользователя
							setTimeout(() => {
								videoWrapper.style.setProperty('opacity', '1', 'important');
								videoWrapper.style.setProperty('visibility', 'visible', 'important');
								console.log( '[Video] Opacity установлено в 1 после взаимодействия' );
							}, 500);
							document.removeEventListener( 'click', startOnInteraction );
							document.removeEventListener( 'touchstart', startOnInteraction );
						} );
					};
					document.addEventListener( 'click', startOnInteraction );
					document.addEventListener( 'touchstart', startOnInteraction );
				} );
			}
		};

		// Пробуем запустить сразу или когда будет готово
		if ( video.readyState >= 2 ) {
			playVideo();
		} else {
			video.addEventListener( 'canplay', playVideo, { once: true } );
		}

		// Повторная попытка через интервал (некоторые браузеры тупят)
		let attempts = 0;
		const interval = setInterval( () => {
			attempts++;
			if ( ( video.currentTime > 0 && ! video.paused && ! video.ended && video.readyState > 2 ) || attempts > 5 ) {
				clearInterval( interval );
				if ( ! video.paused ) {
					console.log( '[Video] Видео успешно играет, интервал очищен' );
					// После запуска устанавливаем opacity в 1 по просьбе пользователя
					setTimeout(() => {
						videoWrapper.style.setProperty('opacity', '1', 'important');
						videoWrapper.style.setProperty('visibility', 'visible', 'important');
						console.log( '[Video] Opacity установлено в 1 через интервал' );
					}, 500);
				}
				return;
			}
			console.log( `[Video] Повторная попытка запуска #${ attempts }, состояние: paused=${ video.paused }, readyState=${ video.readyState }` );
			forceSetup();
			playVideo();
		}, 2000 );
	} else {
		// Для десктопа просто запускаем
		video.play().catch( e => console.log( '[Video] Десктоп автоплей:', e ) );
	}
};

export default Video;
