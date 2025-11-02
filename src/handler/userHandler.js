const { ResponseSuccess, ResponseError } = require("../../pkg/response");
const { RegisterService, LoginService } = require("../services/userService");

const RegisterHandler = async (req, res) => {
  try {
    const result = await RegisterService(req.body);

    if (result.error) {
      return ResponseError(res, result.code, result.message);
    }

    return ResponseSuccess(res, result.code, result.message, result.data);
  } catch (error) {
    return ResponseError(res, 500, "Terjadi kesalahan server", error.message);
  }
};

const LoginHandler = async (req, res) => {
  try {
    const result = await LoginService(req.body);

    if (result.error) {
      return ResponseError(res, result.code, result.message);
    }

    return ResponseSuccess(res, result.code, result.message, result.data);
  } catch (error) {
    return ResponseError(res, 500, "Terjadi kesalahan server", error.message);
  }
};

module.exports = { RegisterHandler, LoginHandler };
