const ResponseSuccess = (res, code, message, data) => {
    return res.status(code).json({
        "status_code": code || 200,
        "message": message || "success",
        "data": data || null
    });
}

const ResponseError = (res, code, message, error) => {
    return res.status(code).json({
        "status_code": code || 500,
        "message": message || "error",
        "errror": error || null
    });
}

module.exports = {ResponseSuccess, ResponseError}