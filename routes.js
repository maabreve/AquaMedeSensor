module.exports = function (app) {

    app.use(function (req, res, next) {
        console.log('Middleware disparado........');
        next();
    });

    // apis ===============================================================
    // WATER SENSOR 
    app.route('/api/watersensor')
        .post(function (req, res) {
            if (err) {
                res.send(err);
            }
            
            console.log(req.body);
            res.send(200);
        });
};