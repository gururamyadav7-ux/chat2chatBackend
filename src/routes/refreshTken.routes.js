const express = require("express");
const { refreshAccessToken } = require("../controller/refreshtoken.controller");

const router = express.Router();


router.post("/refreshtoken", refreshAccessToken);

module.exports = router;
