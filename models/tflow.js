var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TFlowSchema = new Schema({
    serialNumber: String,
    readId: Number,
    sensorId: Number,
    flowRate: Number,
    volume: Number,
    dateTime: Date
});

module.exports = mongoose.model('TFlow', TFlowSchema);