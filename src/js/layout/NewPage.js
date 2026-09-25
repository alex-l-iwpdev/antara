import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Swiper from 'swiper/bundle';

const NewPage = ( $ ) => {
    $('.show-text').click(function(){
        if($(this).parents('.card-item').hasClass('show')){
            $(this).parents('.card-item').removeClass('show');
            $(this).parents('.card-item').find('.fas').removeClass('fa-x').addClass('fa-arrow-right-long');
        }else{
            $('.card-item').removeClass('show'); 
            $('.card-item .fas').removeClass('fa-x').addClass('fa-arrow-right-long');
            $(this).parents('.card-item').addClass('show');
            $(this).parents('.card-item').find('.fas').removeClass('fa-arrow-right-long').addClass('fa-x');
        }
    });
    $('.read-more').click(function(){
        if($(this).parents('.experience-item').hasClass('show')){
            $(this).parents('.experience-item').removeClass('show');
        }else{
            $('.experience-item').removeClass('show'); 
            $(this).parents('.experience-item').addClass('show');
        }
        setTimeout(() => {
            ScrollTrigger.refresh();
        }, 200);
    });
    $('.read-more-text').click(function(){
        $(this).prev().toggleClass('show-text-content');  
        $(this).toggleClass('show-text');  
    });

    const initExperienceHorizontalScroll = () => {
        const $sections = $('.experience-section, .scroll-slider-section');
        if (!$sections.length) return;

        $sections.each(function () {
            const $section = $(this);
            const $items = $section.find('.experience-items, .scroller-wrapper');
            if (!$items.length) return;

            const $cards = $items.find('.experience-item, .scroller-item');
            if (!$cards.length) return;

            const cards = $cards.get(); // native elements for GSAP

            const getScrollDistance = () => {
                const firstCard = cards[0];
                const lastCard = cards[cards.length - 1];
                if (!firstCard || !lastCard) return 0;

                const sectionEl = $section[0];
                const containerEl = $items[0];
                const parentEl = containerEl.parentElement;

                const sectionRect = sectionEl.getBoundingClientRect();
                const firstCardRect = firstCard.getBoundingClientRect();
                const lastCardRect = lastCard.getBoundingClientRect();
                const currentX = gsap.getProperty(firstCard, 'x') || 0;

                // Untransformed distance from section's left edge to the first card
                const startLeft = Math.max(0, (firstCardRect.left - sectionRect.left) - currentX);

                // Margin of the last card
                const lastCardStyle = window.getComputedStyle(lastCard);
                const lastCardMarginRight = parseFloat(lastCardStyle.marginRight) || 0;

                // Untransformed distance from section's left edge to the right edge of the last card
                const endRight = ((lastCardRect.right - sectionRect.left) - currentX) + lastCardMarginRight;

                // Section paddings
                const sectionStyle = window.getComputedStyle(sectionEl);
                const sectionPaddingLeft = parseFloat(sectionStyle.paddingLeft) || 0;
                const sectionPaddingRight = parseFloat(sectionStyle.paddingRight) || 0;

                // Container paddings
                const containerStyle = window.getComputedStyle(containerEl);
                const containerPaddingLeft = parseFloat(containerStyle.paddingLeft) || 0;
                const containerPaddingRight = parseFloat(containerStyle.paddingRight) || 0;

                // Parent (e.g. .brxe-container) paddings
                const parentStyle = parentEl && parentEl !== sectionEl ? window.getComputedStyle(parentEl) : null;
                const parentPaddingLeft = parentStyle ? (parseFloat(parentStyle.paddingLeft) || 0) : 0;
                const parentPaddingRight = parentStyle ? (parseFloat(parentStyle.paddingRight) || 0) : 0;

                // The offset from the section/screen edge on the left
                const leftOffset = Math.max(
                    startLeft,
                    sectionPaddingLeft,
                    containerPaddingLeft,
                    parentPaddingLeft
                );

                // Desired right offset to mirror the left spacing / preserve section padding
                const isMobile = window.innerWidth <= 767;
                const rightOffset = Math.max(
                    leftOffset,
                    sectionPaddingRight,
                    containerPaddingRight,
                    parentPaddingRight,
                    isMobile ? 20 : 0
                );

                // Visible width of the section / viewport
                const sectionWidth = Math.min(sectionEl.clientWidth, window.innerWidth);

                // Distance so the last card finishes exactly with the section's right offset visible
                const distance = endRight - sectionWidth + rightOffset;

                return Math.max(0, distance);
            };

            const holdPx = () => window.innerHeight * 0.3;

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: $items[0],
                    pin: $section[0],
                    start: 'center center',
                    end: () => `+=${Math.max(getScrollDistance(), window.innerHeight * 0.7) + holdPx() * 2}`,
                    scrub: 1,
                    invalidateOnRefresh: true,
                    anticipatePin: 1,
                },
            });

            // Hold at start
            tl.to(cards, { x: 0, duration: 0.3, ease: 'none' });

            // Horizontal scroll
            tl.to(cards, {
                x: () => -getScrollDistance(),
                duration: 1,
                ease: 'none',
            });

            // Hold at end
            tl.to(cards, {
                x: () => -getScrollDistance(),
                duration: 0.3,
                ease: 'none',
            });

            // Refresh on image load
            $section.find('img').each(function () {
                if (!this.complete) {
                    $(this).one('load error', () => ScrollTrigger.refresh());
                }
            });
        });

        // Global refresh after fonts/window load to ensure all sections calculate correctly
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => {
                ScrollTrigger.refresh();
            });
        }
        window.addEventListener('load', () => {
            ScrollTrigger.refresh();
        });
    };

    initExperienceHorizontalScroll();

    const initChooseYourRoom = () => {
        const chooseRoom = document.querySelector('.choose-your-room');
        const sliderSection = document.querySelector('.slider-section');

        if (!chooseRoom || !sliderSection) return;

        gsap.set(chooseRoom, { autoAlpha: 0, pointerEvents: 'none' });

        gsap.to(chooseRoom, {
            autoAlpha: 1,
            pointerEvents: 'auto',
            duration: 0.35,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: sliderSection,
                start: 'bottom bottom-=100px',
                toggleActions: 'play none none reverse',
                invalidateOnRefresh: true,
            },
        });
    };

    initChooseYourRoom();
    if($('.two-slide').length){
        var swiper = new Swiper('.two-slide', { 
            slidesPerView: 'auto',
            spaceBetween: 20,
            speed: 1000,
            autoplay: {
                delay: 4000,
            },
            pagination: {
                el: '.swiper-pagination',
                type: 'bullets',
            },
            navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
            },
        });
    }
    if($('.brxe-list.info, .brxe-text.info').length){
        $('.brxe-list.info li:last .meta').append('<i class="fas fa-circle-info"></i>');
        $('.brxe-text.info').each(function(){ 
            $(this).find('p:last').append('<i class="fas fa-circle-info"></i>');
        });
    }
    
    const positionPopup = ($container, $info, $popup) => {
        if (!$container.length || !$info.length || !$popup.length) return;

        const wasHidden = !$popup.hasClass('show');
        if (wasHidden) {
            $popup.css({ visibility: 'hidden', display: 'flex' });
        }

        const containerRect = $container[0].getBoundingClientRect();
        const infoRect = $info[0].getBoundingClientRect();
        const popupWidth = $popup.outerWidth();
        const popupHeight = $popup.outerHeight();

        const offsetParent = $popup[0].offsetParent || document.documentElement;
        const parentRect = offsetParent.getBoundingClientRect();
        const borderLeft = parseFloat(window.getComputedStyle(offsetParent).borderLeftWidth) || 0;
        const borderTop = parseFloat(window.getComputedStyle(offsetParent).borderTopWidth) || 0;

        const pad = 10;

        // 1. Horizontal constraint in viewport space (center on icon, stay within container)
        const iconCenterClientX = infoRect.left + (infoRect.width / 2);
        let targetClientLeft = iconCenterClientX - (popupWidth / 2);

        const minClientLeft = containerRect.left + pad;
        const maxClientLeft = containerRect.right - popupWidth - pad;

        if (maxClientLeft >= minClientLeft) {
            targetClientLeft = Math.min(Math.max(minClientLeft, targetClientLeft), maxClientLeft);
        } else {
            targetClientLeft = minClientLeft;
        }

        // 2. Vertical constraint in viewport space (prefer above icon, fallback below)
        const gap = 10;
        const minClientTop = containerRect.top + pad;
        const maxClientTop = containerRect.bottom - popupHeight - pad;

        let targetClientTop = infoRect.top - popupHeight - gap;

        if (targetClientTop < minClientTop) {
            const targetClientTopBelow = infoRect.bottom + gap;
            if (targetClientTopBelow + popupHeight <= containerRect.bottom - pad) {
                targetClientTop = targetClientTopBelow;
            } else {
                if (maxClientTop >= minClientTop) {
                    targetClientTop = Math.min(Math.max(minClientTop, targetClientTop), maxClientTop);
                } else {
                    targetClientTop = minClientTop;
                }
            }
        }

        // 3. Convert target viewport coordinates to offsetParent CSS coordinates
        const cssLeft = targetClientLeft - parentRect.left - borderLeft;
        const cssTop = targetClientTop - parentRect.top - borderTop;

        $popup.css({
            top: `${cssTop}px`,
            left: `${cssLeft}px`,
            right: 'auto',
            bottom: 'auto',
            margin: 0
        });

        if (wasHidden) {
            $popup.css({ visibility: '', display: '' });
        }
    };

    const getContainer = ($info) => {
        let $container = $info.closest('.investment-item');
        if (!$container.length) {
            $container = $info.closest('.practical-information-section .brxe-container');
        }
        if (!$container.length) {
            $container = $info.closest('.practical-information-section');
        }
        if (!$container.length) {
            $container = $info.closest('.investment-seection, section');
        }
        return $container;
    };

    const getPopup = ($info, $container) => {
        let $popup = $container.find('.info-popup');
        if (!$popup.length) {
            $popup = $info.closest('.investment-seection, .practical-information-section, section').find('.info-popup');
        }
        if (!$popup.length) {
            $popup = $('.info-popup');
        }
        return $popup;
    };

    const repositionActivePopups = () => {
        $('.info-popup.show').each(function () {
            const $popup = $(this);
            const $container = getContainer($popup);
            const $info = $container.find('.fa-circle-info').first();
            if ($container.length && $info.length) {
                positionPopup($container, $info, $popup);
            }
        });
    };

    $(window).on('resize scroll', repositionActivePopups);

    $(document).on('click', '.fa-circle-info', function (e) {
        const $info = $(this);
        const $container = getContainer($info);
        if (!$container.length) return;

        const $popup = getPopup($info, $container);
        if (!$popup.length) return;

        if ($popup.hasClass('show')) {
            $popup.removeClass('show');
        } else {
            $('.info-popup').removeClass('show');
            $popup.addClass('show');
            positionPopup($container, $info, $popup);
        }
    });

    $(document).mouseup(function (e)  {
        var folder = $(".info-popup");
        if (!folder.is(e.target) && folder.has(e.target).length === 0 && !$(e.target).closest('.fa-circle-info').length) {
            folder.removeClass('show');
        }
    }); 
    // Questions items staggered animation
    const questionsItems = document.querySelectorAll('.questions-items');
    if (questionsItems.length) {
        questionsItems.forEach((item) => {
            ScrollTrigger.create({
                trigger: item,
                start: 'top 80%',
                once: true,
                onEnter: () => {
                    item.classList.add('animated'); 
                },
            });
        });
    }
};

export default NewPage;