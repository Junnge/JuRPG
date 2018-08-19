function randomInt(min, max) {
	var rand = min - 0.5 + Math.random() * (max - min + 1)
	rand = Math.round(rand);
	return rand;
}
var xp=0;
var forage_cd=0;

var arrEnemies = []; //Массив монстров
arrEnemies[0] = {
	name : "Койот",
	hp : 25,
	dmg : 1,
	exp : 3
}
arrEnemies[1] = {
	name : "Скорпион",
	hp : 35,
	dmg : 2,
	exp : 5
}
arrEnemies[2] = {
	name : "Геккон",
	hp : 30,
	dmg : 2,
	exp : 4
}

var enemyObject = new Object();

enemyObject["name"] = "Рядом нет врагов";
enemyObject["hp"] = 0;
enemyObject["dmg"] = 0;
enemyObject["exp"] = 0;


function Player(name) {
	this.name = name;
	this.lvl = 0;
	this.exp = 0;
	this.skill_points = 0;
	this.base_damage = 1;
	
	this.give_exp = function(x) {
		this.exp = this.exp + x;
		while (this.exp >= this.get_next_lvl_exp()) {
			this.lvlup();
		}
	}
	
	this.lvlup = function() {
		this.base_damage++;
		this.skill_points++;
		this.exp = this.exp - this.get_next_lvl_exp();
		this.lvl = this.lvl + 1;
		status_update("<p>Теперь вы "+this.lvl+" уровня</p>");
	}
	
	this.get_next_lvl_exp = function() {
		return 10 * (this.lvl + 1);
	}
}


var player = new Player('whoever');

function hunt() {
	if (forage_cd==0) {
		player.give_exp(1);
		status_update("<p>Вы поймали "+randomInt(2, 4)+" ящерицы и получили 1XP</p>");
		forage_cd = 1;
		setTimeout(function(){forage_cd=0;}, 10000);
	} else status_update("<p>Вы устали!</p>");
}

function adventure(){
	var id = randomInt(0, arrEnemies.length-1);
	change_enemy(id)
	status_update("</p>Вы встретили "+enemyObject.name+"</p>");
}

function fight(){
	if(enemyObject.hp > 0){
		var damage = player.base_damage + randomInt(1, 6);
		enemyObject.hp -= damage;
		if (enemyObject.hp<=0) {
			enemyObject.hp=0;
			kill_current_enemy()
		} else {
			status_update("<p>Вы нанесли ["+enemyObject.name+"] "+damage+" урона</p>");
		}
	}
}

function change_enemy(id){
	if (id == -1) {
		enemyObject["name"] = "Рядом нет врагов";
		enemyObject["hp"] = 0;
		enemyObject["dmg"] = 0;
		enemyObject["exp"] = 0;
	} else {
		enemyObject["name"] = arrEnemies[id].name;
		enemyObject["hp"] = arrEnemies[id].hp;
		enemyObject["dmg"] = arrEnemies[id].dmg;
		enemyObject["exp"] = arrEnemies[id].exp;
	}
}

function kill_current_enemy(){
	player.give_exp(enemyObject.exp);
	status_update("<p>Вы убили ["+enemyObject.name+"] и получили "+enemyObject.exp+" опыта</p>");
	change_enemy(-1);      
	status_update();  
}


function status_update(text) {
	if (text!=undefined) {document.getElementById('text_box').innerHTML += text;}	
	document.getElementById('exp_bar').innerHTML = "Опыт: " + player.exp + " | " + player.get_next_lvl_exp();
	document.getElementById('health_bar_enemy').innerHTML = "Здоровье: "+enemyObject.hp;
	document.getElementById('enemy_name').innerHTML = "Имя: "+enemyObject.name;
	document.getElementById('text_box').scrollTop = 9999;
}

function show_box(box, button) {
document.getElementById('text_button').src = "button_unactive.png";
document.getElementById('map_button').src = "button_unactive.png";
document.getElementById('status_button').src = "button_unactive.png";
document.getElementById('text_box').style = "visibility: hidden;"
document.getElementById('map_box').style = "visibility: hidden;"
document.getElementById('status_box').style = "visibility: hidden;"
document.getElementById('action_buttons').style = "visibility: hidden;"
document.getElementById(box).style = "visibility: visible;"
document.getElementById(button).src = "button_active.png";

	if (box == 'text_box') {document.getElementById('action_buttons').style = "visibility: visible;"}
}

//очень страшная ф-я для обработки колесика мышки
var elem = document.getElementById('text_box');
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

  var info = document.getElementById('text_box');

  document.getElementById('text_box').scrollTop += delta*3;
  e.preventDefault ? e.preventDefault() : (e.returnValue = false);
}