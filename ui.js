import { H } from "./engine/common.js";
import { gameContent } from "./engine/database.js";
import { cheats, equip, gameState, reset, save_all, status_update, unequip } from "./main.js";
import { get_buying_price, get_selling_price } from "./systems/trade.js";

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

function bind_on_click(id, func) {
	document.getElementById(id).onclick = func
}


function raise_special_level(player, special){
	player.special[special]++;
	player.special_points--;
	show_player_stats(player);
	player.set_hp_max();
	status_update();
}

function raise_special_level_callback(player, special) {
	return (e) => {
		raise_special_level(player, special)
	}
}

function show_player_stats(player) { // former Player.show_stats
	let special_box = document.getElementById('special_box')
	special_box.innerHTML = "";

	for (var spec in player.special) {
		let line = document.createElement("div")
		line.classList.add("row")

		let info_display = document.createElement("div");
		info_display.innerText = `${special_visible_names[spec]}: ${player.special[spec]}`
		line.appendChild(info_display);

		if (player.special_points > 0 && player.special[spec] <10){
			let special_up_button = document.createElement("img");
			special_up_button.src = "img/buttons/skill_increase_button.png"
			special_up_button.onclick = raise_special_level_callback(player, spec)
			special_up_button.classList.add("plus_button")
			line.appendChild(special_up_button)
		}

		special_box.appendChild(line)
	}

	let remainder_info_box = document.createElement("div")
	remainder_info_box.innerText = `Осталось очков SPECIAL: ${player.special_points}`;
	special_box.appendChild(remainder_info_box)

	document.getElementById('info_box').innerHTML = "";
	document.getElementById('info_box').innerHTML += `<p>Уровень: ${player.lvl}`;
}

function attach_equip_on_click(player, element, item, inventory) {
	element.onclick = (e) => {
		unequip(player, inventory, gameContent.items[item].slot);
		equip(player, inventory, item);
		show_inventory(player, inventory)
	}
}

function show_inventory(player, inventory) {
	let inventory_box = document.getElementById('stuff_box')
	inventory_box.innerHTML = '';

	console.log(inventory.stuff)

	for (let item in inventory.stuff) {
		let name = gameContent.items[item].name
		let amount = inventory.stuff[item]
		let display_string = `${name} (${amount})`

		let item_node = document.createElement("div");
		item_node.classList.add("row")
		inventory_box.appendChild(item_node);

		let name_node = document.createElement("div");
		name_node.innerHTML = display_string
		name_node.id = item
		item_node.appendChild(name_node)

		if (gameContent.items[item].slot != undefined){
			attach_equip_on_click(player, name_node, item, inventory);
		}

		if (gameContent.items[item].heal != undefined && inventory.stuff[item] > 0){
			let usage_button = document.createElement("img");
			usage_button.classList.add("plus_button")
			usage_button.src = "img/buttons/skill_increase_button.png"
			usage_button.onclick = (e) => {
				player.hp += gameContent.items[item].heal;
				status_update();
				inventory.remove(item, 1);
				show_inventory(player, inventory)
			}
			item_node.appendChild(usage_button)
		}
	}

	equip_box = document.getElementById('equip_box')

	equip_box.innerHTML = '';

	let weapon_box = document.createElement("div");
	let head_box = document.createElement("div");
	let body_box = document.createElement("div");

	weapon_box.innerHTML = `Руки: ${H(player.slots.weapon.name)}`
	head_box.innerHTML = `Голова: ${H(player.slots.head.name)}`
	body_box.innerHTML = `Тело: ${H(player.slots.body.name)}`

	weapon_box.onclick = (e) => {
		unequip(player, inventory, "weapon");
		show_inventory(player, inventory);
	}
	head_box.onclick = (e) => {
		unequip(player, inventory, "head");
		show_inventory(player, inventory);
	}
	body_box.onclick = (e) => {
		unequip(player, inventory, "body");
		show_inventory(player, inventory);
	}

	equip_box.appendChild(weapon_box);
	equip_box.appendChild(head_box);
	equip_box.appendChild(body_box);
}

// setting up the UI actions

document.getElementById("hero_button").onclick = (e) => {
	show_box('hero_box', 'stats_button', 'hero_button');
	show_player_stats(gameState.player);
}
document.getElementById("inv_button").onclick = (e) => {
	show_box('inv_box', 'stats_button', 'inv_button');
	show_inventory(gameState.player, gameState.inventory);
}
document.getElementById("statistics_button").onclick = (e) =>{
	show_box('statistics_box', 'stats_button', 'statistics_button');
}

bind_on_click("action_button", (e) => {
	show_box('action_box', 'action_button');
});

bind_on_click("map_button", (e) => {
	show_box('map_box', 'map_button');
});

bind_on_click("stats_button", (e) => {
	show_box('inv_box', 'stats_button', 'inv_button');
	show_inventory(gameState.player, gameState.inventory);
});

document.getElementById("action_box").onwheel = function(e){
	document.getElementById("action_box").scrollBy(0, e.deltaY *4);
	e.preventDefault();
}
document.getElementById("npc_inv_box").onwheel = (e) => {
	document.getElementById("npc_inv_box").scrollBy(0, e.deltaY *4);
	e.preventDefault();
}

var action_buttons_elements = document.getElementById('action_buttons');
action_buttons_elements.addEventListener("mouseover", function mo(s){
	if (s.target.id == 'activity_button') {
		s.target.src='img/buttons/'+gameState.player.status+'_button_active.png';
	} else s.target.src='img/buttons/'+s.target.id+'_active.png';
});
action_buttons_elements.addEventListener("mouseout", function mo(s){
	if (s.target.id == 'activity_button') {
		s.target.src='img/buttons/'+gameState.player.status+'_button_unactive.png';
	} else s.target.src='img/buttons/'+s.target.id+'_unactive.png';
});

var stats_buttons_elements = document.getElementById('stats_buttons');
stats_buttons_elements.addEventListener("mouseover", function mo(s){
	s.target.src='img/buttons/'+s.target.id+'_active.png';
});
stats_buttons_elements.addEventListener("mouseout", function mo(s){
	s.target.src='img/buttons/'+s.target.id+'_unactive.png';
});


function shop_item_line(customer, customer_inventory, item_id, item_data, mode, price, amount) {
	let new_line = document.createElement("div");
	new_line.classList.add("item_box");
	new_line.classList.add("row")

	let item_description = document.createElement("div");
	item_description.classList.add("item");
	item_description.onclick = (e) => {
		show_item_info(customer, customer_inventory, mode, item_id);
	}
	item_description.innerHTML = item_data.name + `(${amount})`;

	let price_box = document.createElement("div");
	price_box.classList.add("price");
	price_box.innerText = `| Цена: ${price}`

	new_line.appendChild(item_description);
	new_line.appendChild(price_box);

	return new_line;
}

var npctmp;
function uinpc(customer, inventory, button, id=npctmp){
	console.log(id)
	var npc = gameContent.npcs[id];
	npctmp = id;
	document.getElementById("npc_name_box").innerHTML = npc.name;
	var phrase = npc.phrase.replace("{{sexref}}", npc[customer.sex]);
	document.getElementById("phrase_box").innerHTML = phrase;

	let npc_inventory = document.getElementById('npc_inv_box')

	npc_inventory.innerHTML = '';

	if (button == "buy"){
		for (var i = 0; i < npc.list.length ; i++){
			var item = gameContent.items[npc.list[i]];
			let line = shop_item_line(
				customer,
				inventory,
				npc.list[i],
				item,
				button,
				get_buying_price(customer, npc.list[i]),
				"Беск."
			);
			npc_inventory.appendChild(line);
		}
	} else if (button == 'sell'){
		for (var item_id in inventory.stuff) {
			let line = shop_item_line(
				customer,
				inventory,
				item_id,
				gameContent.items[item_id],
				button,
				get_selling_price(customer, item_id),
				inventory.stuff[item_id]
			);
			npc_inventory.appendChild(line);
		}
	}
}

bind_on_click("shop_1_icon", (e) => {
	show_box('shop_box', 'map_button');
	uinpc(gameState.player, gameState.inventory, 'buy','dube');
})

bind_on_click("shop_2_icon", (e) => {
	show_box('shop_box', 'map_button');
	uinpc(gameState.player, gameState.inventory, 'buy','joe');
})

bind_on_click("shop_3_icon", (e) => {
	show_box('shop_box', 'map_button');
	uinpc(gameState.player, gameState.inventory, 'buy','miles');
})

bind_on_click("buy_button", (e) => {
	uinpc(gameState.player, gameState.inventory, "buy");
})

bind_on_click("sell_button", (e) => {
	uinpc(gameState.player, gameState.inventory, "sell");
})

function show_item_info(customer, customer_inventory, button, item_id){
	let price = 0
	if (button == 'buy') {var btext = "Купить"; price = get_buying_price(customer, item_id)} else { var btext = "Продать"; price = get_selling_price(customer, item_id)}

	let shop_box_info = document.getElementById("shop_info_box")

	shop_box_info.innerHTML = '';

	let description_box = document.createElement("div");
	description_box.id = "shop_item_info_box";
	description_box.textContent = gameContent.items[item_id].description;
	shop_box_info.appendChild(description_box);

	let shop_box_button_1 = document.createElement("div")
	shop_box_button_1.classList.add("bb")
	shop_box_button_1.id = "b1"
	shop_box_button_1.onclick = (e) => {
		customer_inventory[button](item_id, price, 1);
		uinpc(customer, customer_inventory, button)
	}
	shop_box_button_1.textContent = btext + " 1"

	let shop_box_button_10 = document.createElement("div")
	shop_box_button_10.classList.add("bb")
	shop_box_button_10.id = "b10"
	shop_box_button_10.onclick = (e) => {
		customer_inventory[button](item_id, price, 10);
		uinpc(customer, customer_inventory, button)
	}
	shop_box_button_10.textContent = btext + " 10"

	description_box.appendChild(shop_box_button_1)
	description_box.appendChild(shop_box_button_10)

}

bind_on_click("button_save", save_all);
bind_on_click("button_cheat", cheats);
bind_on_click("button_reset", reset);

bind_on_click("travel_ruins", (e) => {
	gameState.player.travel("ruins");
	status_update()
})

bind_on_click("travel_rock", (e) => {
	gameState.player.travel("rock");
	status_update()
})