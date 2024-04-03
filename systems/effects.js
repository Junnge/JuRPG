import { gameContent } from "../engine/database.js";
import { action_log } from "../ui/status-update.js";

export function spend_ammo(player, inventory) {
    if (inventory == undefined) {
        return true
    }

    var ammo_id = player.slots.weapon.id + "_ammo";
    var the_weapon_uses_ammo = gameContent.items[ammo_id] != undefined;
    if (the_weapon_uses_ammo) {
        try {
            inventory.remove(ammo_id, 1)
            return true;
        } catch (error) {
            if (error == "Not enough items") {
                action_log("У вас закончились патроны.")
                return false;
            }
        }
    }
    return true;
}