'use strict';
module.exports = (sequelize, DataTypes) => {
  const drink = sequelize.define('drink', {
    name: DataTypes.STRING,
    brewery: DataTypes.STRING,
    abv: DataTypes.FLOAT,
    participantId: DataTypes.INTEGER,
    size: DataTypes.FLOAT
  }, {});
  drink.associate = function(models) {
    // associations can be defined here
    models.drink.belongsTo(models.participant);
  };
  return drink;
};