const API = require("./Api");

const Middleware = {};

Middleware.addRequestTime = (req, res, next) => {
	req.x_request_ts = new Date().toLocaleString("en-US", {
		timeZone: "Asia/Calcutta",
	}); // indian time string (ef 11/7/2020, 11:28:12 AM)
	next();
};

Middleware.checkAuth = (req, res, next, requireAdminAccess = false) => {
	if (!req.headers || !req.headers.authorization) {
		res.status(401).send({
			message: "Authorization token must be provided.",
		});
		return;
	}
	let token = req.headers.authorization;
	if (token.includes("Bearer ")) {
		token = token.replace("Bearer ", "");
	}
	API.getUserByJwt(token)
		.then((user) => {
			if (!user) {
				res.status(403).send({
					message: "You're no longer an active user. (invalid jwt token)",
				});
				return;
			}
			if (!user.isActive) {
				res.status(403).json({
					message: "Access Denied! (Reason: Account is not active anymore.)",
				});
				return;
			}
			if (requireAdminAccess) {
				if (!(user.privileges.includes("admin") || user.privileges.includes("maintainer"))) {
					res.status(403).send({
						message: "You don't have admin privileges.",
					});
					return;
				}
			}
			req._IS_ADMIN = user.privileges.includes("admin");
			req.vsuser = user;
			next();
		})
		.catch((error) => {
			res.status(401).send({
				message: error.message,
			});
		});
};

module.exports = Middleware;
