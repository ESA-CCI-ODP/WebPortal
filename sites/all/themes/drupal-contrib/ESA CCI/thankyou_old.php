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
			function closeThankyou() {
				parent.jQuery.colorbox.close();
			}
		</script>
	</head>
	<body>
	<div id="signUpFrame">
<h1>Thank you!</h1>
<p>Great, you are now signed up, check your inbox regulary for the latest information from us.</p>
<p>Click the button below to return to the data page.</p>
<button type="button" name="closeThankyou" onClick="closeThankyou();">Close</button>
</div>
	</body>
</html>