import { EntityInventoryComponent, EntityEquippableComponent, Dimension, Entity } from "@minecraft/server";
import { Vector3, Checkpoint, Vector2 } from "./Classes";

/**
 * Teleports the entity to a specified location with an optional rotation.
 * @param {(Vector3|string)} loc - The location to teleport to, either as a Vector3 or a string.
 * @param {(Vector2|string)} [rot] - The rotation after teleporting, either as a Vector2 or a string.
 */
Entity.prototype.tp = function (loc, rot) {
  if (typeof loc === "string") loc = loc.toVector3();

  if (!rot) rot = this.fetchRotation();
  else if (typeof rot === "string") rot = rot.toVector2();
  this.teleport(loc, { rotation: rot });
};

/**
 * Fetches the current rotation of the entity.
 * @returns {Vector2} The current rotation of the entity.
 */
Entity.prototype.fetchRotation = function () {
  return new Vector2(this.getRotation().x, this.getRotation().y);
};

/**
 * Gets the current location of the entity.
 * @returns {Vector3} The current location of the entity.
 */
Entity.prototype.getLocation = function () {
  return new Vector3(this.location.x, this.location.y, this.location.z);
};

/**
 * Gets the current checkpoint of the entity.
 * @returns {Checkpoint} The current checkpoint of the entity.
 */
Entity.prototype.getCheckpoint = function () {
  return new Checkpoint(this);
};

/**
 * Gets the inventory of the entity.
 * @returns {EntityInventoryComponent} The inventory of the entity.
 */
Entity.prototype.getInventory = function () {
  return this.getComponent(EntityInventoryComponent.componentId).container;
};

/**
 * Gets the equipment in the specified slot of the entity.
 * @param {number} slot - The slot to get the equipment from.
 * @returns {ItemStack} The equipment in the specified slot.
 */
Entity.prototype.getEquipment = function (slot) {
  return this.getComponent(EntityEquippableComponent.componentId).getEquipment(slot);
};

/**
 * Runs a series of commands on the entity.
 * @param {...string[]} commands - The commands to run.
 */
Entity.prototype.commandRun = function (...commands) {
  let successCount = 0;

  const flattenedCommands = commands.flat();

  flattenedCommands.forEach((command) => {
    this.runCommand(`${command}`);
    if (this.runCommand(`${command}`).successCount > 0) {
      successCount++;
    }
  });
  this.successCount = successCount;
};

/**
 * Runs a series of commands asynchronously on the entity.
 * @param {...string[]} commands - The commands to run.
 * @returns {Promise<void>}
 */
Entity.prototype.commandRunAsync = async function (...commands) {
  let successCount = 0;
  const flattenedCommands = commands.flat();

  const commandPromises = flattenedCommands.map(async (command) => {
    const result = await this.runCommandAsync(command);
    if (result.successCount > 0) {
      successCount++;
    }
  });

  await Promise.all(commandPromises);

  this.successCount = successCount;
};

/**
 * Fetches entities in the dimension based on a filter.
 * @param {(string|Object)} filter - The filter to use for fetching entities.
 * @returns {Entity[]} The fetched entities.
 */
Dimension.prototype.fetchEntities = function (filter) {
  if (typeof filter === "string") {
    const matches = filter.getSelectorMatches();
    if (matches) {
      return this.getEntities(filter.toEQO());
    }
    return [];
  }
  return this.getEntities(filter);
};

/**
 * Runs a series of commands in the dimension.
 * @param {...string[]} commands - The commands to run.
 * @returns {{ successCount: number }} The result of running the commands.
 */
Dimension.prototype.commandRun = function (...commands) {
  let successCount = 0;

  const flattenedCommands = commands.flat();

  flattenedCommands.forEach((command) => {
    if (this.runCommand(`${command}`).successCount > 0) {
      successCount++;
    }
  });
  return { successCount: successCount };
};

/**
 * Runs a series of commands asynchronously in the dimension.
 * @param {...string[]} commands - The commands to run.
 * @returns {Promise<{ successCount: number }>} The result of running the commands.
 */
Dimension.prototype.commandRunAsync = async function (...commands) {
  let successCount = 0;
  const flattenedCommands = commands.flat();

  const commandPromises = flattenedCommands.map(async (command) => {
    const result = await this.runCommandAsync(command);
    if (result.successCount > 0) {
      successCount++;
    }
  });

  await Promise.all(commandPromises);

  return { successCount: successCount };
};

/**
 * Converts a string to a Vector2.
 * @returns {Vector2} The Vector2 representation of the string.
 */
String.prototype.toVector2 = function () {
  const pattern = this.match(/^(\d+)\s(\d+)$/);
  if (pattern) {
    const x = parseInt(pattern[1]);
    const y = parseInt(pattern[2]);
    return new Vector2(x, y);
  }

  switch (this.toLowerCase()) {
    case "north":
      return new Vector2(0, 180);
    case "east":
      return new Vector2(0, -90);
    case "south":
      return new Vector2(0, 0);
    case "west":
      return new Vector2(0, 90);
    default:
      return this;
  }
};

/**
 * Gets selector matches from the string.
 * @returns {Array<string>|undefined} The matches if valid, otherwise an error is logged.
 */
String.prototype.getSelectorMatches = function () {
  const regex = /^@(a|p|r|e|s|initiator)(?:\[(.+)\])?$/;
  const matches = this.match(regex);
  if (matches) {
    return matches;
  } else {
    return console.error(`"${this}" is not a valid selector.`);
  }
};

/**
 * Converts a string to EntityQueryOptions.
 * @returns {Object} The EntityQueryOptions representation of the string.
 */
String.prototype.toEQO = function () {
  const options = {};
  const matches = this.getSelectorMatches();
  if (matches && matches.length >= 2) {
    const attributes = matches[2] ? matches[2].split(",") : [];
    let excludeFamilies = [];
    let excludeGameModes = [];
    let excludeTags = [];
    let excludeTypes = [];
    let families = [];
    let tags = [];
    options.location = { x: 0, y: 0, z: 0 }; // Initialize location object with default values

    attributes.forEach((attribute) => {
      const [key, value] = attribute.split("=");
      const trimmedKey = key.trim();
      const trimmedValue = value.trim();

      switch (trimmedKey) {
        case "c":
          options.closest = parseInt(trimmedValue, 10);

          // If @p, @s, @r, or @initiator is present, override closest to 1
          if (matches[1] === "p" || matches[1] === "r" || matches[1] === "s" || matches[1] === "initiator") {
            options.closest = 1;
          }
          break;
        case "family":
          if (trimmedValue.includes("!")) {
            excludeFamilies.push(trimmedValue.replace(/!/g, ""));
            options.excludeFamilies = excludeFamilies;
          } else {
            families.push(trimmedValue);
            options.families = families;
          }
          break;
        case "l":
          options.maxLevel = parseInt(trimmedValue, 10);
          break;
        case "lm":
          options.minLevel = parseInt(trimmedValue, 10);
          break;
        case "m":
          if (trimmedValue.includes("!")) {
            if (!isNaN(trimmedValue.replace(/!/g, ""))) {
              excludeGameModes.push(parseInt(trimmedValue.replace(/!/g, ""), 10));
              options.excludeGameModes = excludeGameModes;
            } else {
              excludeGameModes.push(trimmedValue);
              options.excludeGameModes = excludeGameModes;
            }
          } else {
            if (!isNaN(trimmedValue)) {
              options.gameMode = parseInt(trimmedValue, 10);
            } else {
              options.gameMode = trimmedValue;
            }
          }
          break;
        case "name":
          options.name = trimmedValue;
          break;
        case "r":
          options.maxDistance = parseInt(trimmedValue, 10);
          break;
        case "rm":
          options.minDistance = parseInt(trimmedValue, 10);
          break;
        case "rx":
          options.location.x = parseInt(trimmedValue, 10);
          break;
        case "rxm":
          options.minHorizontalRotation = parseInt(trimmedValue, 10);
          break;
        case "ry":
          options.location.y = parseInt(trimmedValue, 10);
          break;
        case "rym":
          options.minVerticalRotation = parseInt(trimmedValue, 10);
          break;
        case "tag":
          if (trimmedValue.includes("!")) {
            excludeTags.push(trimmedValue.replace(/!/g, ""));
            options.excludeTags = excludeTags;
          } else {
            tags.push(trimmedValue);
            options.tags = tags;
          }
          break;
        case "type":
          if (trimmedValue.includes("!")) {
            excludeTypes.push(trimmedValue.replace(/!/g, ""));
            options.excludeTypes = excludeTypes;
          } else {
            options.type = trimmedValue;
          }
          // If @a, @p, @s, @r, or @initiator is present, override type to 'minecraft:player'
          if (matches[1] === "a" || matches[1] === "p" || matches[1] === "r" || matches[1] === "s" || matches[1] === "initiator") {
            options.type = "minecraft:player";
          }
          break;
        case "x":
          options.location.x = parseInt(trimmedValue, 10);
          break;
        case "y":
          options.location.y = parseInt(trimmedValue, 10);
          break;
        case "z":
          options.location.z = parseInt(trimmedValue, 10);
          break;
        default:
          // Handle unknown keys
          console.warn(`'${trimmedKey}' cannot be converted to EntityQueryOptions property.`);
          break;
      }
    });

    if (matches[1] === "a" || matches[1] === "p" || matches[1] === "r" || matches[1] === "s" || matches[1] === "initiator") {
      options.type = "minecraft:player";

      if (!(matches[1] === "a")) {
        options.closest = 1;
      }
    }

    return options;
  }
};

/**
 * Converts a string to a Vector3.
 * @returns {Vector3|null} The Vector3 representation of the string or null if the format is invalid.
 */
String.prototype.toVector3 = function () {
  const coordinates = this.split(" ").map(parseFloat);
  if (coordinates.some(isNaN) || coordinates.length !== 3) {
    console.error('Invalid string format. It should be "x y z"');
    return null; // Returning null to indicate failure
  }
  return new Vector3(coordinates[0], coordinates[1], coordinates[2]);
};
