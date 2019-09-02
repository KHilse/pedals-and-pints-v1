'use strict';
module.exports = (sequelize, DataTypes) => {
  const ride = sequelize.define('ride', {
    eventId: DataTypes.INTEGER,
    started: DataTypes.BOOLEAN,
    ended: DataTypes.BOOLEAN
  }, {});
  ride.associate = function(models) {
    // associations can be defined here
    models.ride.belongsTo(models.participant);
    models.ride.hasMany(models.ridewaypoint);
  };
  return ride;
};