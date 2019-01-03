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
				margin-top:15px;
			}
			#cboxClose {
				border: 0px;
			}
		</style>
		<script>
		function tryAgain() {
			parent.jQuery.colorbox({iframe:true, width:"525", height:"620", href: "http://cci.esa.int/sites/all/themes/drupal-contrib/ESA CCI/sign-up-form.php"})
		}
		</script>
	</head>
	<body>
	<div id="signUpFrame">
<h1>Ooops!</h1>
<p>There was an error submitting your form, click the button below to try again.</p>
<button type="button" name="tryAgain" onClick="tryAgain();">Retry</button>
</div>
	</body>
</html>