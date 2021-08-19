import { Character } from "./character";
import { DamageType } from "./data-types/damage-types";
import { Dice } from "./data-types/dice";
import { nextId } from "./data-types/id";
import { Room } from "./room";

export abstract class ItemPrototype {
  name = "";
  shortDescription = "";
  description = "";

  weight = 0;

  abstract newInstance(): Item;
}

export class WeaponItemPrototype extends ItemPrototype {
  damageType = DamageType.Slashing;
  damage = new Dice();

  newInstance(): WeaponItem {
    return new WeaponItem(this);
  }
}

export class Item {
  id = 0;
  prototype: ItemPrototype;
  name = "";
  shortDescription = "";
  description = "";

  weight = 0;

  room?: Room;
  holder?: Character;

  moveFrom() {
    if (this.room) {
      this.room.items.delete(this);
      this.room = undefined;
    }
    if (this.holder) {
      this.holder.items.delete(this);
      this.holder = undefined;
    }
  }

  moveTo(place: Room | Character) {
    if (place instanceof Room) {
      place.addItem(this);
      this.room = place;
    } else if (place instanceof Character) {
      place.addItem(this);
      this.holder = place;
    }
  }

  constructor(prototype: ItemPrototype) {
    this.id = nextId(Item);
    this.prototype = prototype;

    this.name = prototype.name;
    this.shortDescription = prototype.shortDescription;
    this.description = prototype.description;

    this.weight = prototype.weight;
  }

  isVisibleTo(looker: Character) {
    return true;
  }
}

export class WeaponItem extends Item {
  damageType = DamageType.Slashing;
  damage = new Dice();

  constructor(prototype: WeaponItemPrototype) {
    super(prototype);

    this.damageType = prototype.damageType;
    this.damage = Dice.from(this.damage);
  }
}
