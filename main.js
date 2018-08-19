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

	function hunt(argument) {
		if (forage_cd==0) {
			xp++;
			status_update("<p>Вы поймали "+randomInt(2, 4)+" ящерицы и получили 1XP</p>");
			forage_cd = 1;
			setTimeout(function(){forage_cd=0;}, 10000);
		} else status_update("<p>Вы устали!</p>");
	}
	function adventure(){
		var id = randomInt(0, arrEnemies.length-1);
		enemyObject["name"] = arrEnemies[id].name;
		enemyObject["hp"] = arrEnemies[id].hp;
		enemyObject["dmg"] = arrEnemies[id].dmg;
		enemyObject["exp"] = arrEnemies[id].exp;
		status_update("</p>Вы встретили "+enemyObject.name+"</p>");
	}
	function fight(){
		if(enemyObject.hp > 0){
			var damage = 1 + randomInt(1, 6);
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
			enemyObject["name"] = "No enemy";
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
		give_xp(enemyObject.exp);
		status_update("<p>Вы убили ["+enemyObject.name+"] и получили "+enemyObject.exp+" опыта</p>");
		change_enemy(-1)        
	}    
	function give_xp(x) {
		xp += x;
	}
	function status_update(text) {
		document.getElementById('text_box').innerHTML += text;
		document.getElementById('exp_bar').innerHTML = "Опыт: " + xp;
		document.getElementById('health_bar_enemy').innerHTML = "Здоровье: "+enemyObject.hp;
		document.getElementById('enemy_name').innerHTML = "Имя: "+enemyObject.name;
		document.getElementById('text_box').scrollTop = 9999;
	}
	function show_box(box) {
	document.getElementById('text_box').style = "visibility: hidden;"
	document.getElementById('map_box').style = "visibility: hidden;"
	document.getElementById('status_box').style = "visibility: hidden;"
	document.getElementById('action_buttons').style = "visibility: hidden;"
	document.getElementById(box).style = "visibility: visible;"
		if (box == 'text_box') {document.getElementById('action_buttons').style = "visibility: visible;"}
	}