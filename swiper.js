const swiper = new Swiper('.swiper', {
    // Optional parameters
    direction: 'horizontal',
    loop: true,
    loopAdditionalSlides: 1,
    watchSlidesProgress: true,

    // If we need pagination
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
        dynamicBullets: true
    },

    // Navigation arrows
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },

    spaceBetween: 20,
    slidesPerView: 'auto',
    centeredSlides: false,
    breakpoints: {
        0: {
            spaceBetween: 15,
            centeredSlides: true
        },
        768: {
            spaceBetween: 20,
            centeredSlides: false
        }
    },
});