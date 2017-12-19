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
            console.log('postman ', req.body);
            var form = {
                boardSerialNumber: req.body.boardSerialNumber,
                timestamp: new Date(),
                liters: req.body.liters
            };

            var formData = JSON.stringify(form);
            var contentLength = formData.length;
            console.log(formData);
            request({
                uri: 'http://localhost:3000/api/diaryflow',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: formData,
                method: 'POST'
            }, function (errCloud, resCloud, bodyCloud) {
                if (!errCloud && resCloud.statusCode == 200) {
                    request({
                        uri: 'http://localhost:3001/api/diaryflow',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: formData,
                        method: 'POST'
                    }, function (errLocal, resLocal, bodyLocal) {
                        if (!errLocal && resLocal.statusCode == 200) {
                            res.status(200).send(bodyLocal);
                        } else {
                            // TODO: handle
                            console.log('error in post local diary flow ', errLocal);
                            res.send(errLocal);
                        }
                    });

                } else {
                    // TODO: handle
                    console.log('error in post cloud diary flow ', errCloud);
                    res.send(errCloud);
                }
            });

        })
}