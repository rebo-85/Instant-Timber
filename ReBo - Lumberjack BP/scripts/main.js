import { world } from "@minecraft/server";
import * as utils from "utils.js";

world.beforeEvents.playerBreakBlock.subscribe((event) => {
    const isAxe = !!event.itemStack?.type.id.match(/.+_axe/);
    const isSneaking = event.player.isSneaking;
    if (isAxe && isSneaking) {
      instantWoodCut(event.block.location);
    }
});

async function instantWoodCut(location) {
    const logBlocks = [
        "minecraft:log",
        "minecraft:log2",
        "minecraft:mangrove_log",
        "minecraft:cherry_log",
        "minecraft:warped_stem",
        "minecraft:crimson_stem",
    ];

    const visitedLocations = new Set(); // To keep track of visited locations

    const stack = [location]; // Initialize stack with the initial block location

    while (stack.length > 0) {
        const currentLocation = stack.pop();

        if (!visitedLocations.has(JSON.stringify(currentLocation))) {
            visitedLocations.add(JSON.stringify(currentLocation)); // Mark current location as visited
            const currentBlock = utils.getBlock(currentLocation);

            if (currentBlock && logBlocks.some(logBlock => currentBlock.permutation.matches(logBlock))) {
                await utils.runCommandsAsync(`setblock ${currentLocation.x} ${currentLocation.y} ${currentLocation.z} minecraft:air destroy`);

                // Define adjacent blocks in all directions
                const adjacentBlocks = [
                    { x: 1, y: 0, z: 0 }, // Right
                    { x: 0, y: 0, z: 1 }, // Down
                    { x: -1, y: 0, z: 0 }, // Left
                    { x: 0, y: 0, z: -1 }, // Up
                    { x: 0, y: 1, z: 0 }, // Above
                ];

                for (const adjBlock of adjacentBlocks) {
                    const newLocation = {
                        x: currentLocation.x + adjBlock.x,
                        y: currentLocation.y + adjBlock.y,
                        z: currentLocation.z + adjBlock.z
                    };
                    stack.push(newLocation); // Add adjacent blocks to the stack for processing
                }
            }
        }
    }
}
