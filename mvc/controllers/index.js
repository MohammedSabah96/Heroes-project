const mongoose = require("mongoose");
const Hero = mongoose.model("Hero");

let data = require("../../Default_heroes");
let heroData = data.heroes;

const getIndex = (req, res, next) => {
  res.render("index", { title: "Mongoose" });
};

const getHeroesIndex = (req, res) => {
  Hero.find((err, heroes) => {
    if (err) {
      return res.send({ error: err });
    }
    res.render("heroes", { title: "Hall Of Heroes", heroes: heroes });
  });
};
const getHeroesForms = (req, res) => {
  res.render("create-hero", { title: "Create A Hero" });
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
    res.render("update-hero", { title: "Update Hero", hero: hero });
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
    hero.save((err, updatedHero) => {
      if (err) {
        return res.send({ error: err });
      }
      res.redirect("/heroes");
    });
  });
};

const reset = (req, res) => {
  Hero.deleteMany({}, (err, info) => {
    if (err) {
      return res.send({ error: err });
    }
    Hero.insertMany(heroData, (err, info) => {
      if (err) {
        return res.send({ error: err });
      }

      res.redirect("/heroes");
    });
  });
};

module.exports = {
  getIndex,
  getHeroesIndex,
  getHeroesForms,
  createNewHero,
  deleteHero,
  getUpdateForm,
  updateHero,
  reset,
};
