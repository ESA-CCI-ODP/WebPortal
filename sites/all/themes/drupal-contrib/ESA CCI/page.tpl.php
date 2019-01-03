<?php
// $Id: page.tpl.php,v 1.25.2.2 2009/04/30 00:13:31 goba Exp $
?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="<?php print $language->language ?>" xml:lang="<?php print $language->language ?>" dir="<?php print $language->dir ?>">
<head>
  <meta http-equiv="Content-Style-Type" content="text/css" />
  <?php print $head ?>
  <title><?php print $head_title ?></title>
  <?php print $styles ?>
  <?php print $scripts ?>  
  <script src="http://cci.esa.int/sites/all/libraries/jquery.cookie.js"></script>
  <?php if(strpos($_SERVER['REQUEST_URI'], '/data') !== false){ ?>
	 <script type="text/javascript">
	 var stopTimeout;
	 var signedUpCookie = false; 
	 stopTimeout = false;
	 
		function myFunction() {
			if(!signedUpCookie) {
				setTimeout(function () {
					if (!stopTimeout) {					
						this.openColorBox();
					}
					stopTimeout = true;
				}, 1000);
			}
		}
		function createCookie(name,value,days) {
			var expires = "";
			if (days) {
				var date = new Date();
				date.setTime(date.getTime() + (days*24*60*60*1000)); // a year in future
				expires = "; expires=" + date.toUTCString();
			}
			document.cookie = name + "=" + value + expires + "; path=/";
		}

		function readCookie(name) {
			/*var nameEQ = name + "=";
			var ca = document.cookie.split(';');
			for(var i=0;i < ca.length;i++) {
				var c = ca[i];
				while (c.charAt(0)==' ') c = c.substring(1,c.length);
				if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
			}
			return null;*/
			var re = new RegExp(name + "=([^;]+)");
			var value = re.exec(document.cookie);
			return (value != null) ? unescape(value[1]) : null;
		}

		function eraseCookie(name) {
			createCookie(name,"",-1);
		}

		function openColorBox(){
			$.colorbox({iframe:true,  width:"525", height:"620", href:"http://"+window.location.hostname+"/sites/all/themes/drupal-contrib/ESA CCI/sign-up-form.php"})
		}
	 </script>
  <?php } ?>
  <style>
		#cboxClose {
			border: 0px;
		}
	</style>
</head>

<body>

<div class="hide"><a href="#content" title="<?php print t('Skip navigation') ?>." accesskey="2"><?php print t('Skip navigation') ?></a>.</div>

<table id="primary-menu" summary="Navigation elements." border="0" cellpadding="0" cellspacing="0" width="1250px" align="center">
  <tr>
    <td class="primary-links" width="100%" align="center" valign="middle">
     <a href="http://cci.esa.int/"> <img src="http://cci.esa.int/sites/default/files/cciTopBanner_v3.0.png" style="width:1250px;"/></a>
    </td>
 
   </td>
  </tr>
</table>

<table id="secondary-menu" summary="Navigation elements." border="0" cellpadding="0" cellspacing="0" width="1250px" align="center">
  <tr>
    <td class="secondary-links" width="100%"  align="center" valign="middle">
      <?php print theme('links', $secondary_links, array('class' => 'links', 'id' => 'subnavlist')) ?>
    </td>
    <td width="25%" align="center" valign="middle">
      <?php print $search_box ?>
    </td>
  </tr>
  <tr>
    <td colspan="2"><div><?php print $header ?></div></td>
  </tr>
</table>

<table id="content" border="0" cellpadding="15" cellspacing="0" width="1250px" align="center">
  <tr>
    <?php if ($left != ""): ?>
    <td id="sidebar-left">
      <?php print $left ?>
    </td>
    <?php endif; ?>

    <td valign="top">
      <?php if ($mission != ""): ?>
      <div id="mission"><?php print $mission ?></div>
      <?php endif; ?>

      <div id="main">
        <?php if ($title != ""): ?>
          <?php print $breadcrumb ?>
          <h1 class="title"><?php print $title ?></h1>

          <?php if ($tabs != ""): ?>
            <div class="tabs"><?php print $tabs ?></div>
          <?php endif; ?>

        <?php endif; ?>

        <?php if ($show_messages && $messages != ""): ?>
          <?php print $messages ?>
        <?php endif; ?>

        <?php if ($help != ""): ?>
            <div id="help"><?php print $help ?></div>
        <?php endif; ?>

      <!-- start main content -->
      <?php print $content; ?>
      <?php print $feed_icons; ?>
      <!-- end main content -->

      </div><!-- main -->
    </td>
    <?php if ($right != ""): ?>
    <td id="sidebar-right">
      <?php print $right ?>
    </td>
    <?php endif; ?>
  </tr>
</table>

<table id="footer-menu" summary="Navigation elements." border="0" cellpadding="0" cellspacing="0" width="1250px" align="center">
  <tr>
    <td align="center" valign="middle">
		<?php if (isset($primary_links)) : ?>
		  <?php print theme('links', $primary_links, array('class' => 'links primary-links')) ?>
		<?php endif; ?>
		<?php if (isset($secondary_links)) : ?>
		  <?php print theme('links', $secondary_links, array('class' => 'links secondary-links')) ?>
		<?php endif; ?>
    </td>
  </tr>
  
</table>

<table border="0" width="850px" align="center">
  <tr>
    <td>
      <?php if ($footer_message || $footer) : ?>
      <div id="footer-message">
        <?php print $footer_message . $footer;?>
      </div><?php endif; ?>
    </td>
  </tr>
</table>

</table>





<?php print $closure;?>
</table>

  <?php if(strpos($_SERVER['REQUEST_URI'], '/data') !== false){ ?>
	 <script type="text/javascript">	
		//console.log("COOKIE: ", document.cookie.indexOf("cci_portal_newsletter_signed_up"), readCookie("cci_portal_newsletter_signed_up"));
		//document.cookie.indexOf("cci_portal_newsletter_signed_up") > 0 && 
		if (readCookie("cci_portal_newsletter_signed_up") === "TRUE" || readCookie("cci_portal_newsletter_signed_up") === "true") {
		  // do nothing as they've been here before.
			// but update the users that have already been here
			$.cookie('cci_portal_newsletter_signed_up', true, { path: '/', expires: 3650 });
		}
		else if (readCookie("cci_portal_newsletter_signed_up") === "FALSE" || readCookie("cci_portal_newsletter_signed_up") === "false") {
		  // do nothing as they've been here before.
			// but update the users that have already been here
			$.cookie('cci_portal_newsletter_signed_up', true, { path: '/', expires: 3650 });
		}
		else {
		  //createCookie("cci_portal_newsletter_signed_up","FALSE",1);
		  //$.cookie('cci_portal_newsletter_signed_up', false, { path: '/', expires: 1 });
		  myFunction();
		}
	 </script>
  <?php } ?>
</body>
</html>
