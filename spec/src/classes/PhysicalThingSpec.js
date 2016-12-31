const PhysicalThing = require("../../../src/classes/PhysicalThing");

class MockLocation {
  constructor() {
    this.contents = [];
    this.exits = {};
  }
}

describe("PhysicalThing", () => {
  describe("constructor", () => {
    it("requres a location", () => {
      expect(() => new PhysicalThing()).toThrow();
      expect(() => new PhysicalThing({})).toThrow();
    })
    it("creates a UUID", () => {
      const t1 = new PhysicalThing(new MockLocation()), t2 = new PhysicalThing(new MockLocation());
      expect(t1.id).toBeTruthy();
      expect(t2.id).toBeTruthy();
      expect(t1.id).not.toEqual(t2.id);
    })
    it("puts the object in the initial location", () => {
      const loc = new MockLocation();
      const t = new PhysicalThing(loc);
      expect(loc.contents).toEqual([t]);
      expect(t.location).toEqual(loc);
    })
  })
  describe("setLocation", () => {
    let t, t2, loc, loc2;
    beforeEach(() => {
      loc = new MockLocation();
      loc2 = new MockLocation();
      t = new PhysicalThing(loc);
    })
    it("requires a location", () => {
      expect(() => t.setLocation()).toThrow();
      expect(() => t.setLocation({})).toThrow();
    })
    it("moves the object", () => {
      expect(loc2.contents).not.toContain(t);
      t.setLocation(loc2);
      expect(t.location).toEqual(loc2);
      expect(loc2.contents).toContain(t);
      expect(loc.contents).not.toContain(t);
    })
    it("makes the location contents emit an event", () => {
      const spies = {
        spy1: jasmine.createSpy(),
        spy2: jasmine.createSpy(),
        spy3: jasmine.createSpy()
      }
      const t2 = new PhysicalThing(loc);
      const t3 = new PhysicalThing(loc2);
      t.on("locationContentsUpdated", spies.spy1);
      t2.on("locationContentsUpdated", spies.spy2);
      t3.on("locationContentsUpdated", spies.spy3);
      t.setLocation(loc2);
      expect(spies.spy1).toHaveBeenCalled();
      expect(spies.spy2).toHaveBeenCalled();
      expect(spies.spy3).toHaveBeenCalled();
    })
  })
})