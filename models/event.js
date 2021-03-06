'use strict';
module.exports = (sequelize, DataTypes) => {
  const event = sequelize.define('event', {
    name: DataTypes.STRING,
    date: DataTypes.DATEONLY,
    description: DataTypes.TEXT,
    logo_url: DataTypes.STRING,
    owner_id: DataTypes.INTEGER
  }, {});
  event.associate = function(models) {
    // associations can be defined here
    models.event.hasMany(models.waypoint);
    models.event.belongsToMany(models.participant, {
      through: models.eventsParticipants,
      onDelete: "SET NULL"
    });
  };
  return event;
};