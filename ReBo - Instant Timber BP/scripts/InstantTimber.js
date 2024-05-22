import { beforeEvents } from "./ReBo/Constants";
import { test } from "./ReBo/Utils";

beforeEvents.playerBreakBlock.subscribe((event) => {
  const isAxe = event.itemStack?.type.id.match(/.+_axe/);
  if (!isAxe) return;

  if (event.player.isSneaking) instantTimber(event.block.location, event.player.dimension);
});

async function instantTimber(location, dimension) {
  const logBlocks = [
    "minecraft:log",
    "minecraft:log2",
    "minecraft:mangrove_log",
    "minecraft:cherry_log",
    "minecraft:warped_stem",
    "minecraft:crimson_stem",
  ];

  const visitedLocations = new Set();

  const stack = [location];

  while (stack.length > 0) {
    const currentLocation = stack.pop();

    if (!visitedLocations.has(JSON.stringify(currentLocation))) {
      visitedLocations.add(JSON.stringify(currentLocation));
      const currentBlock = dimension.getBlock(currentLocation);

      if (currentBlock && logBlocks.some((logBlock) => currentBlock.permutation.matches(logBlock))) {
        await dimension.commandRunAsync(
          `setblock ${currentLocation.x} ${currentLocation.y} ${currentLocation.z} minecraft:air destroy`
        );

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
            z: currentLocation.z + adjBlock.z,
          };
          stack.push(newLocation);
        }
      }
    }
  }
}
