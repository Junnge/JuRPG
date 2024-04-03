export function craft(gameContent, crafter, inventory, craft_data) {
    let reasons = []

    // checking inputs:

    for (input of craft_data.inputs) {
        if (inventory.has(input.id) < input.amount) {
            reasons.push("Недостаточно " + gameContent.items[input.id].name)
        }
    }

    if (reasons.length > 0) return reasons;

    // everything is OK, apply the recipe

    for (input of craft_data.inputs) {
        inventory.remove(input.id, input.amount)
    }
    for (output of craft_data.output) {
        inventory.add(output.id, output.amount)
    }

    return reasons;
}