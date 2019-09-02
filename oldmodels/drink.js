'use strict';
module.exports = (sequelize, DataTypes) => {
  const drink = sequelize.define('drink', {
    name: DataTypes.STRING,
    brewery: DataTypes.STRING,
    abv: DataTypes.FLOAT,
    waypointId: DataTypes.INTEGER,
    eventId: DataTypes.INTEGER,
    size: DataTypes.FLOAT
  }, {});
  drink.associate = function(models) {
    // associations can be defined here
    models.drink.belongsTo(models.ridewaypoint);
  };
  return drink;
};