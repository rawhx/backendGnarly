const express = require("express");
const { requestValidasi } = require("../../pkg/validasi");
const { roleOwner, roleAdminGudang } = require("../../pkg/middleware/role");
const { storeTransaksi, getTransaksiHandler } = require("../handler/transaksiHandler");

const transaksi = express.Router();

const postTransaksi = [
    {
        field: "barang",
        required: true, 
        isArray: true,
        neseted: [
            { field: "id_barang", required: true },
            { field: "qty", required: true },
            { field: "harga_satuan", required: true }
        ]
    },
    { field: "total", required: true }
]

const getTransaksi = [
    {
        field: "tanggalAwal",
    },
    {
        field: "tanggalAkhir",
    }
]

transaksi.post("/", requestValidasi(postTransaksi), storeTransaksi)
transaksi.get("/", requestValidasi(getTransaksi), getTransaksiHandler)

module.exports = transaksi