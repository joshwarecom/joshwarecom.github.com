module.exports = {
    init: function(app, log_function, logger_object, shared_handler_data) {

        app.head('/sample_head_request', (req, res) => {
            log_function("log entry from /sample_head_request", req, logger_object.info);
            res.set("msg", "/sample_head_request successful.");
            res.status(200).send();
        })

    }
};