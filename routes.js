module.exports = function (app) {

    var Board = require('./models/board.js');
    var Flow = require('./models/flow.js');
    var TFlow = require('./models/tflow.js');
    var Business = require('./business.js');

    app.use(function (req, res, next) {
        console.log('Middleware disparado........');
        next();
    });

    // serve sensors
    app.route('/api/dateTime')
        .get(function (req, res) {
            let now = (new Date()).toString();
            res.status(200).json(now);
        });


    // board
    app.route('/api/board')
        .get(function (req, res) {
            Board.findOne(function (err, board) {
                if (err)
                    res.status(500).send(err);

                res.status(200).json(board);
            }).catch(err => {
                console.log('Error GET /api/board - ', err);
            });
        })

        .post(function (req, res) {
            console.log(req.body);
            var board = new Board();
            board.serialNumber = req.body.serialNumber;
            board.macAddress = req.body.macAddress;
            board.dateBoardRegister = req.body.dateBoardRegister;

            board.save(function (error) {
                if (error)
                    res.status(500).send(error);

                res.status(200).json(board);
            });
        })

        .put(function (req, res) {
            Board.findOne(function (error, board) {
                if (error)
                    res.status(500).send(error);


                if (req.body.mainEmail && req.body.mainEmail !== '')
                    board.mainEmail = req.body.mainEmail;

                if (req.body.initialHydrometer && req.body.initialHydrometer !== '' && req.body.initialHydrometer !== 0)
                    board.initialHydrometer = req.body.initialHydrometer;

                if (req.body.peoplesInTheHouse && req.body.peoplesInTheHouse !== '' && req.body.peoplesInTheHouse !== 0)
                    board.peoplesInTheHouse = req.body.peoplesInTheHouse;

                if (req.body.dateUserRegister)
                    board.dateUserRegister = req.body.dateUserRegister;

                board.save(function (error) {
                    if (error)
                        res.status(500).send(error);

                    res.status(200).json(board);
                });
            });
        })

        .delete(function (req, res) {
            if (!req.body._id) {
                Board.remove(function (error) {
                    if (error)
                        res.status(500).send(error);

                    res.status(200).json({ message: 'Board excluído com Sucesso! ' });
                });
            } else {
                Board.remove({ _id: req.body._id }, function (error) {
                    if (error)
                        res.status(500).send(error);

                    res.status(200).json({ message: 'Board excluído com Sucesso! ' });
                });
            }
        });


    app.route('/api/tflow')
        .get(function (req, res) {
            TFlow.find(function (err, flow) {
                if (err)
                    res.status(500).send(err);

                res.status(200).json(flow);
            }).catch(err => {
                console.log('Error GET /api/board - ', err);
                res.status(500).send(err);
            });
        }).delete(function (req, res) {
            TFlow.remove(function (error) {
                if (error)
                    res.send(error);

                res.status(200).json({ message: 'Flows excluídos com sucesso' });
            });
        });


    app.route('/api/flow')
        .get(function (req, res) {
            Flow.find(function (err, flow) {
                if (err)
                    res.status(500).send(err);

                res.status(200).json(flow);
            }).catch(err => {
                console.log('Error GET /api/board - ', err);
                res.status(500).send(err);
            });
        })        
        .delete(function (req, res) {
            Flow.remove(function (error) {
                if (error)
                    res.send(error);

                res.status(200).json({ message: 'Flows excluídos com sucesso' });
            });
        });
        
    app.route('/api/diaryflow')
        .post(function (req, res) {

            let flowRate = req.body.vazaoInstantanea;
            let volume = Business.getVolumeFormule(flowRate);
            // get local board
            Board.findOne((err, board) => {
                if (err) return handleError(err);

                // counters
                var d = new Date(),
                    hour = d.getHours(),
                    min = d.getMinutes(),
                    month = d.getMonth(),
                    year = d.getFullYear(),
                    sec = d.getSeconds(),
                    day = d.getDate();
                
                // get diary 
                TFlow.aggregate(
                    [
                        { $match: { 'dateTime': { $gt: new Date(year, month, day, 0, 0, 0) } } },
                        {
                            $group:
                            {
                                _id: '$serialNumber',   volume: { $sum: "$volume" }
                            }
                        }
                    ], function (err, diaryflow) {
                        if (err) {
                            console.log('tflow aggregate error ', err);
                            res.status(500).json(err);
                        }
                        else {
                            console.log('tflow aggregate  ', diaryflow);
                            // get monthly
                            TFlow.aggregate([
                                { $match: { 'dateTime': { $gt: new Date(year, month) } } },
                                {
                                    $group:
                                    {
                                        _id: '$serialNumber', volume: { $sum: "$volume" }
                                    }
                                }], function (errMonthly, monthlyflow) {
                                    if (errMonthly) {
                                        console.log('erro flow aggregate ',errMonthly);
                                        res.status(500).json(errMonthly);
                                    }
                                    else {

                                        console.log('flow aggregate', monthlyflow);
                                        
                                        // insert local temporary flow 
                                        var tflow = new TFlow();
                                        tflow.serialNumber = board.serialNumber;
                                        tflow.readId = req.body.idLeitura;
                                        tflow.sensorId = req.body.idSensor;
                                        tflow.flowRate = req.body.vazaoInstantanea;
                                        tflow.volume = volume;
                                        tflow.dateTime = req.body.dataHora;

                                        tflow.save(function (error) {
                                            if (error)
                                                res.status(500).send(error);

                                            console.log('temporary flow inserted in local server', err, tflow);
                                        });

                                        let diaryCounter = 0;
                                        let monthlyCounter = 0;

                                        if (!diaryflow || diaryflow.length === 0) {
                                            diaryCounter = volume;      
                                        } else {
                                            diaryCounter = diaryflow[0].volume + volume;
                                        }

                                        if (!monthlyflow || monthlyflow.length === 0) {
                                            monthlyCounter = volume;
                                        }
                                        else {
                                            monthlyCounter = monthlyflow[0].volume + volume;
                                        }

                                        // update cloud
                                        var form = {
                                            serialNumber: board.serialNumber,
                                            sensorId: req.body.idSensor,
                                            diaryCounter: diaryCounter,
                                            monthlyCounter: monthlyCounter
                                        };

                                        var formData = JSON.stringify(form);
                                        var contentLength = formData.length;
                                        var request = require('request');
                                        request({
                                            uri: 'http://192.168.0.103:3000/api/counter',
                                            headers: {
                                                'Content-Type': 'application/json',
                                            },
                                            body: formData,
                                            method: 'PUT'
                                        }, function (errCloud, resCloud, bodyCloud) {
                                            if (!errCloud && resCloud.statusCode == 200) {
                                                console.log('temporary flow inserted in cloud server', err, tflow);
                                                res.status(200).json(form);
                                            } else {
                                                // TODO: handle
                                                console.log('error in post flow in cloud server', errCloud);
                                                res.status(500).json(errCloud);
                                            }
                                        });
                                    }
                                });
                        }
                    });
            });
        });
}