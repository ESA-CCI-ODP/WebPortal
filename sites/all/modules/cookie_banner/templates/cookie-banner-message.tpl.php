<?php
/**
 * @file cookie-banner-message.tpl.php
 * Markup and text.
 */
?>

<div id="cookie-banner">
  <p>
    <?php print $use_cookie_message; ?>
    <a href="<?php print $more_info_url; ?>"><?php print $more_info_message; ?></a>
    <button class="btn-close">
      <span><?php print t('Close cookie notice'); ?></span>
    </button>
  </p>


</div>
