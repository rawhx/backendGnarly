
const postPenerimaan = (payload) => {
  const { no_nota, tanggal_diterima, barang } = payload;

  return { error: false, code: 200, message: "Payload valid", data: payload };
};

module.exports = { postPenerimaan };
