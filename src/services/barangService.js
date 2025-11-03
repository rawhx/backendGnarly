const sequelize = require("./../../pkg/config/database");
const { now } = require("sequelize/lib/utils");

const postPenerimaan = async (payload) => {
  const { no_nota, barang } = payload.body;
  const user_id = payload.user.id
  
  const t = await sequelize.transaction();

  try {
    const tanggal_diterima = now();

    const [insertResult] = await sequelize.query(
      "INSERT INTO penerimaan_barang (no_nota, tanggal_diterima, total_barang, created_by) VALUES (?, ?, ?, ?)",
      {
        replacements: [no_nota, tanggal_diterima, barang.length, user_id],
        type: sequelize.QueryTypes.INSERT,
        transaction: t
      }
    );

    const penerimaan_id = insertResult;

    for (const item of barang) {
      await sequelize.query(
        `INSERT INTO detail_penerimaan_barang
         (id_penerimaan, kode_barang, nama_barang, kategori, qty, tanggal_kadaluarsa)
         VALUES (?, ?, ?, ?, ?, ?)`,
        {
          replacements: [
            penerimaan_id,
            item.kode_barang,
            item.nama_barang,
            item.kategori,
            item.qty,
            item.tanggal_kadaluarsa
          ],
          transaction: t
        }
      );
    }

    const [header] = await sequelize.query(
      "SELECT * FROM penerimaan_barang WHERE id = ?",
      { replacements: [penerimaan_id], type: sequelize.QueryTypes.SELECT, transaction: t }
    );

    const [details] = await sequelize.query(
      "SELECT * FROM detail_penerimaan_barang WHERE id_penerimaan = ?",
      { replacements: [penerimaan_id], type: sequelize.QueryTypes.SELECT, transaction: t }
    );

    await t.commit();

    return { error: false, code: 200, message: "Payload valid", data: { header, details } };
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
};

const getPenerimaan = async () => {
  const [data] = await sequelize.query(
    "SELECT * FROM penerimaan_barang"
  )

  return { error: false, code: 200, message: "Berhasil mendapatkan data", data: data };
}

const getPenerimaanDetail = async (id) => {
  const [penerimaan] = await sequelize.query(
    `
      SELECT * FROM penerimaan_barang pb
      WHERE pb.id = ?
    `,
    { replacements: [id], type: sequelize.QueryTypes.SELECT }
  )

  const [barang] = await sequelize.query(
    `
      SELECT * FROM detail_penerimaan_barang
      WHERE id_penerimaan = ?
    `,
    { replacements: [id], type: sequelize.QueryTypes.SELECT }
  )

  if (!penerimaan && penerimaan == null) {
    return { error: true, code: 404, message: "Data tidak tersedia", data: {
      penerimaan,
      data_barang: barang
    }};
  }

  return { error: false, code: 200, message: "Berhasil mendapatkan data", data: {
      penerimaan,
      data_barang: barang
    }};
}

const postAksi = async (id, payload) => {
  const { status, barang } = payload;

  const t = await sequelize.transaction();

  try {
    const penerimaan = await sequelize.query(
      `SELECT id FROM penerimaan_barang WHERE id = ?`,
      {
        replacements: [id],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!penerimaan.length) {
      return {
        error: true,
        code: 404,
        message: "Data penerimaan tidak ditemukan",
        data: null,
      };
    }

    await sequelize.query(
      "UPDATE penerimaan_barang SET status = ? WHERE id = ?",
      {
        replacements: [status, id],
        type: sequelize.QueryTypes.UPDATE,
        transaction: t,
      }
    );

    for (const item of barang) {
      const barangRows = await sequelize.query(
        `
          SELECT * FROM detail_penerimaan_barang
          WHERE id_penerimaan = ? AND id = ?
        `,
        {
          replacements: [id, item.id_barang],
          type: sequelize.QueryTypes.SELECT,
          transaction: t,
        }
      );

      if (barangRows.length === 0) {
        await t.rollback();
        return {
          error: true,
          code: 404,
          message: `Data barang dengan id ${item.id_barang} tidak ditemukan`,
          data: null,
        };
      }

      await sequelize.query(
        `
        UPDATE detail_penerimaan_barang 
        SET harga_satuan = ? 
        WHERE id_penerimaan = ? AND id = ?
        `,
        {
          replacements: [item.harga, id, item.id_barang],
          type: sequelize.QueryTypes.UPDATE,
          transaction: t,
        }
      );

      if (status == "Disetujui") {
        stok_status = "Tersedia"
        if (stok_status === 3) {
          stok_status = "Hampir Habis"
        } else if (stok_status === 0) {
          stok_status = "Habis"
        }

        await sequelize.query(
          `
          INSERT INTO stok_barang (id_detail_barang, lokasi, qty, status_stok, updated_at)
          VALUES(?, ?, ?, ?, ?) 
          `,
          {
            replacements: [item.id_barang, "Gudang", barangRows[0].qty, stok_status, now()],
            type: sequelize.QueryTypes.INSERT,
            transaction: t,
          }
        );
      }
    }

    await t.commit();

    return {
      error: false,
      code: 200,
      message: "Berhasil melakukan update",
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
};

module.exports = { postPenerimaan, getPenerimaan, getPenerimaanDetail, postAksi };
