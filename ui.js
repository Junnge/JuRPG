var special_visible_names = {
	strength : "Сила",
	perception : "Наблюдательность",
	endurance : "Выносливость",
	charisma : "Харизма",
	intellegence : "Интеллект",
	agility : "Ловкость",
	luck : "Удача"
};

//Отображение элементов интерфейса 
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

function raise_special_level(player, special){
	player.special[special]++;
	player.special_points--; 
	show_player_stats(player); 
	player.set_hp_max(); 
	player.hp_change(10); 
	status_update();
}

function show_player_stats(player) { // former Player.show_stats
	document.getElementById('special_box').innerHTML = "";
	for (var spec in player.special) {
		document.getElementById('special_box').innerHTML += `<br><a>${special_visible_names[spec]}: ${player.special[spec]}</a>`
		if (player.special_points > 0 && player.special[spec] <10){
			document.getElementById('special_box').innerHTML += `  <img src="img/buttons/skill_increase_button.png" onclick="raise_special_level(player, "${spec}">`;
		}
	}
	document.getElementById('special_box').innerHTML += `<br><p>Осталось очков SPECIAL: ${player.special_points}`;

	document.getElementById('info_box').innerHTML = "";
	document.getElementById('info_box').innerHTML += `<p>Уровень: ${player.lvl}`;
	}

//Очень страшная ф-я для обработки колесика мышки
var elem = document.getElementById('action_box');
if (elem.addEventListener) {
	if ('onwheel' in document) {
		// IE9+, FF17+, Ch31+
		elem.addEventListener("wheel", onWheel);
	} else if ('onmousewheel' in document) {
		// устаревший вариант события
		elem.addEventListener("mousewheel", onWheel);
	} else {
		// Firefox < 17
		elem.addEventListener("MozMousePixelScroll", onWheel);
	}
	} else { // IE8-
		elem.attachEvent("onmousewheel", onWheel);
	}

function onWheel(e) {
	e = e || window.event;
	var delta = e.deltaY || e.detail || e.wheelDelta;
	var info = document.getElementById('action_box');
	document.getElementById('action_box').scrollTop += delta*3;
	e.preventDefault ? e.preventDefault() : (e.returnValue = false);
}

var action_buttons_elements = document.getElementById('action_buttons');
action_buttons_elements.addEventListener("mouseover", function mo(s){
	if (s.target.id == 'activity_button') {
		s.target.src='img/buttons/'+activity.type+'_button_active.png';
	} else s.target.src='img/buttons/'+s.target.id+'_active.png';
});
action_buttons_elements.addEventListener("mouseout", function mo(s){
	if (s.target.id == 'activity_button') {
		s.target.src='img/buttons/'+activity.type+'_button_unactive.png';
	} else s.target.src='img/buttons/'+s.target.id+'_unactive.png';
});

var stats_buttons_elements = document.getElementById('stats_buttons');
stats_buttons_elements.addEventListener("mouseover", function mo(s){
	s.target.src='img/buttons/'+s.target.id+'_active.png';
});
stats_buttons_elements.addEventListener("mouseout", function mo(s){
	s.target.src='img/buttons/'+s.target.id+'_unactive.png';
});

