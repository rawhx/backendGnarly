const express = require("express");
const { getPenerimaanBarang, getDetailPenerimaanBarang, postPenerimaanBarang } = require("../handler/barangHandler");
const { requestValidasi } = require("../../pkg/validasi");

const rulePostPenerimaan = [
  { field: "no_nota", required: true },
  { 
    field: "barang", 
    required: true, 
    isArray: true, 
    nested: [
      { field: "kode_barang", required: true },
      { field: "kategori", required: true, enum: ["Makanan", "Minuman", "Obat-obatan", "Lainnya"]  },
      { field: "qty", required: true },
      { field: "tanggal_kadaluarsa", required: true }
    ]
  }
];


const penerimaanBarang = express.Router();

penerimaanBarang.get("/", getPenerimaanBarang)
penerimaanBarang.get("/:id_penerimaan", getDetailPenerimaanBarang)
penerimaanBarang.post("/", requestValidasi(rulePostPenerimaan), postPenerimaanBarang)

module.exports = penerimaanBarang