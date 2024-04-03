//Вывод text в лог сообщений, обновление всех показателей на панелях
export function _status_update(player, current_fight, text) {
	if (text!=undefined) {action_log(text);}

	document.getElementById('exp_bar').innerHTML = "Опыт: " + player.exp + " | " + player.get_next_lvl_exp();
	document.getElementById('health_bar_enemy').innerHTML = "Здоровье: " + current_fight.get_player_target_hp();
	document.getElementById('health_bar_hero').innerHTML = "Здоровье: " + player.hp + "|" + player.hp_max;
	document.getElementById('enemy_name').innerHTML = "Имя: " + current_fight.get_player_target_name();
	document.getElementById('action_box').scrollTop = 999999;
}

export function action_log(text) {
    document.getElementById('action_box').innerHTML += "<p>" + text + "</p>";
}