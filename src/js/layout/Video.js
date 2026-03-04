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

		// Убеждаемся, что видео приглушено, иначе автоплей может быть заблокирован браузером
		video.muted = true;
		video.setAttribute( 'playsinline', 'true' );

		const playVideo = () => {
			const playPromise = video.play();

			if ( playPromise !== undefined ) {
				playPromise.then( () => {
					console.log( '[Video] Видео успешно запущено' );
					videoWrapper.style.display = 'inherit';
				} ).catch( ( error ) => {
					console.error( '[Video] Ошибка при запуске видео:', error );
					// Если автоплей заблокирован, попробуем запустить при первом взаимодействии
					console.log( '[Video] Попытка запустить при первом клике/тапе...' );
					const startOnInteraction = () => {
						video.play().then( () => {
							console.log( '[Video] Видео запущено после взаимодействия' );
							videoWrapper.style.display = 'inherit';
							document.removeEventListener( 'click', startOnInteraction );
							document.removeEventListener( 'touchstart', startOnInteraction );
						} );
					};
					document.addEventListener( 'click', startOnInteraction );
					document.addEventListener( 'touchstart', startOnInteraction );
				} );
			}
		};

		// Запускаем видео
		playVideo();

		// Дополнительная проверка: если видео все еще на паузе через секунду
		setTimeout( () => {
			if ( video.paused ) {
				console.log( '[Video] Видео все еще на паузе через 1 сек, пробуем еще раз...' );
				playVideo();
			}
		}, 1000 );
	}
};

export default Video;
