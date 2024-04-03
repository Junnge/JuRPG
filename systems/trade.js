import { gameContent } from "../engine/database.js"

export function get_charisma_bonus(player) {
	return (player.special.charisma - 1) / 18
}

export function get_buying_price(player, item) {
    console.log(player)

	let price = gameContent.items[item].price * 3
	let coef = get_charisma_bonus(player)
	if (item != "cap") {price = price - Math.round(price * coef)}
	return price;
}

export function get_selling_price(player, item) {
	let price = gameContent.items[item].price
	let coef = get_charisma_bonus(player,)
	if (item != "cap") {price = price + Math.round(price * coef)}
	return price;
}