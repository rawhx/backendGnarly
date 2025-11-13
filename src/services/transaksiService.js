const sequelize = require("../../pkg/config/database");

const postTransaksi = async (payload) => {
  const { barang, total, tipe, cash } = payload.body;

  let totalBarang = 0;
  barang.forEach((dt) => {
    totalBarang += dt.qty;
  });

  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");
  const second = String(now.getSeconds()).padStart(2, "0");

  const kodeTransaksi = `TR-${year}${month}${day}${hour}${minute}${second}`;

  const t = await sequelize.transaction();

  try {
    const [insertResult] = await sequelize.query(
      `INSERT INTO transaksi 
        (kode_transaksi, total_jenis, total_barang, total_harga, created_by, created_at, tipe, cash) 
       VALUES (?, ?, ?, ?, ?, NOW(), ?, ?)`,
      {
        replacements: [
          kodeTransaksi,
          barang.length,
          totalBarang,
          total,
          payload.user.id,
          tipe, 
          cash
        ],
        type: sequelize.QueryTypes.INSERT,
        transaction: t,
      }
    );

    const id_transaksi = insertResult; 
    console.log("id transaksi: ", id_transaksi )

    for (const item of barang) {
      const { id_barang, qty, harga_satuan, kode_barang } = item;

      // Cek stok dulu sebelum insert dan update
      const [stokCheck] = await sequelize.query(
        `SELECT qty FROM stok_barang
        WHERE id_detail_barang = ? AND lokasi = 'Toko'`,
        {
          replacements: [id_barang],
          type: sequelize.QueryTypes.SELECT,
          transaction: t,
        }
      );

      if (!stokCheck) {
        await t.rollback();
        return {
          error: true,
          code: 400,
          message: "Barang tidak ditemukan di stok toko",
        };
      }

      if (stokCheck.qty < qty) {
        await t.rollback();
        return {
          error: true,
          code: 400,
          message: `Stok tidak mencukupi untuk barang dengan Kode ${kode_barang}. Stok tersedia: ${stokCheck.qty}, diminta: ${qty}`,
        };
      }

      // Insert ke detail_transaksi
      await sequelize.query(
        `INSERT INTO detail_transaksi 
          (id_transaksi, id_barang, qty, harga_barang)
        VALUES (?, ?, ?, ?)`,
        {
          replacements: [id_transaksi, id_barang, qty, harga_satuan],
          type: sequelize.QueryTypes.INSERT,
          transaction: t,
        }
      );

      // Kurangi stok
      await sequelize.query(
        `UPDATE stok_barang
        SET qty = qty - ?
        WHERE id_detail_barang = ? AND lokasi = 'Toko'`,
        {
          replacements: [qty, id_barang],
          type: sequelize.QueryTypes.UPDATE,
          transaction: t,
        }
      );

      // Ambil stok terbaru
      const [stok] = await sequelize.query(
        `SELECT qty FROM stok_barang
        WHERE id_detail_barang = ? AND lokasi = 'Toko'`,
        {
          replacements: [id_barang],
          type: sequelize.QueryTypes.SELECT,
          transaction: t,
        }
      );

      let statusStok = "Tersedia";
      if (stok.qty === 0) statusStok = "Habis";
      else if (stok.qty < 5) statusStok = "Hampir Habis";

      // Update status stok
      await sequelize.query(
        `UPDATE stok_barang
        SET status_stok = ?
        WHERE id_detail_barang = ? AND lokasi = 'Toko'`,
        {
          replacements: [statusStok, id_barang],
          type: sequelize.QueryTypes.UPDATE,
          transaction: t,
        }
      );
    }


    await t.commit();

    return {
      error: false,
      code: 200,
      message: "Transaksi berhasil disimpan",
      kode_transaksi: kodeTransaksi,
    };

  } catch (error) {
    await t.rollback();

    const message =
      error?.original?.sqlMessage ||
      error?.original?.message ||
      error?.message ||
      "Terjadi kesalahan server";

    if (error?.original?.code === "ER_DUP_ENTRY") {
      const message = `Data transaksi duplikat`;
      return { error: true, code: 400, message };
    }

    return { error: true, code: 500, message };
  }
}

const getTransaksi = async (payload) => {
  const { tanggal_awal, tanggal_akhir } = payload.query;
  console.log(tanggal_awal)

  try {
    let query = `SELECT * FROM transaksi`
    let replacements = {};

    if (tanggal_awal && tanggal_akhir) {
      query += ` WHERE DATE(created_at) BETWEEN :tanggal_awal AND :tanggal_akhir`
      replacements.tanggal_awal = tanggal_awal
      replacements.tanggal_akhir = tanggal_akhir
    }

    query += ` ORDER BY created_at DESC`

    const rows = await sequelize.query(
      query,
      {
        replacements,
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const totalTransaksi = rows.reduce((acc, curr) => acc + curr.total_harga, 0);
    const jumlahTransaksi = rows.length;
    const totalBarangTerjual = rows.reduce((acc, curr) => acc + curr.total_barang, 0);

    return { error: false, code: 200, data: {
      transaksi: rows,
      total: totalTransaksi, 
      jumlah: jumlahTransaksi, 
      total_barang: totalBarangTerjual 
    }};
  } catch (error) {
    const message =
      error?.original?.sqlMessage ||
      error?.original?.message ||
      error?.message ||
      "Terjadi kesalahan server";

    return { error: true, code: 500, message };
  }
}

module.exports = { postTransaksi, getTransaksi }