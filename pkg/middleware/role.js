const { ResponseError } = require("../response");

const roleOwner = (req, res, next) => {
    console.log(req.user)
    if (req.user.role !== "OW") {
        return ResponseError(res, 403, "Tidak memiliki hak akses");   
    }
    next();
};

const roleAdminGudang = (req, res, next) => {
    if (req.user.role !== "AG") {
        return ResponseError(res, 403, "Tidak memiliki hak akses");   
    }
    next();
};

const roleAdminKasir = (req, res, next) => {
    if (req.user.role !== "AK") {
        return ResponseError(res, 403, "Tidak memiliki hak akses");   
    }
    next();
};

const roleKaryawanObat = (req, res, next) => {
    if (req.user.role !== "KO") {
        return ResponseError(res, 403, "Tidak memiliki hak akses");   
    }
    next();
};

module.exports = {roleOwner, roleAdminGudang, roleAdminKasir, roleKaryawanObat};
