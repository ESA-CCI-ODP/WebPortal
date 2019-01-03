<?php

/**
 * Implementation of hook_ckeditor_profile_defaults().
 */
function roles_feature_ckeditor_profile_defaults() {
  $data = array(
    'CKEditor Global Profile' => array(
      'name' => 'CKEditor Global Profile',
      'settings' => array(
        'excl_mode' => 0,
        'excl' => 'admin/user/settings.edit-user-mail-*
*.edit-pages
*.edit-pathauto-ignore-words
*.edit-recipients
*.edit-reply
*.edit-description
*.edit-synonyms
*.edit-img-assist-textareas
*.edit-img-assist-paths
*.edit-nodewords-description
*.edit-nodewords-description-value
admin/content/nodewords/global*
*.edit-relatedlinks-fieldset-relatedlinks
*.edit-allowed-values-php
*.edit-allowed-values
*.edit-update-notify-emails
*.edit-googleanalytics-*
*.edit-piwik-*
*.edit-feedburner-useragents
*@*.edit-webform-*
webform@*.edit-extra-items
admin/*/logintoboggan
admin/settings/actions/configure/*
*.edit-target
*.edit-wysiwyg-filter-*
admin/build/views*
',
        'simple_incl_mode' => 1,
        'simple_incl' => '*.edit-signature
admin/settings/site-information.*
admin/settings/site-maintenance.*
*.edit-page-help
*.edit-user-registration-help
*.edit-user-picture-guidelines
',
        'excl_regex' => '#(?:^.*:.*@admin/user/settings\\.edit\\-user\\-mail\\-.*$)|(?:^.*:.*@.*\\.edit\\-pages$)|(?:^.*:.*@.*\\.edit\\-pathauto\\-ignore\\-words$)|(?:^.*:.*@.*\\.edit\\-recipients$)|(?:^.*:.*@.*\\.edit\\-reply$)|(?:^.*:.*@.*\\.edit\\-description$)|(?:^.*:.*@.*\\.edit\\-synonyms$)|(?:^.*:.*@.*\\.edit\\-img\\-assist\\-textareas$)|(?:^.*:.*@.*\\.edit\\-img\\-assist\\-paths$)|(?:^.*:.*@.*\\.edit\\-nodewords\\-description$)|(?:^.*:.*@.*\\.edit\\-nodewords\\-description\\-value$)|(?:^.*:.*@admin/content/nodewords/global.*\\..*$)|(?:^.*:.*@.*\\.edit\\-relatedlinks\\-fieldset\\-relatedlinks$)|(?:^.*:.*@.*\\.edit\\-allowed\\-values\\-php$)|(?:^.*:.*@.*\\.edit\\-allowed\\-values$)|(?:^.*:.*@.*\\.edit\\-update\\-notify\\-emails$)|(?:^.*:.*@.*\\.edit\\-googleanalytics\\-.*$)|(?:^.*:.*@.*\\.edit\\-piwik\\-.*$)|(?:^.*:.*@.*\\.edit\\-feedburner\\-useragents$)|(?:^.*:.*@.*\\.edit\\-webform\\-.*$)|(?:^.*:webform@.*\\.edit\\-extra\\-items$)|(?:^.*:.*@admin/.*/logintoboggan\\..*$)|(?:^.*:.*@admin/settings/actions/configure/.*\\..*$)|(?:^.*:.*@.*\\.edit\\-target$)|(?:^.*:.*@.*\\.edit\\-wysiwyg\\-filter\\-.*$)|(?:^.*:.*@admin/build/views.*\\..*$)#',
        'simple_incl_regex' => '#(?:^.*:.*@.*\\.edit\\-signature$)|(?:^.*:.*@admin/settings/site\\-information\\..*$)|(?:^.*:.*@admin/settings/site\\-maintenance\\..*$)|(?:^.*:.*@.*\\.edit\\-page\\-help$)|(?:^.*:.*@.*\\.edit\\-user\\-registration\\-help$)|(?:^.*:.*@.*\\.edit\\-user\\-picture\\-guidelines$)#',
        'ckeditor_path' => '%b/sites/all/libraries/ckeditor',
      ),
      'roles' => array(),
    ),
    'Default' => array(
      'name' => 'Default',
      'settings' => array(
        'allow_user_conf' => 'f',
        'filters' => array(
          'filter/3' => 0,
          'filter/0' => 1,
        ),
        'ss' => '2',
        'min_rows' => '1',
        'excl_mode' => '0',
        'excl' => '',
        'simple_incl' => '',
        'default' => 't',
        'show_toggle' => 't',
        'popup' => 'f',
        'skin' => 'moono',
        'uicolor' => 'default',
        'uicolor_user' => 'default',
        'toolbar' => '[
    [ \'Format\', \'Bold\', \'Italic\', \'-\', \'NumberedList\',\'BulletedList\', \'-\', \'Link\', \'Unlink\', \'Image\' ]
]
      ',
        'expand' => 't',
        'width' => '100%',
        'lang' => 'en',
        'auto_lang' => 't',
        'language_direction' => 'default',
        'allowed_content' => 't',
        'extraAllowedContent' => '',
        'enter_mode' => 'p',
        'shift_enter_mode' => 'br',
        'font_format' => 'p;div;pre;address;h1;h2;h3;h4;h5;h6',
        'custom_formatting' => 'f',
        'formatting' => array(
          'custom_formatting_options' => array(
            'indent' => 'indent',
            'breakBeforeOpen' => 'breakBeforeOpen',
            'breakAfterOpen' => 'breakAfterOpen',
            'breakAfterClose' => 'breakAfterClose',
            'breakBeforeClose' => 0,
            'pre_indent' => 0,
          ),
        ),
        'css_mode' => 'theme',
        'css_path' => '',
        'css_style' => 'theme',
        'styles_path' => '',
        'filebrowser' => 'imce',
        'filebrowser_image' => '',
        'filebrowser_flash' => '',
        'UserFilesPath' => '%b%f/',
        'UserFilesAbsolutePath' => '%d%b%f/',
        'forcePasteAsPlainText' => 'f',
        'html_entities' => 't',
        'scayt_autoStartup' => 'f',
        'theme_config_js' => 'f',
        'js_conf' => '',
        'loadPlugins' => array(
          'drupalbreaks' => array(
            'name' => 'drupalbreaks',
            'desc' => 'Plugin for inserting Drupal teaser and page breaks.',
            'path' => '%base_path%%plugin_dir%drupalbreaks/',
            'buttons' => array(
              'DrupalBreak' => array(
                'label' => 'DrupalBreak',
                'icon' => 'images/drupalbreak.png',
              ),
            ),
            'default' => 't',
          ),
        ),
        'excl_regex' => '',
        'simple_incl_regex' => '',
      ),
      'roles' => array(
        '' => NULL,
      ),
    ),
  );
  return $data;
}
