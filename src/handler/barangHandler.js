const { ResponseError, ResponseSuccess } = require("../../pkg/response");
const { postPenerimaan, getPenerimaan, getPenerimaanDetail, postAksi, getBarang, getBarangSelect } = require("../services/barangService");

const postPenerimaanBarang = async (req, res) => {
    try {
        const result = await postPenerimaan(req);
        
        if (result.error) {
            return ResponseError(res, result.code, "Terjadi kesalahan saat mengupload data", result.message);
        }

        return ResponseSuccess(res, result.code, result.message, result.data);
    } catch (error) {
        return ResponseError(res, 500, "Terjadi kesalahan server", error.message);
    }
}

const getPenerimaanBarang = async (req, res) => {
    try {
        const result = await getPenerimaan();

        if (result.error) {
            return ResponseError(res, result.code, "Terjadi kesalahan saat mengambil data", result.message);
        }

        return ResponseSuccess(res, result.code, result.message, result.data);
    } catch (error) {
        return ResponseError(res, 500, "Terjadi kesalahan server", error.message);
    }
}

const getDetailPenerimaanBarang = async (req, res) => {
    try {
        const result = await getPenerimaanDetail(req.params.id_penerimaan);

        if (result.error) {
            return ResponseError(res, result.code, result.message);
        }

        return ResponseSuccess(res, result.code, result.message, result.data);
    } catch (error) {
        return ResponseError(res, 500, "Terjadi kesalahan server", error.message);
    }
}

const postAksiPenerimaanBarang = async (req, res) => {
    // return ResponseError(res, 501, "Endpoint masih dalam pengembangan");

    try {
        const result = await postAksi(req.params.id_penerimaan, req.body);

        if (result.error) {
            return ResponseError(res, result.code, result.message);
        }

        return ResponseSuccess(res, result.code, result.message, result.data);
    } catch (error) {
        return ResponseError(res, 500, "Terjadi kesalahan server", error.message);
    }
}

const getDataBarang = async (req, res) => {
    try {
        const result = await getBarang(req);

        if (result.error) {
            return ResponseError(res, result.code, result.message);
        }

        return ResponseSuccess(res, result.code, result.message, result.data);
    } catch (error) {
        return ResponseError(res, 500, "Terjadi kesalahan server", error.message);
    }
}

const getDataBarangSelect = async (req, res) => {
    try {
        const result = await getBarangSelect(req);

        if (result.error) {
            return ResponseError(res, result.code, result.message);
        }

        return ResponseSuccess(res, result.code, result.message, result.data);
    } catch (error) {
        return ResponseError(res, 500, "Terjadi kesalahan server", error.message);
    }
}

module.exports = { postPenerimaanBarang, getPenerimaanBarang, getDetailPenerimaanBarang, postAksiPenerimaanBarang, getDataBarang, getDataBarangSelect }