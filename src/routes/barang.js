const express = require("express");
const { getPenerimaanBarang, getDetailPenerimaanBarang, postPenerimaanBarang, postAksiPenerimaanBarang, getDataBarang, getDataBarangSelect } = require("../handler/barangHandler");
const { requestValidasi } = require("../../pkg/validasi");
const { roleOwner, roleAdminGudang } = require("../../pkg/middleware/role");

const rulePostPenerimaan = [
  { field: "no_nota", required: true },
  { 
    field: "barang", 
    required: true, 
    isArray: true, 
    nested: [
      { field: "kode_barang", required: true },
      { field: "nama_barang", required: true },
      { field: "kategori", required: true, enum: ["Makanan", "Minuman", "Obat-obatan", "Lainnya"]  },
      { field: "qty", required: true },
      { field: "tanggal_kadaluarsa", required: true }
    ]
  }
];

const ruleAksi = [
  { field: "status", required: true, enum: ["Disetujui", "Ditolak"] },
  { field: "catatan" },
  { 
    field: "barang", 
    required: true, 
    isArray: true, 
    nested: [
      { field: "id_barang", required: true },
      { field: "harga", required: true }
    ]
  }
]

const barang = express.Router();

barang.get("/penerimaan", getPenerimaanBarang)
barang.get("/penerimaan/:id_penerimaan", getDetailPenerimaanBarang)
barang.post("/penerimaan", roleAdminGudang, requestValidasi(rulePostPenerimaan), postPenerimaanBarang)
barang.patch("/penerimaan/:id_penerimaan", roleOwner, requestValidasi(ruleAksi), postAksiPenerimaanBarang)

barang.get("/", getDataBarang)
barang.get("/select", getDataBarangSelect)


module.exports = barang