let express = require("express");
let router = express.Router();

router.get("/", function (req, res, next) {
	res.send("<h1>API Server 🤠</h1>");
});

module.exports = router;
