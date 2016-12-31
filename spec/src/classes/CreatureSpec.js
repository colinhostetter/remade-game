const Creature = require("../../../src/classes/Creature");
const modifiers = require("../../../src/classes/modifiers");

const mockLocation = {
  contents: [],
  exits: {}
}

describe("Creature", () => {
  describe("constructor", () => {
    it("creates certain important properties", () => {
      const c = new Creature(mockLocation);
      expect(c.abilities).toEqual([]);
      expect(c.modifiers).toEqual([]);
      expect(c.alive).toEqual(true);
      expect(c.location).toEqual(mockLocation);
    })
    it("assigns the specified properties after setting defaults", () => {
      const c = new Creature(mockLocation, {alive: false, asdf: 123});
      expect(c.asdf).toEqual(123);
      expect(c.alive).toEqual(false);
    })
    it("starts the think loop", done => {
      let thinks = 0;
      const think = () => {
        thinks++;
        if (thinks > 1) done();
      };
      const c = new Creature(mockLocation, {thinkInterval: 1, think});
    })
  })
  describe("serialize", () => {
    it("can be stringified", () => {
      const c = new Creature(mockLocation);
      expect(() => JSON.stringify(c.serialize())).not.toThrow();
    })
  })
  describe("damage", () => {
    let c;
    beforeEach(() => {
      c = new Creature(mockLocation, {maxHealth: 100, currentHealth: 100});
    })
    it("removes HP", () => {
      c.damage({amount: 20});
      expect(c.currentHealth).toEqual(80);
    })
    it("emits locationContentsUpdated and damage events", () => {
      const c2 = new Creature(mockLocation);
      const spy1 = jasmine.createSpy(), spy2 = jasmine.createSpy();
      c.on("damage", spy1);
      c2.on("locationContentsUpdated", spy2);
      c.damage({amount: 20});
      expect(spy1).toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();
    })
    it("kills the target if HP < 0", () => {
      spyOn(c, "die");
      c.damage({amount: 1000});
      expect(c.currentHealth).toEqual(0);
      expect(c.die).toHaveBeenCalled();
    })
    it("kills the target if HP === 0", () => {
      spyOn(c, "die");
      c.damage({amount: 100});
      expect(c.currentHealth).toEqual(0);
      expect(c.die).toHaveBeenCalled();
    })
  })
  describe("die", () => {
    let c;
    beforeEach(() => {
      c = new Creature(mockLocation);
    })
    it("sets this.alive to false, currentHealth to 0, and removes all modifiers", () => {
      c.die();
      expect(c.alive).toEqual(false);
      expect(c.currentHealth).toEqual(0);
      expect(c.modifiers).toEqual([]);
    })
    it("emits events", () => {
      const killer = new Creature(mockLocation);
      const killLineSpy = jasmine.createSpy(), deathLineSpy = jasmine.createSpy(), deathEventSpy = jasmine.createSpy();
      killer.on("line", killLineSpy);
      c.on("line", deathLineSpy);
      c.on("death", deathEventSpy);
      c.die(killer);
      expect(killLineSpy).toHaveBeenCalled();
      expect(deathLineSpy).toHaveBeenCalledWith(jasmine.objectContaining({type: "death"}));
      expect(deathEventSpy).toHaveBeenCalled();
    })
  })
  describe("project", () => {
    it("emits a line on each thing in the room except this one", () => {
      const c1 = new Creature(mockLocation), c2 = new Creature(mockLocation), c3 = new Creature(mockLocation);
      const spy1 = jasmine.createSpy(), spy2 = jasmine.createSpy(), spy3 = jasmine.createSpy();
      c1.on("line", spy1);
      c2.on("line", spy2);
      c3.on("line", spy3);
      c1.project("Hello!");
      expect(spy1).not.toHaveBeenCalled();
      expect(spy2).toHaveBeenCalledWith("Hello!");
      expect(spy3).toHaveBeenCalledWith("Hello!");
    })
  })
  describe("addModifier", () => {
    let c, attacker
    beforeEach(() => {
      c = new Creature(mockLocation);
      attacker = new Creature(mockLocation);
    })
    it("throws an error for an invalid modifier", () => {
      expect(() => c.addModifier("asdkfldasljkfdsaklfdsa")).toThrow();
    })
    it("shallow clones the modifier with the given name", () => {
      c.addModifier("paralysis");
      const aff = c.modifiers.find(i => i.name === "paralysis");
      expect(aff).toEqual(jasmine.objectContaining(modifiers.paralysis));
      expect(aff).not.toBe(modifiers.paralysis);
    })
    it("adds a GUID", () => {
      c.addModifier("paralysis");
      c.addModifier("ablaze");
      expect(c.modifiers[0].id).toBeTruthy();
      expect(c.modifiers[1].id).toBeTruthy();
      expect(c.modifiers[0].id).not.toEqual(c.modifiers[1].id);
    })
    it("sets the source and victim", () => {
      const c2 = new Creature(mockLocation);
      c.addModifier("paralysis", c2);
      expect(c.modifiers[0].target).toEqual(c);
      expect(c.modifiers[0].source).toEqual(c2);
    })
    it("expires if the modifier has a duration", done => {
      spyOn(c, "removeModifier").and.callThrough();
      const eventSpy = jasmine.createSpy();
      c.on("line", eventSpy);
      c.addModifier("paralysis", attacker, {duration: 10, expireLine: "asdf"});
      const aff = c.modifiers[0];
      setTimeout(() => {
        expect(c.modifiers.length).toEqual(0);
        expect(c.removeModifier).toHaveBeenCalledWith(aff);
        expect(eventSpy).toHaveBeenCalledWith("asdf");
        done();
      }, 10)
    })
    it("replaces the existing modifier if re-addModifiering", () => {
      c.addModifier("paralysis");
      const a1 = c.modifiers[0];
      c.addModifier("paralysis");
      const a2 = c.modifiers[0];
      expect(c.modifiers.length).toEqual(1);
      expect(a1).not.toBe(a2);
      expect(a1.name).toEqual(a2.name);
      expect(a1.id).not.toEqual(a2.id);
    })
    it("resets the duration when re-addModifiering", done => {
      spyOn(c, "removeModifier").and.callThrough();
      c.addModifier("paralysis", attacker, {duration: 100});
      const a1 = c.modifiers[0];
      setTimeout(() => {
        c.addModifier("paralysis", attacker, {duration: 100});
        const a2 = c.modifiers[0];
        setTimeout(() => {
          expect(c.removeModifier).not.toHaveBeenCalledWith(a1);
          expect(c.removeModifier).toHaveBeenCalledWith(a2);
          done();
        }, 150)
      }, 50)
    })
    it("emits a modifierAdded event", () => {
      const s = jasmine.createSpy();
      c.on("modifierAdded", s);
      c.addModifier("paralysis", attacker);
      const aff = c.modifiers[0];
      expect(s).toHaveBeenCalledWith({name: aff.name, id: aff.id, duration: aff.duration});
    })
  })
  describe("removeModifier", () => {
    let c;
    beforeEach(() => {
      c = new Creature(mockLocation);
    })
    it("removes the modifier", () => {
      c.addModifier("paralysis");
      c.addModifier("ablaze");
      c.removeModifier(c.modifiers[0]);
      expect(c.modifiers.length).toEqual(1);
      expect(c.modifiers[0].name).toEqual("ablaze");
    })
    it("stops the tick interval", done => {
      const tickSpy = jasmine.createSpy();
      c.addModifier("ablaze", {duration: 10, tick: 5, onTick: tickSpy})
      c.removeModifier(c.modifiers[0]);
      setTimeout(() => {
        expect(tickSpy).not.toHaveBeenCalled();
        done()
      }, 10)
    })
    it("emits an event", () => {
      const evSpy = jasmine.createSpy();
      c.on("modifierRemoved", evSpy);
      c.addModifier("ablaze");
      const aff = c.modifiers[0];
      c.removeModifier(aff);
      expect(evSpy).toHaveBeenCalledWith(aff);
    })
  })
  describe("purify", () => {
    let c;
    beforeEach(() => {
      c = new Creature(mockLocation, {purifyCooldown: 10});
    })
    it("removeModifiers an modifier with the given name", () => {
      c.addModifier("paralysis");
      c.addModifier("ablaze");
      c.purify("paralysis");
      expect(c.modifiers.length).toEqual(1);
      expect(c.modifiers[0].name).toEqual("ablaze");
    })
    it("consumes purify balance, then restores it after a delay", done => {
      c.addModifier("paralysis");
      c.purify("paralysis");
      expect(c.purifyReady).toEqual(false);
      expect(c._purifyTimeoutId).toBeTruthy();
      setTimeout(() => expect(c.purifyReady).toEqual(false), 5);
      setTimeout(() => {
        expect(c.purifyReady).toEqual(true);
        expect(c._purifyTimeoutId).not.toBeTruthy();
        done()
      }, 10)
    })
    it("doesn't work while this.purifyReady is false", () => {
      c.purifyReady = false;
      c.addModifier("paralysis");
      c.purify("paralysis");
      expect(c.modifiers.length).toEqual(1);
    })
    it("emits events", done => {
      const usedSpy = jasmine.createSpy(), readySpy = jasmine.createSpy();
      c.on("purifyUsed", usedSpy);
      c.on("purifyReady", readySpy);
      c.addModifier("paralysis");
      c.purify("paralysis");
      expect(usedSpy).toHaveBeenCalled();
      expect(readySpy).not.toHaveBeenCalled();
      setTimeout(() => {
        expect(readySpy).toHaveBeenCalled();
        done();
      }, 10)
    })
    it("doesn't consume the purify if used on an aff we don't have", () => {
      c.purify("paralysis");
      expect(c.purifyReady).toEqual(true);
    })
    it("heals if the player chooses to purify health", () => {
      c.maxHealth = 100;
      c.currentHealth = 50;
      c.purifyHealAmount = 25;
      c.purify("health");
      expect(c.currentHealth).toEqual(75);
    })
    it("doesn't go over max health", () => {
      c.maxHealth = 100;
      c.currentHealth = 80;
      c.purifyHealAmount = 25;
      c.purify("health");
      expect(c.currentHealth).toEqual(100);
    })
  })
  describe("counterspell", () => {
    let c;
    beforeEach(() => {
      c = new Creature(mockLocation);
    })
    it("adds the buff if it's ready", () => {
      c.counterspellReady = true;
      c.counterspell();
      expect(c.hasModifier("counterspell")).toEqual(true);
    })
    it("doesn't add the buff if it's not ready", () => {
      c.counterspellReady = false;
      c.counterspell();
      expect(c.hasModifier("counterspell")).toEqual(false);
    })
  })
})