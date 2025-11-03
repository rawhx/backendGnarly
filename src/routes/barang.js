const express = require("express");
const { getPenerimaanBarang, getDetailPenerimaanBarang, postPenerimaanBarang, postAksiPenerimaanBarang } = require("../handler/barangHandler");
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

const penerimaanBarang = express.Router();

penerimaanBarang.get("/", getPenerimaanBarang)
penerimaanBarang.get("/:id_penerimaan", getDetailPenerimaanBarang)
penerimaanBarang.post("/", roleAdminGudang, requestValidasi(rulePostPenerimaan), postPenerimaanBarang)
penerimaanBarang.patch("/:id_penerimaan", roleOwner, requestValidasi(ruleAksi), postAksiPenerimaanBarang)

module.exports = penerimaanBarang