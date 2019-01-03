// Cookie banner javascript file

Drupal.behaviors.cookie_banner = function (context) {
    var cookie_name = Drupal.settings.cookie_banner.cookie_banner_name;
    var cookie_message = Drupal.settings.cookie_banner.cookie_banner_message;
    // PHP time is expressed in seconds, JS needs milliseconds.
    var cookie_duration = Drupal.settings.cookie_banner.cookie_banner_duration * 1000;

    if (document.cookie.indexOf(cookie_name) == -1) {
        $('body').prepend(cookie_message);
    }

    $('#cookie-banner').find('.btn-close').click(function () {
        Drupal.cookie_banner.setCookie(cookie_name, '1', cookie_duration);
    });
}

Drupal.cookie_banner = {};

/*Drupal.cookie_banner.closeBanner = function (name, time) {
    var $cookieBanner = $('#cookie-banner');
    if (document.cookie.indexOf(name) == -1) {
        Drupal.cookie_banner.setCookie(name, '1', time);
    } else {
        $cookieBanner.remove();
    }

    $('#cookie-banner').find('.close').click(function () {
        $cookieBanner.remove();
    });
};*/

Drupal.cookie_banner.setCookie = function (name, value, time) {
    var $cookieBanner = $('#cookie-banner');
    var expires = "";
    if (time) {
        var date = new Date();
        date.setTime(time);
        expires = "; expires=" + date.toGMTString();
    }
    document.cookie = name + "=" + value + expires + "; path=/";
    $cookieBanner.remove();
};
