export var dataArrays = {}

/**
 * Stores all game's content. Items, locations, loot, etc.
 * @type {import("./types").GameContent}
 */
export var gameContent = {
	items: {},
	enemies: {},
	locations: {},
	activities: {},
	npcs: {},
	findings: {},
	crafts: {}
}

var JSONs_to_load = 0

export function loadJSON(file, callback) {
	JSONs_to_load++;

	var rawFile = new XMLHttpRequest();
	rawFile.overrideMimeType("application/json");
	rawFile.open("GET", file, true);
	rawFile.onreadystatechange = function() {
		if (rawFile.readyState === 4 && rawFile.status == 200) {
			callback(rawFile.responseText, file);
		}
	}
	rawFile.send(null);
}

export function jsoncallback(text, file){
	dataArrays[file] = JSON.parse(text);
}

export function arrLoad(argument) {
    console.log("json loading")

	JSONs_to_load = 0;

    loadJSON("data/items.json", jsoncallback);
    loadJSON("data/enemies.json", jsoncallback);
    loadJSON("data/locations.json", jsoncallback);
    loadJSON("data/activities.json", jsoncallback);
    loadJSON("data/npcs.json", jsoncallback);
    loadJSON("data/findings.json", jsoncallback);
	loadJSON("data/crafts.json", jsoncallback);

	if (Object.keys(dataArrays).length != JSONs_to_load){
		console.log('loading');
		return 0;
	} else {
		finalize()
		return 1
	}
}

function finalize() {
	gameContent.items = dataArrays["data/items.json"];
	gameContent.enemies = dataArrays["data/enemies.json"];
	gameContent.locations = dataArrays["data/locations.json"];
	gameContent.activities = dataArrays["data/activities.json"];
	gameContent.npcs = dataArrays["data/npcs.json"];
	gameContent.findings = dataArrays["data/findings.json"];
	gameContent.crafts = dataArrays["data/crafts.json"];
}