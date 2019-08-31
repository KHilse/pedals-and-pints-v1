'use strict';
const bcrypt = require("bcryptjs");

module.exports = (sequelize, DataTypes) => {
  const participant = sequelize.define('participant', {
    firstname: DataTypes.STRING,
    lastname: DataTypes.STRING,
    password: DataTypes.STRING,
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    profile_img_url: DataTypes.STRING
  }, {
    hooks: {
      beforeCreate: (pendingUser) => {

        // Hash the password before storing
        if (pendingUser && pendingUser.password) {
          pendingUser.password = bcrypt.hashSync(pendingUser.password, 10);
        }
      }
    } 
  });
  participant.associate = function(models) {
    // associations can be defined here
    models.participant.belongsToMany(models.event, { through: models.eventsParticipants });
    models.participant.hasMany(models.drink);
  };

  // Custom function validPassword will check on instance of the model (specific user)
  // against a typed-in password. Using bcrypt to compare hashes
  participant.prototype.validPassword = function(typedInPassword) {
    return bcrypt.compareSync(typedInPassword, this.password);
  }

  return participant;
};