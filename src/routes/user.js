const express = require("express");
const { RegisterHandler, LoginHandler } = require("../handler/userHandler");
const { requestValidasi } = require("../../pkg/validasi");

const auth = express.Router();

const ruleRegister = [
  { field: "username", required: true, minLength: 3 },
  { field: "password", required: true, minLength: 8 }
];

const ruleLogin = [
  { field: "username", required: true },
  { field: "password", required: true, minLength: 8 }
];

auth.post("/register", requestValidasi(ruleRegister), RegisterHandler);
auth.post("/login", requestValidasi(ruleLogin), LoginHandler);

module.exports = { auth };
