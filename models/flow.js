var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FlowSchema = new Schema({
    serialNumber: String,
    sensorId: Number,
    flowRate: Number,
    volume: Number,
    dateTime: Date
});

module.exports = mongoose.model('Flow', FlowSchema);