const express = require("express");
const { requestValidasi } = require("../../pkg/validasi");
const { roleOwner, roleAdminGudang } = require("../../pkg/middleware/role");
const { RequestMutasi, AksiMutasi, GetMutasi } = require("../handler/mutasiHandler");

const mutasi = express.Router();

const requestMutasi = [
  { field: "tipe", required: true, enum: ["Request", "Retur"] },
  { field: "qty", required: true },
  { field: "id_barang", required: true}
]

const reqAksi = [
  { field: "status", required: true, enum: ["Diterima", "Ditolak"] }
]

mutasi.get("/", GetMutasi)
mutasi.post("/", requestValidasi(requestMutasi), RequestMutasi)
mutasi.patch("/:id_mutasi", requestValidasi(reqAksi), AksiMutasi)

module.exports = mutasi