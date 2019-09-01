'use strict';
module.exports = (sequelize, DataTypes) => {
  const eventsParticipants = sequelize.define('eventsParticipants', {
    eventId: DataTypes.INTEGER,
    participantId: DataTypes.INTEGER
  }, {});
  eventsParticipants.associate = function(models) {
    // associations can be defined here
  };
  return eventsParticipants;
};