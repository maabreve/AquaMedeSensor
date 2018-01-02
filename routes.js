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
                boardSerialNumber: req.body.boardSerialNumber,
                timestamp: new Date(),
                liters: req.body.liters
            };

            var formData = JSON.stringify(form);
            var contentLength = formData.length;
            console.log(formData);

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
        });
}