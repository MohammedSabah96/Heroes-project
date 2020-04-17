const mongoose = require("mongoose");
const Hero = mongoose.model("Hero");
const Squad = mongoose.model("Squad");

let data = require("../../Default_heroes");
let heroData = data.heroes;
let squadData = data.squads;

function getOverall(hero) {
  let {
    strength: str,
    perception: per,
    endurance: end,
    charisma: cha,
    intelligence: int,
    agility: agi,
    luck: lu,
  } = hero.stats;
  let arr = [str, per, end, cha, int, agi, lu];
  return arr.reduce((acc, val) => acc + val);
}

const getIndex = (req, res, next) => {
  res.render("index", { title: "Mongoose" });
};

const getHeroesIndex = (req, res) => {
  Hero.find({}, "", { lean: true }, (err, heroes) => {
    if (err) {
      return res.send({ error: err });
    }

    for (hero of heroes) {
      hero.overall = getOverall(hero);
    }

    res.render("heroes", { title: "Hall Of Heroes", heroes: heroes });
  });
};
const getHeroesForm = (req, res) => {
  Squad.find((err, squads) => {
    if (err) {
      return res.send({ error: err });
    }
    res.render("create-hero", { title: "Create A Hero", squads: squads });
  });
};
const createNewHero = ({ body }, res) => {
  let hero = {
    name: body.name,
    description: body.desc,
    stats: {
      strength: body.strength,
      perception: body.perception,
      endurance: body.endurance,
      charisma: body.charisma,
      intelligence: body.intelligence,
      agility: body.agility,
      luck: body.luck,
    },
  };

  body.origin && (hero.origin = body.origin);
  body.squad && (hero.squad = body.squad);

  Hero.create(hero, (err, newHero) => {
    if (err) {
      return res.send({ error: err });
    }
    res.redirect("/heroes");
  });
};

const deleteHero = ({ params }, res) => {
  Hero.findByIdAndRemove(params.heroid, (err, hero) => {
    if (err) {
      return res.send({ error: err });
    }
    res.redirect("/heroes");
  });
};

const getUpdateForm = ({ params }, res) => {
  Hero.findById(params.heroid, (err, hero) => {
    if (err) {
      return res.send({ error: err });
    }

    Squad.find((err, squads) => {
      if (err) {
        return res.send({ error: err });
      }

      res.render("update-hero", {
        title: "Update Hero",
        hero: hero,
        squads: squads,
      });
    });
  });
};

const updateHero = ({ params, body }, res) => {
  Hero.findById(params.heroid, (err, hero) => {
    if (err) {
      return res.send({ error: err });
    }
    hero.name = body.name;
    hero.description = body.desc;
    hero.origin = body.origin;
    hero.stats.strength = body.strength;
    hero.stats.perception = body.perception;
    hero.stats.endurance = body.endurance;
    hero.stats.charisma = body.charisma;
    hero.stats.intelligence = body.intelligence;
    hero.stats.agility = body.agility;
    hero.stats.luck = body.luck;

    hero.squad = undefined;
    body.squad && (hero.squad = body.squad);

    hero.save((err, updatedHero) => {
      if (err) {
        return res.send({ error: err });
      }
      res.redirect("/heroes");
    });
  });
};

const reset = (req, res) => {
  let p1 = new Promise((resolve, reject) => {
    Hero.deleteMany({}, (err) => {
      if (err) {
        reject("Error");
        return res.send({ error: err });
      }
      resolve("Success");
    });
  });
  let p2 = new Promise((resolve, reject) => {
    Squad.deleteMany({}, (err) => {
      if (err) {
        reject("Error");
        return res.send({ error: err });
      }
      resolve("Success");
    });
  });

  Promise.all([p1, p2]).then(() => {
    let p1 = new Promise((resolve, reject) => {
      Hero.insertMany(heroData, (err) => {
        if (err) {
          reject("Error");
          return res.send({ error: err });
        }
        resolve("Success");
      });
    });
    let p2 = new Promise((resolve, reject) => {
      Squad.insertMany(squadData, (err) => {
        if (err) {
          reject("Error");
          return res.send({ error: err });
        }
        resolve("Success");
      });
    });
    Promise.all([p1, p2]).then(() => {
      res.redirect("heroes");
    });
  });
};

const getSquadsIndex = (req, res) => {
  Squad.find({}, null, { lean: true }, (err, squads) => {
    if (err) {
      return res.send({ error: err });
    }
    Hero.find(
      { squad: { $exists: true } },
      "name stats squad",
      { lean: true },
      (err, heroes) => {
        if (err) {
          return res.send({ error: err });
        }
        for (let i = 0; i < squads.length; i++) {
          squads[i].heroes = [];
          for (let j = 0; j < heroes.length; j++) {
            if (heroes[j].squad === squads[i].name) {
              heroes[j].overall = getOverall(heroes[j]);
              squads[i].heroes.push(heroes[j]);
              heroes.splice(j, 1);
              j--;
            }
          }

          let overall = squads[i].heroes.reduce(
            (acc, val) => acc + val.overall,
            0
          );
          squads[i].overall = overall;
        }
        res.render("squads", { title: "Super Squads", squads: squads });
      }
    );
  });
};

const getSquadForm = (req, res) => {
  res.render("create-squad", { title: "Create A Squad" });
};

const createSquad = ({ body }, res) => {
  let squad = { name: body.name };

  // body.hq && (squad.hq = body.hq);
  // squad.hq || (squad.hq = "Unknown");
  // Another Way to do it:
  squad.hq = body.hq ? body.hq : "Unknown";

  Squad.create(squad, (err, squad) => {
    if (err) {
      return res.send({ error: err });
    }
    res.redirect("/squads");
  });
};

const deleteSquad = ({ params }, res) => {
  Squad.findByIdAndRemove(params.squadid, (err, squad) => {
    if (err) {
      return res.send({ error: err });
    }

    Hero.find({ squad: { $exists: true } }, "squad", {}, (err, heroes) => {
      if (err) {
        return res.send({ error: err });
      }
      let promises = [];
      for (hero of heroes) {
        if (hero.squad == squad.name) {
          hero.squad = undefined;

          let promise = new Promise((resolve, reject) => {
            hero.save((err) => {
              if (err) {
                reject("Error");
                return res.send({ error: err });
              }
              resolve("Success");
            });
          });
          promises.push(promise);
        }
      }
      Promise.all(promises).then(() => {
        res.redirect("/squads");
      });
    });
  });
};

module.exports = {
  getIndex,
  getHeroesIndex,
  getHeroesForm,
  createNewHero,
  deleteHero,
  getUpdateForm,
  updateHero,
  reset,
  getSquadsIndex,
  getSquadForm,
  createSquad,
  deleteSquad,
};
