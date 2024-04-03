import { H } from "../engine/common.js";
import { can_craft, craft } from "../systems/craft.js";

/**
 * @param {GameContent} gameContent
 * @param {ItemWithAmount[]} items
 * @returns {string}
 */
function collection_of_items_to_string(gameContent, items) {
    let result = "";

    let comma_flag = false;

    for (let item of items) {
        if (comma_flag)
            result += ", "
        else
            result += " ";

        comma_flag = true;
        result += `${item.amount} ${H(gameContent.items[item.id].name)}`
    }

    return result
}

/**
 *
 * @param {GameContent} gameContent
 * @param {GameState} gameState
 * @param {HTMLElement} container
 */
export function populate_container_with_crafts(gameState, gameContent, container) {
    container.innerHTML = ""

    for (let craft_id in gameContent.crafts) {
        const reasons = can_craft(gameContent, gameState.player, gameState.inventory, craft_id)
        const can_craft_flag = (reasons.length == 0);

        let craft_data = gameContent.crafts[craft_id];

        let inputs_string = collection_of_items_to_string(gameContent, craft_data.inputs);
        let outputs_string = collection_of_items_to_string(gameContent, craft_data.outputs);

        let craft_line = document.createElement("div");
        craft_line.innerHTML = `Сделать ${outputs_string} из ${inputs_string}.`;

        if (can_craft_flag) {
            craft_line.onclick = (e) => {
                craft(gameContent, gameState.player, gameState.inventory, craft_id);
                populate_container_with_crafts(gameState, gameContent, container);
            }
        } else {
            craft_line.classList.add("gray_text")
            craft_line.innerHTML += reasons.join(', ')
        }

        container.appendChild(craft_line)
    }
}