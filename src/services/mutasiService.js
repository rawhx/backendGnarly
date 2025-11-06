const sequelize = require("../../pkg/config/database");

const postRequestMutasi = async (payload) => {
    const { tipe, qty, id_barang } = payload.body;

    const t = await sequelize.transaction();

    lokasiAsal = tipe === "Request" ? "Gudang" : "Toko" 
    lokasiTujuan = tipe === "Request" ? "Toko" : "Gudang" 

    try {
        await sequelize.query(
            `
                INSERT INTO mutasi (id_barang, tipe, lokasi_asal, lokasi_tujuan, status, qty, created_at, created_by)
                VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)
            `,
            {
                replacements: [id_barang, tipe, lokasiAsal, lokasiTujuan, "Menunggu", qty, payload.user.id],
                transaction: t,
            }
        );

        await t.commit();

        return { error: false, code: 200, message: "Berhasil melakukan permintaan mutasi", data: null };
    } catch (error) {
        await t.rollback();

        const message =
        error?.original?.sqlMessage ||
        error?.original?.message ||
        error?.message ||
        "Terjadi kesalahan server";

        if (error?.original?.code === "ER_DUP_ENTRY") {
            const message = `Data dengan no_nota '${error?.original?.sqlMessage?.match(/'(.+)'/)[1]}' sudah ada`;
            return { error: true, code: 400, message };
        }

        return { error: true, code: 500, message };
    }
}

const postAksiMutasi = async (id, payload) => {
  const { status } = payload.body;

  const t = await sequelize.transaction();

  try {
    // 1. Ambil data mutasi
    const mutasiRows = await sequelize.query(
      `
        SELECT id_barang, tipe, lokasi_asal, lokasi_tujuan, qty, status 
        FROM mutasi
        WHERE id = ?
        FOR UPDATE
      `,
      {
        replacements: [id],
        type: sequelize.QueryTypes.SELECT,
        transaction: t,
      }
    );
    console.log("QUERY 1")

    if (!mutasiRows.length) {
      return {
        error: true,
        code: 404,
        message: "Data mutasi tidak ditemukan",
        data: null,
      };
    }

    const mutasi = mutasiRows[0];

    // 2. Update status mutasi
    await sequelize.query(
      `UPDATE mutasi SET status = ? WHERE id = ?`,
      {
        replacements: [status, id],
        type: sequelize.QueryTypes.UPDATE,
        transaction: t,
      }
    );

    console.log("QUERY 2")
    
    // 3. Jika ditolak → selesai
    if (status !== "Diterima") {
      await t.commit();
      return {
        error: false,
        code: 200,
        message: "Mutasi berhasil diperbarui",
        data: null,
      };
    }

    const { id_barang, lokasi_asal, lokasi_tujuan, qty } = mutasi;

    console.log("QUERY 3 " + id_barang)

    // 4. Cek stok asal
    const [stokAsal] = await sequelize.query(
      `SELECT id, qty FROM stok_barang 
      WHERE id_detail_barang = ? AND lokasi = ? 
      FOR UPDATE`,
      {
        replacements: [id_barang, lokasi_asal],
        type: sequelize.QueryTypes.SELECT,
        transaction: t,
      }
    );

    if (!stokAsal) throw new Error("Stok asal tidak ditemukan");
    if (stokAsal.qty < qty) throw new Error("Stok asal tidak cukup");

    // Hitung Qty Asal Baru
    const qtyAsalBaru = stokAsal.qty - qty;

    // Tentukan status stok asal
    let statusStokAsal = "Tersedia";
    if (qtyAsalBaru === 0) statusStokAsal = "Habis";
    else if (qtyAsalBaru <= 5) statusStokAsal = "Hampir Habis";

    await sequelize.query(
      `UPDATE stok_barang 
      SET qty = ?, status_stok = ? 
      WHERE id = ?`,
      {
        replacements: [qtyAsalBaru, statusStokAsal, stokAsal.id],
        type: sequelize.QueryTypes.UPDATE,
        transaction: t,
      }
    );


    // 5. Cek stok tujuan
    const [stokTujuan] = await sequelize.query(
      `SELECT id, qty FROM stok_barang 
      WHERE id_detail_barang = ? AND lokasi = ? 
      FOR UPDATE`,
      {
        replacements: [id_barang, lokasi_tujuan],
        type: sequelize.QueryTypes.SELECT,
        transaction: t,
      }
    );

    // Jika sudah ada stok di lokasi tujuan → update
    if (stokTujuan) {
      const qtyTujuanBaru = stokTujuan.qty + qty;

      // Tentukan status stok tujuan
      let statusStokTujuan = "Tersedia";
      if (qtyTujuanBaru === 0) statusStokTujuan = "Habis";
      else if (qtyTujuanBaru <= 5) statusStokTujuan = "Hampir Habis";

      await sequelize.query(
        `UPDATE stok_barang 
        SET qty = ?, status_stok = ? 
        WHERE id = ?`,
        {
          replacements: [qtyTujuanBaru, statusStokTujuan, stokTujuan.id],
          type: sequelize.QueryTypes.UPDATE,
          transaction: t,
        }
      );

    } else {
      // Belum ada stok → insert
      let statusBaru = "Tersedia";
      if (qty === 0) statusBaru = "Habis";
      else if (qty <= 5) statusBaru = "Hampir Habis";

      await sequelize.query(
        `INSERT INTO stok_barang (id_detail_barang, lokasi, qty, status_stok)
        VALUES (?, ?, ?, ?)`,
        {
          replacements: [id_barang, lokasi_tujuan, qty, statusBaru],
          type: sequelize.QueryTypes.INSERT,
          transaction: t,
        }
      );
    }


    await t.commit();

    return {
      error: false,
      code: 200,
      message: "Mutasi berhasil Diterima dan stok diperbarui",
      data: null,
    };

  } catch (error) {
    await t.rollback();

    const message =
      error?.original?.sqlMessage ||
      error?.original?.message ||
      error?.message ||
      "Terjadi kesalahan server";

    return { error: true, code: 500, message };
  }
}

const getDataMutasi = async () => {
  const query = `
    SELECT 
      m.id AS id_mutasi,
      m.id_barang,
      m.tipe,
      m.lokasi_asal,
      m.lokasi_tujuan,
      m.qty AS qty_mutasi,
      m.status,
      m.created_at,

      dpb.kode_barang,
      dpb.nama_barang,
      dpb.kategori,
      dpb.tanggal_kadaluarsa,

      sb.qty AS stok_saat_ini,
      sb.status_stok

    FROM mutasi m
    JOIN detail_penerimaan_barang dpb ON dpb.id = m.id_barang
    LEFT JOIN stok_barang sb 
      ON sb.id_detail_barang = m.id_barang 
      AND sb.lokasi = m.lokasi_asal
  `;

  const data = await sequelize.query(query, {
    type: sequelize.QueryTypes.SELECT,
  });

  return { 
    error: false, 
    code: 200, 
    message: "Berhasil mendapatkan data mutasi", 
    data 
  };
};


module.exports = { postRequestMutasi, postAksiMutasi, getDataMutasi }