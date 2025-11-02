require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT || "mysql",
    logging: true,
  }
);

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Berhasil melakukan koneksi ke database");
  } catch (error) {
    console.error("Gagal melakukan koneksi ke database:", error.message);
  }
})();

module.exports = sequelize;
