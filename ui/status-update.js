
import { addToInnerHTMLById, scrollDownById, setInnerHTMLById } from "./common.js";

/**
 * Вывод text в лог сообщений, обновление всех показателей на панелях
 * @param {import('../classes/character-player').Player} player
 * @param {Object} current_fight
 * @param {string} text
 */
export function _status_update(player, current_fight, text) {
	if (text!=undefined) {action_log(text);}

	setInnerHTMLById('exp_bar', "Опыт: " + player.exp + " | " + player.get_next_lvl_exp())
	setInnerHTMLById('health_bar_enemy', "Здоровье: " + current_fight.get_player_target_hp());
	setInnerHTMLById('health_bar_hero', "Здоровье: " + player.hp + "|" + player.hp_max);
	setInnerHTMLById('enemy_name', "Имя: " + current_fight.get_player_target_name());
	scrollDownById('action_box');
}

/**
 *
 * @param {string} text
 */
export function action_log(text) {
	addToInnerHTMLById('action_box', "<p>" + text + "</p>");
}