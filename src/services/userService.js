const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sequelize = require("./../../pkg/config/database");


const JWT_SECRET = process.env.JWT_SECRET || "rahasia123";
const JWT_EXPIRES = process.env.JWT_EXPIRES || 1;

const RegisterService = async (payload) => {
  const { username, password } = payload;

  if (!username || !password) {
    return { error: true, code: 400, message: "Semua field wajib diisi" };
  }

  const [check] = await sequelize.query(
    "SELECT * FROM admin WHERE username = ? LIMIT 1",
    { replacements: [username], type: sequelize.QueryTypes.SELECT }
  );

  if (check && check.username) {
    return { error: true, code: 409, message: "Username sudah terdaftar" };
  }

  const hashed = await bcrypt.hash(password, 10);

  await sequelize.query(
    "INSERT INTO admin (username, password) VALUES (?, ?)",
    { replacements: [username, hashed] }
  );

  return { error: false, code: 201, message: "Registrasi berhasil" };
};

const LoginService = async (payload) => {
  const { username, password } = payload;

  const [user] = await sequelize.query(
    "SELECT * FROM admin WHERE username = ? LIMIT 1",
    { replacements: [username], type: sequelize.QueryTypes.SELECT }
  );

  if (!user) {
    return { error: true, code: 404, message: "Akun tidak tersedia" };
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return { error: true, code: 401, message: "Password salah" };
  }

  const token = jwt.sign({ 
    id: user.id,
    username: user.username,
    role: user.role
  }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES * 60 * 60,
  });

  return { 
    error: false, 
    code: 200, 
    message: "Login berhasil", 
    data: { 
      data_pengguna: {
        username: user.username,
        role: user.role 
      },
      token: token
    } };
};

const ProfileService = async (id) => {
  const [user] = await sequelize.query(
    "SELECT * FROM admin WHERE id = ? LIMIT 1",
    { replacements: [id], type: sequelize.QueryTypes.SELECT }
  );

  if (!user) {
    return { error: true, code: 404, message: "Akun tidak tersedia" };
  }

  return { 
    error: false, 
    code: 200, 
    message: "Profile berhasil didapatkan", 
    data: { 
      username: user.username,
      role: user.role
    } };
};

module.exports = { RegisterService, LoginService, ProfileService };
