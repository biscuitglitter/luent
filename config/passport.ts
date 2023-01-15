const { SECRET } = require("../utils/config");
import {
  Strategy as JwtStrategy,
  ExtractJwt,
  StrategyOptions,
} from "passport-jwt";
import { User } from "../models";

const options: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: SECRET,
};

const strategy = new JwtStrategy(options, async (payload, done) => {
  await User.findOne({ where: { username: payload.sub } })
    .then((user) => {
      user ? done(null, user) : done(null, false);
    })
    .catch((err) => done(err, false));
});

module.exports = (passport: any) => {
    passport.use(strategy);
};