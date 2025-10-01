module.exports = {
    init: function(app, log_function, logger_object, shared_handler_data) {

        app.post('/sample_post_request', (req, res) => {
            log_function("log entry from /sample_post_request", req, logger_object.info);
            res.status(200).send("/sample_post_request successful.");
        })

    }
};