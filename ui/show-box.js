function show_box(box, button, button2) {
	document.getElementById('action_button').src = "img/buttons/button_unactive.png";
	document.getElementById('map_button').src = "img/buttons/button_unactive.png";
	document.getElementById('stats_button').src = "img/buttons/button_unactive.png";
	document.getElementById('action_box').style = "visibility: hidden;";
	document.getElementById('map_box').style = "visibility: hidden;";
	//document.getElementById('stats_box').style = "visibility: hidden;";
	document.getElementById('action_buttons').style = "visibility: hidden;";
	document.getElementById('stats_buttons').style = "visibility: hidden;";
	document.getElementById('city_map_box').style = "visibility: hidden;";
	document.getElementById('shop_box').style = "visibility: hidden;";
	document.getElementById('hero_box').style = "visibility: hidden;";

	document.getElementById('inv_box').style = "visibility: hidden;";
	document.getElementById('statistics_box').style = "visibility: hidden;";
	//document.getElementById('settings_box').style = "visibility: hidden;";
	document.getElementById(box).style = "visibility: visible;"
	document.getElementById(button).src = "img/buttons/button_active.png";

	if (box == 'action_box') {document.getElementById('action_buttons').style = "visibility: visible;"}
	if (box == 'hero_box' || box == 'inv_box' || box == 'statistics_box' ) {
		document.getElementById('stats_buttons').style = "visibility: visible;"
		if (button2 == 'hero_button') {document.getElementById('hero_box').style = "visibility: visible;"}
		if (button2 == 'inv_button') {document.getElementById('inv_box').style = "visibility: visible;"}
		if (button2 == 'statistics_button') {document.getElementById('statistics_box').style = "visibility: visible;"}
		//if (button2 == 'settings_button') {document.getElementById('settings_box').style = "visibility: visible;"}
	}
}