<?php
/**
 * @file
 * Administration form.
 */

/**
 * Provides settings form for cookie control.
 */
function cookie_banner_admin_form($form_state) {
  $lang = $GLOBALS['language']->language;

  if (module_exists('locale')) {
    $form['cookie_banner_' . $lang] = array(
      '#type' => 'item',
      '#title' => t('You are editing settings for the %language language.', array('%language' => $GLOBALS['language']->name)),
    );
  }

  $form['cookie_banner_use_cookie_message_' . $lang] = array(
    '#type' => 'textfield',
    '#title' => t('Cookie policy main message'),
    '#default_value' => variable_get('cookie_banner_use_cookie_message_' . $lang, t('This site uses cookies to help make it more useful to you.')),
    '#size' => 60,
    '#maxlength' => 220,
    '#required' => TRUE,
    '#description' => t('Enter the message to warn the user about the site using cookies.'),
  );

  $form['cookie_banner_more_info'] = array(
    '#type' => 'fieldset',
    '#title' => 'Cookie Policy link',
    '#collapsible' => TRUE,
    '#collapsed' => FALSE,
  );

  $form['cookie_banner_more_info']['cookie_banner_more_info_url_' . $lang] = array(
    '#type' => 'textfield',
    '#title' => t('Link URL'),
    '#default_value' => variable_get('cookie_banner_more_info_url_' . $lang, 'about/cookie-policy'),
    '#size' => 60,
    '#maxlength' => 220,
    '#required' => TRUE,
    '#description' => t('Enter link to your privacy policy or other page that will explain cookies to your users. For external links prepend http://'),
  );

  $form['cookie_banner_more_info']['cookie_banner_more_info_message_' . $lang] = array(
    '#type' => 'textfield',
    '#title' => t('Link text'),
    '#default_value' => variable_get('cookie_banner_more_info_message_' . $lang, t('Find out more about cookies.')),
    '#size' => 60,
    '#maxlength' => 220,
    '#required' => TRUE,
    '#description' => t('Enter the text for the Privacy Policy link.'),
  );

  return system_settings_form($form);
}
