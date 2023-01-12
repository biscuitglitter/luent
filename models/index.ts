import { Note } from "./note";
import { User } from "./user";

User.hasMany(Note);
Note.belongsTo(User); 
// sequelize automatically creates an attribute called userId on the Note model

Note.sync({ alter: true });
User.sync({ alter: true });

export { Note, User };