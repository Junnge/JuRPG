export function action_status(gameState, gameContent, fight, adventure) {
	var box = document.getElementById("action_buttons");
	box.innerHTML = "";

	console.log("action_status")

	let status = gameState.player.status

	if (status in gameContent.activities){
		let child = document.createElement("img");
		child.id = "activity_button"
		child.src = `img/buttons/${status}_button_unactive.png`;
		child.onclick = (e) => {gameState.current_event.go();}
		box.appendChild(child)
	}
	if (status == "in_combat" || status == "stealth"){
		let child = document.createElement("img");
		child.id = "fight_button"
		child.src = `img/buttons/fight_button_unactive.png`;
		child.onclick = (e) => {fight(gameState.current_fight)};
		box.appendChild(child)
	}
	if (status in gameContent.activities || status == "idle" || status == "stealth"){
		let child = document.createElement("img");
		child.id = "adv_button"
		child.src = `img/buttons/adv_button_unactive.png`;
		child.onclick = (e) => {adventure(gameState.player)};
		box.appendChild(child)
	}
	if (status == "busy"){
		let child = document.createElement("div");
		child.id = "timer_countdown"
		box.appendChild(child)

		//console.log(activity.cd, performance.now(), activity.timestamp);
		//var time_left = activity.cd - (performance.now() - activity.timestamp);
		//document.getElementById("action_buttons").innerHTML = `Вы заняты делом. Осталось ${H(Math.floor(time_left/1000)+' секунд')}`;
	}
}