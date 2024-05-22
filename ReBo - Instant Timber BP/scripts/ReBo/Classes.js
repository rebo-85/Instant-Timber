import { TicksPerSecond, system } from "@minecraft/server";
import {} from "./Server";
import { runInterval } from "./Utils";

export class RunInterval {
  /**
   * Creates an instance of RunInterval.
   * @param {Function} func - The function to be executed at each interval.
   * @param {number} interval - The interval in ticks between executions.
   */
  constructor(func, interval) {
    this.process = system.runInterval(func, interval);
  }

  /**
   * Disposes of the interval process.
   */
  dispose() {
    system.clearRun(this.process);
  }
}

export class RunTimeOut {
  /**
   * Creates an instance of RunTimeOut.
   * @param {Function} func - The function to be executed after the timeout.
   * @param {number} timeOut - The time in ticks to wait before execution.
   */
  constructor(func, timeOut) {
    this.process = system.runTimeout(func, timeOut);
  }

  /**
   * Disposes of the timeout process.
   */
  dispose() {
    system.clearRun(this.process);
  }
}

export class Vector2 {
  /**
   * Creates an instance of Vector2.
   * @param {number} [x=0] - The x-coordinate.
   * @param {number} [y=0] - The y-coordinate.
   */
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  /**
   * Returns a string representation of the vector.
   * @returns {string} A string in the format "x y".
   */
  toString() {
    return `${this.x} ${this.y}`;
  }

  /**
   * Returns a new Vector2 instance with the y-coordinate opposite.
   * The y-coordinate is considered an angle in the range -180 to 180 degrees.
   * @returns {Vector2} A new Vector2 instance with the opposite y-coordinate.
   * @throws {Error} If the y-coordinate is not in the range -180 to 180 degrees.
   */
  toOppositeY() {
    if (this.y < -180 || this.y > 180) {
      console.log("Angle must be in the range -180 to 180 degrees.");
    }

    // Calculate the opposite angle within the range -180 to 180 degrees
    let y = (this.y + 180) % 360;
    if (y > 180) y -= 360;

    return new Vector2(this.x, y);
  }
}

export class Vector3 {
  /**
   * Creates an instance of Vector3.
   * @param {number} [x=0] - The x-coordinate.
   * @param {number} [y=0] - The y-coordinate.
   * @param {number} [z=0] - The z-coordinate.
   */
  constructor(x = 0, y = 0, z = 0) {
    this.x = this.#validateNumber(x);
    this.y = this.#validateNumber(y);
    this.z = this.#validateNumber(z);
  }

  /**
   * Converts this vector to a Vector2 instance.
   * @returns {Vector2} A new Vector2 instance with the same x and y coordinates.
   */
  toVector2() {
    return new Vector2(this.x, this.y);
  }

  /**
   * Returns a string representation of the vector.
   * @returns {string} A string in the format "x y z".
   */
  toString() {
    return `${this.x} ${this.y} ${this.z}`;
  }

  /**
   * Returns a new Vector3 instance with x and z coordinates rounded to the nearest half.
   * @returns {Vector3} A new Vector3 instance with centered x and z coordinates.
   */
  toCenterXZ() {
    const x = this.#roundToNearestHalf(this.x);
    const y = this.y;
    const z = this.#roundToNearestHalf(this.z);
    return new Vector3(x, y, z);
  }

  /**
   * Returns a new Vector3 instance with x, y, and z coordinates rounded to the nearest half.
   * @returns {Vector3} A new Vector3 instance with centered x, y, and z coordinates.
   */
  toCenterXYZ() {
    const x = this.#roundToNearestHalf(this.x);
    const y = this.#roundToNearestHalf(this.y);
    const z = this.#roundToNearestHalf(this.z);
    return new Vector3(x, y, z);
  }

  /**
   * Rounds a value to the nearest half.
   * @private
   * @param {number} value - The value to round.
   * @returns {number} The value rounded to the nearest half.
   */
  #roundToNearestHalf(value) {
    return Math.round(value * 2) / 2;
  }

  /**
   * Validates if a value is a number.
   * @private
   * @param {number} value - The value to validate.
   * @returns {number} The validated number.
   * @throws {TypeError} If the value is not a number.
   */
  #validateNumber(value) {
    if (typeof value !== "number") {
      throw new TypeError("Value must be a number");
    }
    return value;
  }
}

export class Checkpoint {
  /**
   * Creates an instance of Checkpoint.
   * @param {Entity} entity - The entity to create a checkpoint for.
   */
  constructor(entity) {
    this.entity = entity;
    this.save();
  }

  /**
   * Saves the current location and rotation of the entity.
   */
  save() {
    this.location = this.entity.getLocation();
    this.rotation = this.entity.fetchRotation();
  }

  /**
   * Returns the entity to the saved location and rotation.
   */
  return() {
    this.entity.teleport(this.location, { rotation: this.rotation });
  }
}

export class Music {
  /**
   * Creates an instance of Music.
   * @param {string} track - Identifier of the sound/music defined in the 'sound_definitions.json'.
   * @param {string} tag - tag of players to play the music.
   * @param {number} duration - Duration of the sound/music in seconds.
   * @param {Vector3} [origin=new Vector3()] - Origin coordinates of the selector.
   * @param {number} [volume=1] - Volume of the sound/music.
   * @param {number} [pitch=1] - Pitch of the sound/music.
   */
  constructor(track, tag, duration, origin = new Vector3(), volume = 1, pitch = 1) {
    this.track = track;
    this.tag = tag;
    this.duration = duration;
    this.durationTick = duration * TicksPerSecond;
    this.origin = origin;
    this.volume = volume;
    this.pitch = pitch;
  }
}

export class TimedCommand {
  /**
   * Creates an instance of TimedCommand.
   * @param {number} time - Time in seconds when to execute commands.
   * @param {string|string[]} command - Commands to run at the specified time.
   */
  constructor(time, command) {
    this.time = time;
    this.timeTick = time * TicksPerSecond;
    this.command = command;
  }
}

export class CountDownTimer {
  constructor(durationInSeconds = 10, onEnd = () => {}, onUpdate = () => {}) {
    this.timer = durationInSeconds;
    this.process = runInterval(() => {
      this.minutes = Math.floor(this.timer / 60);
      this.seconds = this.timer % 60;

      // Add leading zero to seconds if less than 10
      this.seconds = this.seconds < 10 ? "0" + this.seconds : this.seconds;

      // Display
      onUpdate(this.minutes, this.seconds);

      // Check if the timer has reached 0
      if (--this.timer < -1) {
        onEnd();
        this.process.dispose();
        return;
      }
    }, 20);
  }
  dispose() {
    this.process.dispose();
  }
}
