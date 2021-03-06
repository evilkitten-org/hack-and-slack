import { Player } from "./entities/player";
import Queue from "bull";
import { World } from "../world";

export enum ClientState {
  ACTIVE,
  IDLE,
  AFK,
}

export class ClientBuffer {
  buffer: string[] = [];

  add(input: string | string[]): number {
    if (Array.isArray(input)) {
      this.buffer.push(...input);
    } else {
      this.buffer.push(input);
    }
    return this.buffer.length;
  }

  clear() {
    this.buffer.length = 0;
  }

  get() {
    return this.buffer.shift();
  }
}

export abstract class Client {
  clientId = "";
  state = ClientState.ACTIVE;
  player?: Player;
  input = new ClientBuffer();
  output = new ClientBuffer();
  lastInput = Date.now();
  snoopyBy?: Client;
  world: World;

  constructor(clientId: string, world: World) {
    this.clientId = clientId;
    this.world = world;
  }

  abstract send(buffer: string | string[] | ClientBuffer): void;

  disconnect() {
    if (this.player) {
      this.player.client = undefined;
      this.player = undefined;
    }
    this.world.clients.delete(this.clientId);
  }
}

export class DiscordClient extends Client {
  queue: Queue.Queue;

  constructor(clientId: string, world: World, queue: Queue.Queue) {
    super(clientId, world);
    this.queue = queue;
  }

  send(buffer: string | string[] | ClientBuffer) {
    let output = [];
    if (buffer instanceof ClientBuffer) {
      output.push(...buffer.buffer);
      buffer.clear();
    } else if (Array.isArray(buffer)) {
      output.push(...buffer);
    } else {
      if (buffer === "") {
        return;
      }
      output.push(buffer);
    }

    if (output.length === 0) {
      return;
    }

    this.queue.add({
      type: "response",
      to: this.clientId,
      text: output.join("\n"),
    });
  }
}

export class ClientMap extends Map<string, Client> {}
