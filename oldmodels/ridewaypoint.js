'use strict';
module.exports = (sequelize, DataTypes) => {
  const ridewaypoint = sequelize.define('ridewaypoint', {
    name: DataTypes.STRING,
    address: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    untappd_id: DataTypes.INTEGER,
    stop_number: DataTypes.INTEGER,
    eventId: DataTypes.INTEGER,
    long: DataTypes.FLOAT,
    lat: DataTypes.FLOAT,
    checkedIn: DataTypes.BOOLEAN
  }, {});
  ridewaypoint.associate = function(models) {
    // associations can be defined here
    models.ridewaypoint.belongsTo(models.ride);
    models.ridewaypoint.hasMany(models.drink);
   };
  return ridewaypoint;
};