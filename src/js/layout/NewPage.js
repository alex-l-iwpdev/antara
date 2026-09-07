const NewPage = ( $ ) => {
    $('.show-text').click(function(){
        if($(this).parents('.card-description').hasClass('show')){
            $(this).parents('.card-description').removeClass('show');
            $(this).parents('.card-description').find('.fas').removeClass('fa-x').addClass('fa-arrow-right-long');
        }else{
            $('.card-description').removeClass('show'); 
            $('.card-description .fas').removeClass('fa-x').addClass('fa-arrow-right-long');
            $(this).parents('.card-description').addClass('show');
            $(this).parents('.card-description').find('.fas').removeClass('fa-arrow-right-long').addClass('fa-x');
        }
    });
    $('.read-more').click(function(){
        if($(this).parents('.experience-item').hasClass('show')){
            $(this).parents('.experience-item').removeClass('show');
        }else{
            $('.experience-item').removeClass('show'); 
            $(this).parents('.experience-item').addClass('show');
        }
    });
    $('.read-more-text').click(function(){
        $(this).prev().toggleClass('show-text-content');  
        $(this).toggleClass('show-text');  
    });
    if($('.two-slide').length){
        var swiper = new Swiper('.two-slide', { 
            slidesPerView: 'auto',
            spaceBetween: 20,
            autoplay: {
                delay: 4000,
            },
            navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
            },
        });
    }
    if($('.brxe-list.info,   .brxe-text.info').length){
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
};
export default NewPage;