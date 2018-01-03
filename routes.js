module.exports = function (app) {

    app.use(function (req, res, next) {
        console.log('Middleware disparado........');
        next();
    });

    // apis ===============================================================
    // WATER SENSOR 
    app.route('/api/diaryflow')
        .post(function (req, res) {

            var request = require('request');

            var form = {
                idLeitura: req.body.idLeitura,
                idSensor: req.body.idSensor,
                vazaoInstantanea: req.body.vazaoInstantanea,
                volumeTotalAcumulado: req.body.volumeTotalAcumulado,
                volumeDiaAcumulado: req.body.volumeDiaAcumulado,
                dataHora: req.body.dataHora
            };

            var formData = JSON.stringify(form);
            var contentLength = formData.length;
            
            // local
            request({
                uri: 'http://192.168.0.103:3001/api/diaryflow',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: formData,
                method: 'POST'
            }, function (errLocal, resLocal, bodyLocal) {
                if (!errLocal && resLocal.statusCode == 200) {
                    console.log('local diary flow posted');
                    res.status(200).send(bodyLocal);
                } else {
                    // TODO: handle
                    console.log('error in post local diary flow ', errLocal);
                    res.status(500).send(errLocal);
                }
            });

            // cloud
            request({
                uri: 'http://192.168.0.103:3000/api/diaryflow',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: formData,
                method: 'POST'
            }, function (errCloud, resCloud, bodyCloud) {
                if (!errCloud && resCloud.statusCode == 200) {
                    // TODO: handle
                    console.log('cloud diary flow posted');
                } else {
                    // TODO: handle
                    console.log('error in post cloud diary flow', errCloud);
                }
            });
        });
}