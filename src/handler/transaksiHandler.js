const { ResponseError, ResponseSuccess } = require("../../pkg/response");
const { postTransaksi, getTransaksi } = require("../services/transaksiService");

const storeTransaksi = async (req, res) => {
    try {
        const result = await postTransaksi(req);

        if (result.error) {
            return ResponseError(res, result.code, result.message);
        }

        return ResponseSuccess(res, result.code, result.message, result.data);
    } catch (error) {
        return ResponseError(res, 500, "Terjadi kesalahan server", error.message);
    }
}

const getTransaksiHandler = async (req, res) => {
    try {
        const result = await getTransaksi(req);
        if (result.error) {
            return ResponseError(res, result.code, result.message);
        }
        return ResponseSuccess(res, result.code, result.message, result.data);
    } catch (error) {
        return ResponseError(res, 500, "Terjadi kesalahan server", error.message);
    }
}

module.exports = { storeTransaksi, getTransaksiHandler }