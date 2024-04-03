
/**
 *
 * @param {string} id
 */
function hideById(id) {
	let element = document.getElementById(id)
	if (element == undefined) {
		alert("Attempt to hide element which doesn't exist: " + id)
		return
	}
	element.style.visibility = "hidden"
}

/**
 *
 * @param {string} id
 */
function unhideById(id) {
	let element = document.getElementById(id)
	if (element == undefined) {
		alert("Attempt to unhide element which doesn't exist: " + id)
		return
	}
	element.style.visibility = "visible"
}

/**
 *
 * @param {string[]} ids
 */
function hideByIds(ids) {
	for (let item of ids) {
		hideById(item)
	}
}

/**
 *
 * @param {string} id
 */
function deactivateButton(id) {
	let element = /** @type {HTMLImageElement} */(document.getElementById(id))
	if (element == undefined) {
		alert("Attempt to deactivate button which doesn't exist: " + id)
		return
	}
	element.src = "img/buttons/button_unactive.png"
}

/**
 *
 * @param {string} id
 */
function activateButton(id) {
	let element = /** @type {HTMLImageElement} */(document.getElementById(id))
	if (element == undefined) {
		alert("Attempt to deactivate button which doesn't exist: " + id)
		return
	}
	element.src = "img/buttons/button_active.png"
}

/**
 *
 * @param {string} box
 * @param {string} button currently pressed menu button
 * @param {string|undefined} button2 currently secondary menu button
 */
function show_box(box, button, button2) {
	deactivateButton('action_button');
	deactivateButton('map_button');
	deactivateButton('stats_button');

	hideByIds([
		'action_box', 'map_box', 'action_buttons', 'stats_buttons',
		'shop_box', 'hero_box', 'craft_box', 'inv_box', 'statistics_box', 'city_map_box'
	])

	unhideById(box);
	activateButton(button);

	if (box == 'action_box') {
		unhideById('action_buttons')
	}
	if (box == 'hero_box' || box == 'inv_box' || box == 'statistics_box' ) {
		unhideById('stats_buttons');

		if (button2 == 'hero_button') unhideById('hero_box');
		if (button2 == 'inv_button') unhideById('inv_box');
		if (button2 == 'statistics_button') unhideById('statistics_box');
	}
}