const express = require("express");
const { token } = require("../controllers/service-auth.controller");
const router = express.Router();

router.post("/token", token);

module.exports = router;
