const { ResponseError, ResponseSuccess } = require("../../pkg/response");
const { postRequestMutasi, postAksiMutasi, getDataMutasi } = require("../services/mutasiService");

const RequestMutasi = async (req, res) => {
    // return ResponseError(res, 501, "Endpoint masih dalam pengembangan");

    try {
        const result = await postRequestMutasi(req);

        if (result.error) {
            return ResponseError(res, result.code, result.message);
        }

        return ResponseSuccess(res, result.code, result.message, result.data);
    } catch (error) {
        return ResponseError(res, 500, "Terjadi kesalahan server", error.message);
    }
}

const AksiMutasi = async (req, res) => {
    try {
        const result = await postAksiMutasi(req.params.id_mutasi, req);

        if (result.error) {
            return ResponseError(res, result.code, result.message);
        }

        return ResponseSuccess(res, result.code, result.message, result.data);
    } catch (error) {
        return ResponseError(res, 500, "Terjadi kesalahan server", error.message);
    }
}

const GetMutasi = async (req, res) => {
    try {
        const result = await getDataMutasi();

        if (result.error) {
            return ResponseError(res, result.code, result.message);
        }

        return ResponseSuccess(res, result.code, result.message, result.data);
    } catch (error) {
        return ResponseError(res, 500, "Terjadi kesalahan server", error.message);
    }
}

module.exports = { RequestMutasi, AksiMutasi, GetMutasi }