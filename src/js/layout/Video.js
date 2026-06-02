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
	const isMobile = ( typeof window !== 'undefined' && window.innerWidth <= 768 ) || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test( navigator.userAgent );

	console.log( `[Video] Обнаружено устройство: ${ isMobile ? 'Мобильное' : 'Десктоп' }` );

	if ( isMobile ) {
		console.log( '[Video] Модуль отключен на мобильных устройствах для диагностики' );
		return;
	}
};

export default Video;
