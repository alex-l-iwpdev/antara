import Swiper from 'swiper';

const SwiperSliders = ( $ ) => {
	const swiper = new Swiper( '.event-slider-sound', {
		slidesPerView: 'auto',
		spaceBetween: 0,
		navigation: {
			nextEl: '.event-slider-sound_arrow-right',
			prevEl: '.event-slider-sound_arrow-left',
		},
	} );

	const swiper2 = new Swiper( '.event-slider-gong', {
		slidesPerView: 'auto',
		spaceBetween: 0,
		navigation: {
			nextEl: '.event-slider-gong_arrow-right',
			prevEl: '.event-slider-gong_arrow-left',
		},
	} );

	const swiper3 = new Swiper( '.event-slider-circles', {
		slidesPerView: 'auto',
		spaceBetween: 0,
		navigation: {
			nextEl: '.event-slider-circles_arrow-right',
			prevEl: '.event-slider-circles_arrow-left',
		},
	} );
};

export default SwiperSliders;
