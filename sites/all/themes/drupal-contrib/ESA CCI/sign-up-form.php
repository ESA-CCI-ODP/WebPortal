<html>
	<head>
		<style>
			body {
				font-family: Verdana, Arial, Helvetica, sans-serif;
				font-size: 10pt;
			}

			h1 {
				font-size: 12pt;
				color: #369;
				margin: 0;
			} 

			fieldset {
			  border: 1px solid #ccc;
			}

			.form-item {
			  margin-top: 1em;
			  text-align: left;
			}
			.form-item label {
			  color: #369;			  
			  display: block;
			  font-weight: bold;
			}
			.item-list .title {
			  color: #369;
			  font-size: 10pt;
			} 
			.form-required {
			  color: #f00;
			}
			.form-item label.option {
				display: inline;
				font-weight: normal;
			}
			div.error {
				background: #fcc;
				color: #200;
				padding: 2px;
				border: 1px solid #d77;				
				margin-top:5px;
				margin-bottom: 5px;
			}
			#cboxClose {
				border: 0px;
			}
			#notNowButton, .btnNotNow {
				float: right;
			}
		</style>
		<script>
			function setCookie(c_name,c_value,exdays) {
				var d = new Date();
				var newDate = new Date(d.getTime() + (exdays*24*60*60*1000));
				console.log(d + " | " + newDate);
				document.cookie = c_name + '=' + c_value + '; expires=' + newDate.toGMTString() + '; path=/';
			}
			
			function ajaxSuccess () {
			  console.log(this.responseText);
			}
			
			function sendData(data) {
			  var XHR = new XMLHttpRequest();			  
			  XHR.onload = ajaxSuccess;
			  // Bind the FormData object and the form element
				var FD = new FormData(signupform);
			  
			  var ajaxDisplay = parent.document.getElementById('cboxLoadedContent');

			  // Push our data into our FormData object
			  for(name in data) {
				FD.append(name, data[name]);
			  }

			  // Define what happens in case of error
			  XHR.addEventListener('error', function(event) {
				parent.document.getElementById('colorbox').style.width = "375px";
				parent.document.getElementById('colorbox').style.height = "230px";
				parent.jQuery.colorbox({iframe:true, width:"375", height:"230", href:"http://"+window.location.hostname+"/sites/all/themes/drupal-contrib/ESA CCI/error-signing-up.php"})				
			  });
			  
			XHR.onreadystatechange = function() {
				if (XHR.readyState === 4) {
					if (XHR.status === 200) {
						setCookie('cci_portal_newsletter_signed_up','TRUE',3650)
						parent.document.getElementById('colorbox').style.width = "350px";
						parent.document.getElementById('colorbox').style.height = "250px";
						parent.jQuery.colorbox({iframe:true, width:"375", height:"250", href:"http://"+window.location.hostname+"/sites/all/themes/drupal-contrib/ESA CCI/thankyou.php"})
					}               
				}
			};
							  
			// Set up our request
			XHR.open('POST', 'http://'+window.location.hostname+'/content/sign-cci-mailing-lists');

			  // Send our FormData object; HTTP headers are set automatically
			XHR.send(FD);
		}
		
			function validateSignUpForm(form) {
				var x;
				var nameErr = false;
				var emailErr = false;
				var optErr = false;
				var ok = true;
				var errMsg = "";
				
				x = document.forms["webform-client-form-153"]["submitted[name]"].value;
				if (x.length <= 0) {
					nameErr = true;
					document.getElementById("webform-component-name-err-msg").innerHTML = "Name must be filled out";
					ok = false;
				}
				else {
					nameErr = "";
					document.getElementById("webform-component-name-err-msg").innerHTML = "";
				}
				
				x = document.forms["webform-client-form-153"]["submitted[email_address]"].value;
				if ( x.length <= 0) {
					emailErr = true;
					document.getElementById("webform-component-email-err-msg").innerHTML = "Email must be filled out";
					ok = false;
				}
				else {
					emailErr = "";
					document.getElementById("webform-component-email-err-msg").innerHTML = "";
				}
				
				if(
					 !document.forms["webform-client-form-153"]["submitted[mail_list][aerosol]"].checked &&
					 !document.forms["webform-client-form-153"]["submitted[mail_list][biomass]"].checked &&
					 !document.forms["webform-client-form-153"]["submitted[mail_list][cloud]"].checked &&
					 !document.forms["webform-client-form-153"]["submitted[mail_list][cmug]"].checked &&
					 !document.forms["webform-client-form-153"]["submitted[mail_list][fire]"].checked &&
					 !document.forms["webform-client-form-153"]["submitted[mail_list][glaciers]"].checked &&
					 !document.forms["webform-client-form-153"]["submitted[mail_list][antarctica]"].checked &&
					 !document.forms["webform-client-form-153"]["submitted[mail_list][greenland-is]"].checked &&
					 !document.forms["webform-client-form-153"]["submitted[mail_list][ghg]"].checked &&
					 !document.forms["webform-client-form-153"]["submitted[mail_list][land cover]"].checked &&
					 !document.forms["webform-client-form-153"]["submitted[mail_list][high res land cover]"].checked &&
					 !document.forms["webform-client-form-153"]["submitted[mail_list][lst]"].checked &&
					 !document.forms["webform-client-form-153"]["submitted[mail_list][ocean colour]"].checked &&
					 !document.forms["webform-client-form-153"]["submitted[mail_list][ozone]"].checked &&
					 !document.forms["webform-client-form-153"]["submitted[mail_list][permafrost]"].checked &&
					 !document.forms["webform-client-form-153"]["submitted[mail_list][salinity]"].checked &&
					 !document.forms["webform-client-form-153"]["submitted[mail_list][sea ice]"].checked &&
					 !document.forms["webform-client-form-153"]["submitted[mail_list][sea level]"].checked &&
					 !document.forms["webform-client-form-153"]["submitted[mail_list][sea level budget closure]"].checked &&
					 !document.forms["webform-client-form-153"]["submitted[mail_list][sea state]"].checked &&
					 !document.forms["webform-client-form-153"]["submitted[mail_list][soil]"].checked &&
					 !document.forms["webform-client-form-153"]["submitted[mail_list][snow]"].checked &&
					 !document.forms["webform-client-form-153"]["submitted[mail_list][sst]"].checked &&
					 !document.forms["webform-client-form-153"]["submitted[mail_list][water vapour]"].checked &&
					 !document.forms["webform-client-form-153"]["submitted[mail_list][toolbox]"].checked
				)
				{
					optErr = true;
					document.getElementById("webform-component-mail-list-err-msg").innerHTML = "A selection must be made";
					ok = false;
				}
				else {
					optErr = false;
					document.getElementById("webform-component-mail-list-err-msg").innerHTML = "";
				}
				
				if(ok) {		
					document.getElementById("signUpFormErrorMsg").innerHTML = "";
					document.getElementById("signUpFormErrorMsg2").innerHTML = "";
					sendData();
					return true;
				}	
				else {
					errMsg = "<div class=\"messages error\" id=\"formErrorMsg\">";
					errMsg += "<ul>";
					if(nameErr){ errMsg += "<li>Name field is required.</li>"; }
					if(emailErr){ errMsg += "<li>Email Address field is required.</li>"; }
					if(optErr){ errMsg += "<li>Mail List (Select one or more) field is required.</li>"; }
					errMsg += "</ul>";
					errMsg += "</div>";
					document.getElementById("signUpFormErrorMsg").innerHTML = errMsg;
					document.getElementById("signUpFormErrorMsg2").innerHTML = errMsg;
					setCookie('cci_portal_newsletter_signed_up','FALSE',1);
					return false;
				}
				return false;				
			}
			
			function signUpNotNow() {
				parent.jQuery.colorbox.close();
				
				//set the cookie
				setCookie('cci_portal_newsletter_signed_up','FALSE',1);
			}
		</script>
	</head>
	<body>
	<h1>Sign up to CCI mailing list(s)</h1>
		<div id="signUpFormErrorMsg"></div>
		<div class="content"><p>Please sign up to receive the latest news and notifications from the CCI Toolbox and ECV projects that interest you</p>
<form action="/content/sign-cci-mailing-lists" accept-charset="UTF-8" method="post" id="webform-client-form-153" class="webform-client-form" enctype="multipart/form-data" onsubmit="return validateSignUpForm(this)">
<div><div class="webform-component webform-component-textfield" id="webform-component-name"><div class="form-item" id="edit-submitted-name-wrapper">
 <label for="edit-submitted-name">Name: <span class="form-required" title="This field is required.">*</span></label>
 <input type="text" maxlength="128" name="submitted[name]" id="edit-submitted-name" size="60" value="" class="form-text required">
 <div id="webform-component-name-err-msg" class="form-required"></div>
</div>
</div><div class="webform-component webform-component-email" id="webform-component-email-address"><div class="form-item" id="edit-submitted-email-address-wrapper">
 <label for="edit-submitted-email-address">Email Address : <span class="form-required" title="This field is required.">*</span></label>
 <input class="form-text form-email required email" type="email" id="edit-submitted-email-address" name="submitted[email_address]" size="60">
 <div id="webform-component-email-err-msg" class="form-required"></div>
</div>
</div><div class="webform-component webform-component-textfield" id="webform-component-affiliation"><div class="form-item" id="edit-submitted-affiliation-wrapper">
 <label for="edit-submitted-affiliation">Affiliation: </label>
 <input type="text" maxlength="128" name="submitted[affiliation]" id="edit-submitted-affiliation" size="60" value="" class="form-text">
</div>
</div><div class="webform-component webform-component-textfield" id="webform-component-country"><div class="form-item" id="edit-submitted-country-wrapper">
 <label for="edit-submitted-country">Country: </label>
 <select name="submitted[country]" class="form-select" id="edit-submitted-country"><option value="" selected="selected">- None -</option><option value="ESA">*** ESA member / associate / cooperative states ***</option><option value="AT">Austria</option><option value="BE">Belgium</option><option value="BG">Bulgaria</option><option value="CA">Canada</option><option value="CY">Cyprus</option><option value="CZ">Czechia (Czech Republic)</option><option value="DK">Denmark</option><option value="EE">Estonia</option><option value="FI">Finland</option><option value="FR">France</option><option value="DE">Germany</option><option value="GR">Greece</option><option value="HU">Hungary</option><option value="IE">Ireland</option><option value="IT">Italy</option><option value="LV">Latvia</option><option value="LT">Lithuania</option><option value="LU">Luxembourg</option><option value="MT">Malta</option><option value="NL">Netherlands</option><option value="NO">Norway</option><option value="PL">Poland</option><option value="PT">Portugal</option><option value="RO">Romania</option><option value="SK">Slovakia</option><option value="SI">Slovenia</option><option value="ES">Spain</option><option value="SE">Sweden</option><option value="CH">Switzerland</option><option value="GB">United Kingdom of Great Britain and Northern Ireland</option><option value="BLANK"></option><option value="OTHER">*** Other Countries ***</option><option value="AF">Afghanistan</option><option value="AX">Åland Islands</option><option value="AL">Albania</option><option value="DZ">Algeria</option><option value="AS">American Samoa</option><option value="AD">Andorra</option><option value="AO">Angola</option><option value="AI">Anguilla</option><option value="AQ">Antarctica</option><option value="AG">Antigua and Barbuda</option><option value="AR">Argentina</option><option value="AM">Armenia</option><option value="AW">Aruba</option><option value="AU">Australia</option><option value="AZ">Azerbaijan</option><option value="BS">Bahamas</option><option value="BH">Bahrain</option><option value="BD">Bangladesh</option><option value="BB">Barbados</option><option value="BY">Belarus</option><option value="BZ">Belize</option><option value="BJ">Benin</option><option value="BM">Bermuda</option><option value="BT">Bhutan</option><option value="BO">Bolivia, Plurinational State of</option><option value="BQ">Bonaire, Sint Eustatius and Saba</option><option value="BA">Bosnia and Herzegovina</option><option value="BW">Botswana</option><option value="BV">Bouvet Island</option><option value="BR">Brazil</option><option value="IO">British Indian Ocean Territory</option><option value="BN">Brunei Darussalam</option><option value="BF">Burkina Faso</option><option value="BI">Burundi</option><option value="CV">Cabo Verde</option><option value="KH">Cambodia</option><option value="CM">Cameroon</option><option value="KY">Cayman Islands</option><option value="CF">Central African Republic</option><option value="TD">Chad</option><option value="CL">Chile</option><option value="CN">China</option><option value="CX">Christmas Island</option><option value="CC">Cocos (Keeling) Islands</option><option value="CO">Colombia</option><option value="KM">Comoros</option><option value="CG">Congo</option><option value="CD">Congo, the Democratic Republic of the</option><option value="CK">Cook Islands</option><option value="CR">Costa Rica</option><option value="CI">Côte d'Ivoire</option><option value="HR">Croatia</option><option value="CU">Cuba</option><option value="CW">Curaçao</option><option value="DJ">Djibouti</option><option value="DM">Dominica</option><option value="DO">Dominican Republic</option><option value="EC">Ecuador</option><option value="EG">Egypt</option><option value="SV">El Salvador</option><option value="GQ">Equatorial Guinea</option><option value="ER">Eritrea</option><option value="ET">Ethiopia</option><option value="FK">Falkland Islands (Malvinas)</option><option value="FO">Faroe Islands</option><option value="FJ">Fiji</option><option value="GF">French Guiana</option><option value="PF">French Polynesia</option><option value="TF">French Southern Territories</option><option value="GA">Gabon</option><option value="GM">Gambia</option><option value="GE">Georgia</option><option value="GH">Ghana</option><option value="GI">Gibraltar</option><option value="GL">Greenland</option><option value="GD">Grenada</option><option value="GP">Guadeloupe</option><option value="GU">Guam</option><option value="GT">Guatemala</option><option value="GG">Guernsey</option><option value="GN">Guinea</option><option value="GW">Guinea-Bissau</option><option value="GY">Guyana</option><option value="HT">Haiti</option><option value="HM">Heard Island and McDonald Islands</option><option value="VA">Holy See</option><option value="HN">Honduras</option><option value="HK">Hong Kong</option><option value="IS">Iceland</option><option value="IN">India</option><option value="ID">Indonesia</option><option value="IR">Iran, Islamic Republic of</option><option value="IQ">Iraq</option><option value="IM">Isle of Man</option><option value="IL">Israel</option><option value="JM">Jamaica</option><option value="JP">Japan</option><option value="JE">Jersey</option><option value="JO">Jordan</option><option value="KZ">Kazakhstan</option><option value="KE">Kenya</option><option value="KI">Kiribati</option><option value="KP">Korea, Democratic People's Republic of</option><option value="KR">Korea, Republic of</option><option value="KW">Kuwait</option><option value="KG">Kyrgyzstan</option><option value="LA">Lao People's Democratic Republic</option><option value="LB">Lebanon</option><option value="LS">Lesotho</option><option value="LR">Liberia</option><option value="LY">Libya</option><option value="LI">Liechtenstein</option><option value="MO">Macao</option><option value="MK">Macedonia, the former Yugoslav Republic of</option><option value="MG">Madagascar</option><option value="MW">Malawi</option><option value="MY">Malaysia</option><option value="MV">Maldives</option><option value="ML">Mali</option><option value="MH">Marshall Islands</option><option value="MQ">Martinique</option><option value="MR">Mauritania</option><option value="MU">Mauritius</option><option value="YT">Mayotte</option><option value="MX">Mexico</option><option value="FM">Micronesia, Federated States of</option><option value="MD">Moldova, Republic of</option><option value="MC">Monaco</option><option value="MN">Mongolia</option><option value="ME">Montenegro</option><option value="MS">Montserrat</option><option value="MA">Morocco</option><option value="MZ">Mozambique</option><option value="MM">Myanmar</option><option value="NA">Namibia</option><option value="NR">Nauru</option><option value="NP">Nepal</option><option value="NC">New Caledonia</option><option value="NZ">New Zealand</option><option value="NI">Nicaragua</option><option value="NE">Niger</option><option value="NG">Nigeria</option><option value="NU">Niue</option><option value="NF">Norfolk Island</option><option value="MP">Northern Mariana Islands</option><option value="OM">Oman</option><option value="PK">Pakistan</option><option value="PW">Palau</option><option value="PS">Palestine, State of</option><option value="PA">Panama</option><option value="PG">Papua New Guinea</option><option value="PY">Paraguay</option><option value="PE">Peru</option><option value="PH">Philippines</option><option value="PN">Pitcairn</option><option value="PR">Puerto Rico</option><option value="QA">Qatar</option><option value="RE">Réunion</option><option value="RU">Russian Federation</option><option value="RW">Rwanda</option><option value="BL">Saint Barthélemy</option><option value="SH">Saint Helena, Ascension and Tristan da Cunha</option><option value="KN">Saint Kitts and Nevis</option><option value="LC">Saint Lucia</option><option value="MF">Saint Martin (French part)</option><option value="PM">Saint Pierre and Miquelon</option><option value="VC">Saint Vincent and the Grenadines</option><option value="WS">Samoa</option><option value="SM">San Marino</option><option value="ST">Sao Tome and Principe</option><option value="SA">Saudi Arabia</option><option value="SN">Senegal</option><option value="RS">Serbia</option><option value="SC">Seychelles</option><option value="SL">Sierra Leone</option><option value="SG">Singapore</option><option value="SX">Sint Maarten (Dutch part)</option><option value="SB">Solomon Islands</option><option value="SO">Somalia</option><option value="ZA">South Africa</option><option value="GS">South Georgia and the South Sandwich Islands</option><option value="SS">South Sudan</option><option value="LK">Sri Lanka</option><option value="SD">Sudan</option><option value="SR">Suriname</option><option value="SJ">Svalbard and Jan Mayen</option><option value="SZ">Swaziland</option><option value="SY">Syrian Arab Republic</option><option value="TW">Taiwan, Province of China</option><option value="TJ">Tajikistan</option><option value="TZ">Tanzania, United Republic of</option><option value="TH">Thailand</option><option value="TL">Timor-Leste</option><option value="TG">Togo</option><option value="TK">Tokelau</option><option value="TO">Tonga</option><option value="TT">Trinidad and Tobago</option><option value="TN">Tunisia</option><option value="TR">Turkey</option><option value="TM">Turkmenistan</option><option value="TC">Turks and Caicos Islands</option><option value="TV">Tuvalu</option><option value="UG">Uganda</option><option value="UA">Ukraine</option><option value="AE">United Arab Emirates</option><option value="UM">United States Minor Outlying Islands</option><option value="US">United States of America</option><option value="UY">Uruguay</option><option value="UZ">Uzbekistan</option><option value="VU">Vanuatu</option><option value="VE">Venezuela, Bolivarian Republic of</option><option value="VN">Viet Nam</option><option value="VG">Virgin Islands, British</option><option value="VI">Virgin Islands, U.S.</option><option value="WF">Wallis and Futuna</option><option value="EH">Western Sahara</option><option value="YE">Yemen</option><option value="ZM">Zambia</option><option value="ZW">Zimbabwe</option></select>
</div>
</div><div class="webform-component webform-component-textfield" id="webform-component-motivation-for-downloading-data"><div class="form-item" id="edit-submitted-motivation-for-downloading-data-wrapper">
 <label for="edit-submitted-motivation-for-downloading-data">Motivation for downloading data: </label>
 <input type="text" maxlength="128" name="submitted[motivation_for_downloading_data]" id="edit-submitted-motivation-for-downloading-data" size="60" value="" class="form-text">
</div>
</div><div class="webform-component webform-component-checkboxes" id="webform-component-mail-list"><div class="form-item">
 <label>Which CCI projects are you interested in? (Select one or more):  
 <span class="form-required" title="This field is required.">*</span></label>
 <div id="webform-component-mail-list-err-msg" class="form-required"></div>
 <div class="form-checkboxes">
<div class="form-item" id="edit-submitted-mail-list-1-wrapper">
 <label class="option" for="edit-submitted-mail-list-1"><input type="checkbox" name="submitted[mail_list][aerosol]" id="edit-submitted-mail-list-1" value="aerosol" class="form-checkbox"> Aerosol</label>
</div>
<div class="form-item" id="edit-submitted-mail-list-2-wrapper">
 <label class="option" for="edit-submitted-mail-list-2"><input type="checkbox" name="submitted[mail_list][biomass]" id="edit-submitted-mail-list-2" value="biomass" class="form-checkbox"> Biomass</label>
</div>
<div class="form-item" id="edit-submitted-mail-list-3-wrapper">
 <label class="option" for="edit-submitted-mail-list-3"><input type="checkbox" name="submitted[mail_list][cloud]" id="edit-submitted-mail-list-3" value="cloud" class="form-checkbox"> Cloud</label>
</div>
<div class="form-item" id="edit-submitted-mail-list-4-wrapper">
 <label class="option" for="edit-submitted-mail-list-4"><input type="checkbox" name="submitted[mail_list][cmug]" id="edit-submitted-mail-list-4" value="cmug" class="form-checkbox"> Climate Modelling User Group (CMUG)</label>
</div>
<div class="form-item" id="edit-submitted-mail-list-5-wrapper">
 <label class="option" for="edit-submitted-mail-list-5"><input type="checkbox" name="submitted[mail_list][fire]" id="edit-submitted-mail-list-5" value="fire" class="form-checkbox"> Fire</label>
</div>
<div class="form-item" id="edit-submitted-mail-list-6-wrapper">
 <label class="option" for="edit-submitted-mail-list-6"><input type="checkbox" name="submitted[mail_list][ghg]" id="edit-submitted-mail-list-6" value="ghg" class="form-checkbox"> Greenhouse Gases (GHG)</label>
</div>
<div class="form-item" id="edit-submitted-mail-list-7-wrapper">
 <label class="option" for="edit-submitted-mail-list-7"><input type="checkbox" name="submitted[mail_list][glaciers]" id="edit-submitted-mail-list-7" value="glaciers" class="form-checkbox"> Glaciers</label>
</div>
<div class="form-item" id="edit-submitted-mail-list-8-wrapper">
 <label class="option" for="edit-submitted-mail-list-8"><input type="checkbox" name="submitted[mail_list][antarctica]" id="edit-submitted-mail-list-8" value="antarctica" class="form-checkbox"> Antarctica Ice Sheets</label>
</div>
<div class="form-item" id="edit-submitted-mail-list-9-wrapper">
 <label class="option" for="edit-submitted-mail-list-9"><input type="checkbox" name="submitted[mail_list][greenland-is]" id="edit-submitted-mail-list-9" value="greenland-is" class="form-checkbox"> Greenland Ice Sheets</label>
</div>
<div class="form-item" id="edit-submitted-mail-list-10-wrapper">
 <label class="option" for="edit-submitted-mail-list-10"><input type="checkbox" name="submitted[mail_list][land cover]" id="edit-submitted-mail-list-10" value="land cover" class="form-checkbox"> Land Cover</label>
</div>
<div class="form-item" id="edit-submitted-mail-list-11-wrapper">
 <label class="option" for="edit-submitted-mail-list-11"><input type="checkbox" name="submitted[mail_list][high res land cover]" id="edit-submitted-mail-list-11" value="high res land cover" class="form-checkbox"> High Resolution Land Cover</label>
</div>
<div class="form-item" id="edit-submitted-mail-list-12-wrapper">
 <label class="option" for="edit-submitted-mail-list-12"><input type="checkbox" name="submitted[mail_list][lst]" id="edit-submitted-mail-list-12" value="lst" class="form-checkbox"> Land Surface Temperature (LST)</label>
</div>
<div class="form-item" id="edit-submitted-mail-list-13-wrapper">
 <label class="option" for="edit-submitted-mail-list-13"><input type="checkbox" name="submitted[mail_list][ocean colour]" id="edit-submitted-mail-list-13" value="ocean colour" class="form-checkbox"> Ocean Colour</label>
</div>
<div class="form-item" id="edit-submitted-mail-list-14-wrapper">
 <label class="option" for="edit-submitted-mail-list-14"><input type="checkbox" name="submitted[mail_list][ozone]" id="edit-submitted-mail-list-14" value="ozone" class="form-checkbox"> Ozone</label>
</div>
<div class="form-item" id="edit-submitted-mail-list-15-wrapper">
 <label class="option" for="edit-submitted-mail-list-15"><input type="checkbox" name="submitted[mail_list][permafrost]" id="edit-submitted-mail-list-15" value="permafrost" class="form-checkbox"> Permafrost</label>
</div>
<div class="form-item" id="edit-submitted-mail-list-16wrapper">
 <label class="option" for="edit-submitted-mail-list-16"><input type="checkbox" name="submitted[mail_list][salinity]" id="edit-submitted-mail-list-16" value="salinity" class="form-checkbox"> Salinity</label>
</div>
<div class="form-item" id="edit-submitted-mail-list-17-wrapper">
 <label class="option" for="edit-submitted-mail-list-17"><input type="checkbox" name="submitted[mail_list][sea ice]" id="edit-submitted-mail-list-17" value="sea ice" class="form-checkbox"> Sea Ice</label>
</div>
<div class="form-item" id="edit-submitted-mail-list-18-wrapper">
 <label class="option" for="edit-submitted-mail-list-18"><input type="checkbox" name="submitted[mail_list][sea level]" id="edit-submitted-mail-list-18" value="sea level" class="form-checkbox"> Sea Level</label>
</div>
<div class="form-item" id="edit-submitted-mail-list-19-wrapper">
 <label class="option" for="edit-submitted-mail-list-19"><input type="checkbox" name="submitted[mail_list][sea level budget closure]" id="edit-submitted-mail-list-19" value="sea level budget closure" class="form-checkbox"> Sea Level Budget Closure</label>
</div>
<div class="form-item" id="edit-submitted-mail-list-20-wrapper">
 <label class="option" for="edit-submitted-mail-list-20"><input type="checkbox" name="submitted[mail_list][sea state]" id="edit-submitted-mail-list-20" value="sea state" class="form-checkbox"> Sea State</label>
</div>
<div class="form-item" id="edit-submitted-mail-list-21-wrapper">
 <label class="option" for="edit-submitted-mail-list-21"><input type="checkbox" name="submitted[mail_list][soil]" id="edit-submitted-mail-list-21" value="soil" class="form-checkbox"> Soil Moisture</label>
</div>
<div class="form-item" id="edit-submitted-mail-list-22-wrapper">
 <label class="option" for="edit-submitted-mail-list-22"><input type="checkbox" name="submitted[mail_list][snow]" id="edit-submitted-mail-list-22" value="snow" class="form-checkbox"> Snow</label>
</div>
<div class="form-item" id="edit-submitted-mail-list-23-wrapper">
 <label class="option" for="edit-submitted-mail-list-23"><input type="checkbox" name="submitted[mail_list][sst]" id="edit-submitted-mail-list-23" value="sst" class="form-checkbox"> Sea Surface Temperature (SST)</label>
</div>
<div class="form-item" id="edit-submitted-mail-list-24-wrapper">
 <label class="option" for="edit-submitted-mail-list-24"><input type="checkbox" name="submitted[mail_list][water vapour]" id="edit-submitted-mail-list-24" value="water vapour" class="form-checkbox"> Water Vapour</label>
</div>
<div class="form-item" id="edit-submitted-mail-list-25-wrapper">
 <label class="option" for="edit-submitted-mail-list-25"><input type="checkbox" name="submitted[mail_list][toolbox]" id="edit-submitted-mail-list-25" value="toolbox" class="form-checkbox"> Toolbox</label>
</div>
</div>
</div>
</div><div class="webform-component webform-component-markup" id="webform-component-terms-and-conditions"><p><a href="/content/terms-and-conditions" target="_blank">Our Terms and Conditions</a></p>
</div><input type="hidden" name="details[sid]" id="edit-details-sid" value="">
<input type="hidden" name="details[page_num]" id="edit-details-page-num" value="1">
<input type="hidden" name="details[page_count]" id="edit-details-page-count" value="1">
<input type="hidden" name="details[finished]" id="edit-details-finished" value="0">
<input type="hidden" name="form_build_id" id="form-GQQh64fEveYtp1OtptMq2QDIgD_lmDjRk4yiuN15pwU" value="form-GQQh64fEveYtp1OtptMq2QDIgD_lmDjRk4yiuN15pwU">
<input type="hidden" name="form_token" id="edit-webform-client-form-153-form-token" value="ac6d877be434c2a2e9a36867104f2979">
<input type="hidden" name="form_id" id="edit-webform-client-form-153" value="webform_client_form_153">
<div id="signUpFormErrorMsg2"></div>
<div id="edit-actions" class="form-actions form-wrapper"><input type="submit" name="op" id="edit-submit" value="Submit" class="form-submit">
<button id="notNowButton" class="btnNotNow" type="button" name="notnow" onClick="signUpNotNow();">Not now, just take me to the data</button>
</div>
</div></form>

</div>
<script>
		// Access our form...
	  var signupform = document.getElementById("webform-client-form-153");

	  // ...to take over the submit event
	  signupform.addEventListener('submit', function (event) {
		event.preventDefault();
		//sendData();
	  });
</script>
	</body>
</html>