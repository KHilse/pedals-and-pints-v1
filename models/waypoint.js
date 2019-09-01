'use strict';
module.exports = (sequelize, DataTypes) => {
  const waypoint = sequelize.define('waypoint', {
    name: DataTypes.STRING,
    address: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    untappd_id: DataTypes.INTEGER,
    stop_number: DataTypes.INTEGER,
    eventId: DataTypes.INTEGER,
    long: DataTypes.FLOAT,
    lat: DataTypes.FLOAT
  }, {});
  waypoint.associate = function(models) {
    // associations can be defined here
    models.waypoint.belongsTo(models.event);
    models.waypoint.hasMany(models.drink);
   };
  return waypoint;
};