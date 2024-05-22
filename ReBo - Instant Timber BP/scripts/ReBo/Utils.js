import { afterEvents, beforeEvents, world, structureManager, overworld } from "./Constants";
import { Dimension, ScriptEventSource } from "@minecraft/server";
import { RunInterval, RunTimeOut, Vector3 } from "./Classes";
import { scoreboard } from "./Constants";

export function runInterval(func, interval) {
  return new RunInterval(func, interval);
}

export function runTimeout(func, timeOut) {
  return new RunTimeOut(func, timeOut);
}

export function getScoreboard(id) {
  return scoreboard.getObjective(id);
}

export function addScoreboard(id, displayName) {
  const isObjectiveExist = getScoreboard(id);
  if (isObjectiveExist) return;

  if (!displayName) displayName = id;
  return scoreboard.addObjective(id, displayName);
}

export function removeScoreboard(id) {
  return scoreboard.removeObjective(id);
}

export function addScore(id, participant, score) {
  return getScoreboard(id).addScore(participant, score);
}

export function getScore(id, participant) {
  return getScoreboard(id).getScore(participant);
}

export function setScore(id, participant, score) {
  return getScoreboard(id).setScore(participant, score);
}

export function removeParticipant(id, participant) {
  try {
    return getScoreboard(id).removeParticipant(participant);
  } catch (error) {}
}

export function removeAllParticipant(id) {
  const allParticipants = getScoreboard(id)?.getParticipants();
  allParticipants?.forEach((participant) => {
    removeParticipant(id, participant);
  });
}

export function test(value, type = "chat") {
  value = JSON.stringify(value, null, 0);
  switch (type) {
    case "chat":
      world.sendMessage(`${value}`);
      break;
    case "error":
      console.error(value);
      break;
    case "log":
      console.log(value);
      break;
    default:
      world.sendMessage(`${value}`);
      break;
  }
}

export function getScriptEventSource(event) {
  switch (event.sourceType) {
    case ScriptEventSource.Block:
      return event.sourceBlock;
    case ScriptEventSource.Entity:
      return event.sourceEntity;
    case ScriptEventSource.NPCDialogue:
      return event.initiator;
    default:
      return;
  }
}

export function onPlayerLoad(func) {
  afterEvents.playerJoin.subscribe((event) => {
    const sys = runInterval(() => {
      const players = world.getAllPlayers();
      if (players.length > 0) {
        const player = world.getEntity(event.playerId);
        func(player);
        sys.dispose();
      }
    }, 1);
  });
}

export function onWorldOpen(func) {
  onPlayerLoad((player) => {
    const players = world.getAllPlayers();
    if (players.length === 1) {
      func(player);
    }
  });
}

export function onWorldClose(func) {
  beforeEvents.playerLeave.subscribe((event) => {
    const players = world.getAllPlayers();
    if (players.length === 1) {
      func(event.player);
    }
  });
}

/**
 * @remarks
 * Places a structure in the world. Structures placed in
 * unloaded chunks will be queued for loading.
 *
 * This function can't be called in read-only mode.
 *
 * @param { string | Structure } structure - The structure's identifier or a Structure object.
 * @param { Vector3 } location - The location within the dimension where the Structure should
 * @param { Dimension } origin - The dimension where the Structure should be placed.
 * @param { StructurePlaceOptions } options - Additional options for Structure placement.
 * @throws
 * Throws if the integrity value is outside of the range [0,1]
 * Throws if the integrity seed is invalid.
 * Throws if the placement location contains blocks that are
 * outside the world bounds.
 * {@link minecraftcommon.ArgumentOutOfBoundsError}
 *
 * {@link minecraftcommon.InvalidArgumentError}
 *
 * {@link InvalidStructureError}
 */
export function placeStructure(structure, location, dimension = overworld, options = undefined) {
  structureManager.place(structure, dimension, location, options);
}
