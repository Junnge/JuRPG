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
	status_update();
}

function show_player_stats(player) { // former Player.show_stats
	document.getElementById('special_box').innerHTML = "";
	for (var spec in player.special) {
		document.getElementById('special_box').innerHTML += `<br><a>${special_visible_names[spec]}: ${player.special[spec]}</a>`
		if (player.special_points > 0 && player.special[spec] <10){
			document.getElementById('special_box').innerHTML += `  <img src="img/buttons/skill_increase_button.png" onclick="raise_special_level(player, '${spec}')">`;
		}
	}
	document.getElementById('special_box').innerHTML += `<br><p>Осталось очков SPECIAL: ${player.special_points}`;

	document.getElementById('info_box').innerHTML = "";
	document.getElementById('info_box').innerHTML += `<p>Уровень: ${player.lvl}`;
	}

document.getElementById("action_box").onwheel = function(e){
      document.getElementById("action_box").scrollBy(0, e.deltaY *4);
      e.preventDefault();
}
document.getElementById("npc_inv_box").onwheel = function(e){
      document.getElementById("npc_inv_box").scrollBy(0, e.deltaY *4);
      e.preventDefault();
}

var action_buttons_elements = document.getElementById('action_buttons');
action_buttons_elements.addEventListener("mouseover", function mo(s){
	if (s.target.id == 'activity_button') {
		s.target.src='img/buttons/'+player.status+'_button_active.png';
	} else s.target.src='img/buttons/'+s.target.id+'_active.png';
});
action_buttons_elements.addEventListener("mouseout", function mo(s){
	if (s.target.id == 'activity_button') {
		s.target.src='img/buttons/'+player.status+'_button_unactive.png';
	} else s.target.src='img/buttons/'+s.target.id+'_unactive.png';
});

var stats_buttons_elements = document.getElementById('stats_buttons');
stats_buttons_elements.addEventListener("mouseover", function mo(s){
	s.target.src='img/buttons/'+s.target.id+'_active.png';
});
stats_buttons_elements.addEventListener("mouseout", function mo(s){
	s.target.src='img/buttons/'+s.target.id+'_unactive.png';
});


function H(arg){
	return "<a class='brackets'>["+arg+"]</a>"
}

var npctmp;
function uinpc(button,id=npctmp){
	var npc = arrNpcs[id];
	npctmp = id;
    document.getElementById("npc_name_box").innerHTML = npc.name;
    var phrase = npc.phrase.replace("{{sexref}}", npc[player.sex]);
    document.getElementById("phrase_box").innerHTML = phrase;
    document.getElementById('npc_inv_box').innerHTML = '';
    if (button == "buy"){
        for (var i = 0; i < npc.list.length ; i++){
            var item = arrItems[npc.list[i]];
            document.getElementById('npc_inv_box').innerHTML += `<div class="item_box"><a class="item" onclick="show_item_info('${button}','${npc.list[i]}')">${item.name}</a><a class="price"> | Цена: ${get_price(npc.list[i])}</a></div>`;
        } 
    } else if (button == 'sell'){
    	for (var item in inv.stuff) {
    		document.getElementById('npc_inv_box').innerHTML += `<div class="item_box"><a class="item" onclick="show_item_info('${button}','${item}')">${arrItems[item].name} (${inv.stuff[item]})</a><a class="price"> | Цена: ${get_price(item)}</a></div>`;
   		}
    }
}
  
function show_item_info(button, item_id){
  	if (button == 'buy') {var btext = "Купить"} else { var btext = "Продать"}
  	document.getElementById("shop_info_box").innerHTML = '';
    document.getElementById("shop_info_box").innerHTML += `<div id='shop_item_info_box'>${arrItems[item_id].description}</div>`;
    document.getElementById("shop_info_box").innerHTML += `<a class="bb" id="b1" onclick="inv.${button}('${item_id}', ${get_price(item_id)}, 1); uinpc('${button}')">${btext} 1</a>`
    document.getElementById("shop_info_box").innerHTML += `<a class="bb" id="b10" onclick="inv.${button}('${item_id}', ${get_price(item_id)}, 10); uinpc('${button}')">${btext} 10</a>`
}

function get_price(item) {
	return arrItems[item].price + Math.round(arrItems[item].price * ((10 - player.special.charisma) / 18));
}

function action_status() {
	player.status;
	var box = document.getElementById("action_buttons");
	box.innerHTML = "";
	if (player.status in arrActivities){
		box.innerHTML += `<img src='img/buttons/${player.status}_button_unactive.png'; id="activity_button" class="a_button" onclick="event.go()">`;
	}
	if (player.status == "in_combat" || player.status == "stealth"){
		box.innerHTML += `<img src="img/buttons/fight_button_unactive.png" id="fight_button" onclick="fight()">`;
	}
	if (player.status in arrActivities || player.status == "idle" || player.status == "stealth"){
		box.innerHTML += `<img src="img/buttons/adv_button_unactive.png" id="adv_button" onclick="adventure()">`;
	}
	if (player.status == "busy"){
		//console.log(activity.cd, performance.now(), activity.timestamp);
		//var time_left = activity.cd - (performance.now() - activity.timestamp);
		//document.getElementById("action_buttons").innerHTML = `Вы заняты делом. Осталось ${H(Math.floor(time_left/1000)+' секунд')}`;
	}
}