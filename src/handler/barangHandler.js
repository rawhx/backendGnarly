const { ResponseError, ResponseSuccess } = require("../../pkg/response");
const { postPenerimaan } = require("../services/barangService");

const postPenerimaanBarang = async (req, res) => {
    try {
        const result = await postPenerimaan(req.body);
        
        if (result.error) {
            console.log(2)
            return ResponseError(res, result.code, result.message);
        }
        console.log(3)

        return ResponseSuccess(res, result.code, result.message, result.data);
    } catch (error) {
        return ResponseError(res, 500, "Terjadi kesalahan server", error.message);
    }
}

const getPenerimaanBarang = async (req, res) => {
    return ResponseError(res, 501, "Endpoint masih dalam pengembangan");

    try {
        const result = await RegisterService(req.body);

        if (result.error) {
            return ResponseError(res, result.code, result.message);
        }

        return ResponseSuccess(res, result.code, result.message, result.data);
    } catch (error) {
        return ResponseError(res, 500, "Terjadi kesalahan server", error.message);
    }
}

const getDetailPenerimaanBarang = async (req, res) => {
    return ResponseError(res, 501, "Endpoint masih dalam pengembangan");

    try {
        const result = await RegisterService(req.body);

        if (result.error) {
            return ResponseError(res, result.code, result.message);
        }

        return ResponseSuccess(res, result.code, result.message, result.data);
    } catch (error) {
        return ResponseError(res, 500, "Terjadi kesalahan server", error.message);
    }
}

const postAksiPenerimaanBarang = async (req, res) => {
    return ResponseError(res, 501, "Endpoint masih dalam pengembangan");

    try {
        const result = await RegisterService(req.body);

        if (result.error) {
            return ResponseError(res, result.code, result.message);
        }

        return ResponseSuccess(res, result.code, result.message, result.data);
    } catch (error) {
        return ResponseError(res, 500, "Terjadi kesalahan server", error.message);
    }
}

module.exports = { postPenerimaanBarang, getPenerimaanBarang, getDetailPenerimaanBarang, postAksiPenerimaanBarang }