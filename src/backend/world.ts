import { Trie } from "../shared/util/trie";
import { ClientId, Client, ClientMap } from "./world/client";
import { ExitId, Exit } from "./world/exit";
import { Player, PlayerId, PlayerMap } from "./world/player";
import { Race, RaceId, RaceMap } from "./world/race";
import { RoomId, Room } from "./world/room";
import { ThingMap } from "./world/thing";

const timings = {
  ticksPerSecond: 10,
  playerTicks: 1,
}
const MAX_IDLE_TIME = 600; // Clear player after this amount of time

export class World {
  players = new PlayerMap();
  rooms = new Map<RoomId, Room>();
  exits = new Map<ExitId, Exit>();
  clients = new ClientMap();
  commands = new Trie();
  races = new RaceMap();

  constructor() {
    this.addCommands();
    this.addRaces();
  }

  addCommands() {
    this.commands.insert("quit");
    this.commands.insert("help");
  }

  addRaces() {
    this.races.set(1, {
      id: 1,
      name: "Human",
      description: "Stuff",
      playable: true,
    });
  }

  start() {
    const tickInterval = Math.floor(1000 / timings.ticksPerSecond);
    setInterval(() => {
      this.tick();
    }, tickInterval);
  }

  tick() {
    for (let player of this.players.values()) {
      if (++player.idle >= MAX_IDLE_TIME) {
        player.disconnect();
      }
    }
  }
}

export const WORLD = new World();
