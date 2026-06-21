const validate = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params
        });
        next();
    } catch (e) {
        return res.status(400).json({
            success: false,
            msg: "Validation Error",
            errors: e.errors.map(err => ({ field: err.path.join('.'), message: err.message }))
        });
    }
};

module.exports = validate;
