const router = require("express").Router();
const controllers = {
	index: require("../controllers/Index"),
	api: require("../controllers/Api"),
	auth: require("../controllers/Auth"),
	admin: require("../controllers/Admin"),
	user: require("../controllers/User"),
	common: require("../controllers/Common"),
	upload: require("../controllers/Upload"),
	middleware: require("../controllers/Middleware"),
};
let adminAccessible = ["/admin/*"];

let requests = {};

let checkJWT = [];

requests.get = {
	/** Authentication (Endpoints which does not require any authorization token) */
	"/auth/check-reset-token/:token": controllers.auth.get.checkresettoken,
	"/auth/hashpassword/:password": controllers.auth.get.hashpassword,

	/** User APIs */
	"/me": controllers.user.get.me,
	"/usercontent": controllers.user.get.usercontent,
	"/usercontent/:key": controllers.user.get.usercontent,

	/** Admin APIs */
	"/admin/users": controllers.admin.get.users,
	"/admin/user/:id": controllers.admin.get.user,
};

requests.post = {
	/** Authentication (Endpoints which does not require any authorization token) */
	"/auth/login": controllers.auth.post.login,
	"/auth/register": controllers.auth.post.register,
	"/auth/forgot-password": controllers.auth.post.forgotPassword,
	"/no-auth/get-signed-url": controllers.common.post.getSignedUrl,

	/** User APIs */

	/** Admin APIs (Endpoints which requires admin privilege) */
	"/admin/user": controllers.admin.post.user,
	"/admin/upload": controllers.upload.adminUploads,
};

requests.put = {
	"/me": controllers.user.put.me,
};

requests.patch = {
	"/admin/user/:id": controllers.admin.patch.user,
	"/auth/reset-password/:token": controllers.auth.patch.resetPassword,
};

requests.delete = {
	/** Admin APIs */
	"/admin/user/:id": controllers.admin.delete.user,
	"/me/profile-picture": controllers.user.delete.profilePicture,
};

for (let key in requests) {
	if (typeof requests[key] !== "object") continue;
	for (let ep in requests[key]) {
		if (ep.startsWith("/admin/") || ep.startsWith("/auth/") || !ep.startsWith("/no-auth/")) {
			// This endpoint is either public which doesn't require user auth or an admin endpoint.
		} else {
			checkJWT.push(ep);
		}
	}
}
checkJWT = [...new Set(checkJWT)]; // to remove duplicates among different methods

router.use(controllers.index);
router.use(controllers.middleware.addRequestTime);
router.use(adminAccessible, (req, res, next) => {
	controllers.middleware.checkAuth(req, res, next, true);
});

router.use(checkJWT, (req, res, next) => {
	controllers.middleware.checkAuth(req, res, next, false);
});

for (let method in requests) {
	if (typeof requests[method] !== "object") continue;
	for (let endpoint in requests[method]) {
		router.route(endpoint)[method](requests[method][endpoint]);
		/**
		 * Ex.
		 * router.route("/login").post(requests.post.auth.login)
		 */
	}
}

module.exports = router;
