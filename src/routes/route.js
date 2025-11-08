const express = require("express");
const { ResponseSuccess } = require("../../pkg/response"); 
const { now } = require("sequelize/lib/utils");
const { auth } = require("./user");
const AuthMiddleware = require("../../pkg/middleware/auth");
const barang = require("./barang");
const mutasi = require("./mutasi");
const transaksi = require("./transaksi");

const router = express.Router();

router.get("/", (req, res) => {
    return ResponseSuccess(res, 200, "Hai kami dari kelompok 7", {
        "anggota": [
            {
                "nama": "Achmad Hasbil Wafi Rahmawan",
                "nim": 245150407111012
            },
            {
                "nama": "Achmad Hasbil Wafi Rahmawan",
                "nim": 245150407111012
            },
            {
                "nama": "Achmad Hasbil Wafi Rahmawan",
                "nim": 245150407111012
            },
            {
                "nama": "Achmad Hasbil Wafi Rahmawan",
                "nim": 245150407111012
            },
            {
                "nama": "Achmad Hasbil Wafi Rahmawan",
                "nim": 245150407111012
            }
        ],
        "Waktu": {
            "time": now(),
            "time_id": now().toLocaleString("id-ID")
        }
    })
});

router.use("/auth", auth)

router.use(AuthMiddleware)

const admin = express.Router();
router.use("/admin", admin)
admin.get("/", (req, res) => {
    return ResponseSuccess(res, 200, "route admin", req.user)
})
admin.use("/barang", barang)
admin.use("/mutasi", mutasi)
admin.use("/transaksi", transaksi)

module.exports = router;
