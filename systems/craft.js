import { H } from "../engine/common.js";

/**
 *
 * @param {GameContent} gameContent
 * @param {Character} crafter
 * @param {import('../classes/inventory').Inventory} inventory
 * @param {CraftID} craft_id
 * @returns {string[]}
 */
export function can_craft(gameContent, crafter, inventory, craft_id) {
    let reasons = []

    // checking inputs:
    let craft_data = gameContent.crafts[craft_id]

    if (craft_data == undefined) {
        alert("Invalid craft id: " + craft_id)
        return reasons;
    }

    for (let input of craft_data.inputs) {
        if (inventory.has(input.id) < input.amount) {
            reasons.push("Недостаточно " + H(gameContent.items[input.id].name))
        }
    }

    return reasons
}

/**
 *
 * @param {GameContent} gameContent
 * @param {Character} crafter
 * @param {import('../classes/inventory').Inventory} inventory
 * @param {CraftID} craft_id
 * @returns {string[]}
 */
export function craft(gameContent, crafter, inventory, craft_id) {
    let reasons = can_craft(gameContent, crafter, inventory, craft_id);
    if (reasons.length > 0) return reasons;

    let craft_data = gameContent.crafts[craft_id];

    // everything is OK, apply the recipe

    for (let input of craft_data.inputs) {
        inventory.remove(input.id, input.amount);
    }
    for (let output of craft_data.outputs) {
        inventory.add(output.id, output.amount);
    }

    return reasons;
}