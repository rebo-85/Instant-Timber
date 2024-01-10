import { world } from "@minecraft/server"

export function runCommand(command){
    world.getDimension("overworld").runCommand(`${command}`);

}export function runCommandPromise(command, callback){
    if (world.getDimension("overworld").runCommand(`${command}`).successCount) {
        callback();
    }
}
export function runCommands(...commands){
    commands.forEach(command => {
        runCommand(`${command}`);
    });
}

export function runCommandAsync(command){
    world.getDimension("overworld").runCommandAsync(`${command}`);
}export function runCommandAsyncPromise(command, callback){
    world
      .getDimension("overworld")
      .runCommandAsync(`${command}`)
      .then((data) => {
        if (data.successCount) {
          callback();
        }
      });
}
export function runCommandsAsync(...commands){
    commands.forEach(command => {
        runCommandAsync(`${command}`);
    });
}


export function getBlock(location){
    return world.getDimension("overworld").getBlock({ x: location.x, y: location.y, z: location.z });
}
