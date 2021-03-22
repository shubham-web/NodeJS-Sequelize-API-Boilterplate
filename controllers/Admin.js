const { users: User } = require("../models/DB");
const API = require("./Api");
const Common = require("./Common");
const Admin = { get: {}, post: {}, put: {}, patch: {}, delete: {} };

Admin.get.user = async (req, res) => {
	let userId = parseInt(req.params.id);
	if (!userId) {
		res.status(400).json({
			message: "User id is missing or has invalid characters.",
		});
		return;
	}
	User.findOne({
		where: {
			id: userId,
		},
		raw: true,
	})
		.then((user) => {
			if (!user) {
				res.status(404).json({
					message: "No such user exists.",
				});
				return;
			}
			let keysToSend = ["id", "name", "email", "isActive", "createdAt"];
			let filtered = {};
			for (let key of keysToSend) {
				filtered[key] = user[key];
			}
			res.status(200).json({
				success: true,
				message: "",
				data: filtered,
			});
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({
				message: "Internal server error occurred.",
				data: err,
			});
		});
};

Admin.get.users = async (req, res) => {
	const users = await User.findAll({ raw: true, order: [["id", "DESC"]] });
	let keysToSend = ["id", "name", "email", "createdAt", "isActive"];
	let data = users.map((e) => {
		let filtered = {};
		for (let key of keysToSend) {
			filtered[key] = e[key];
		}
		return filtered;
	});
	res.status(200).json({
		success: true,
		message: "",
		data: Common.compressResponse(data),
	});
};
Admin.patch.user = async (req, res) => {
	let userId = parseInt(req.params.id);
	if (!userId) {
		res.status(400).json({
			message: "User id is missing or has invalid characters.",
		});
		return;
	}

	let user = await User.findOne({ where: { id: userId } }).catch((err) => {
		res.status(500).json({
			message: "Internal server error occurred.",
			data: err,
		});
	});
	if (!user) {
		res.status(404).json({
			message: "No such user exists.",
		});
		return;
	}
	if (user.privileges.includes("dev")) {
		res.status(403).json({
			message: "Protected Account.",
		});
		return;
	}

	let newValues = req.body;
	let updationAllowed = ["name", "email", "password", "isActive", "privileges"];
	let newData = {};
	for (let changedKey in newValues) {
		if (updationAllowed.includes(changedKey)) {
			newData[changedKey] = newValues[changedKey];
		} else {
			res.status(409).json({
				message: `The key "${changedKey}" doesn't exist in database or can not be updated.")`,
			});
			return;
		}
	}
	user.update(newData, { returning: true, plain: true })
		.then((updatedUser) => {
			let keysToSend = ["id", "name", "email", "privileges", "isActive", "createdAt"];
			let filtered = {};
			for (let key of keysToSend) {
				filtered[key] = updatedUser[key];
			}
			res.json({
				success: 1,
				message: "User modified successfully.",
				data: filtered,
			});
		})
		.catch((e) => {
			res.status(500).json({
				message: "An error occurred while updating user details",
				data: e,
			});
		});
};
Admin.post.user = async (req, res) => {
	if (!req.body.name || !req.body.email || !req.body.password) {
		res.status(400).json({
			message: "You missed out some fields!",
		});
		return;
	}
	let privileges = ["app"];
	if (req.body.privileges) {
		privileges.push(...req.body.privileges);
	}

	const newUser = {
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
		privileges: privileges,
		isActive: 1,
	};
	let userRecord = await User.findOne({ where: { email: req.body.email } });
	if (userRecord === null) {
		return User.create(newUser).then((user) => {
			res.status(201).json({
				success: true,
				message: "Account created!",
				data: { id: user.id },
			});
		});
	} else {
		res.status(409).json({
			message: "Account already exists!",
		});
	}
};
Admin.deleteuser = (userId) => {
	return new Promise((resolve, reject) => {
		User.findOne({
			where: { id: userId },
		})
			.then((user) => {
				if (!user) {
					reject([400, "No such user exists!"]);
					return;
				}
				if (user.privileges.includes("admin")) {
					reject([403, "Admin's account can not be deleted this way."]);
					return;
				}
				if (user.privileges.includes("maintainer")) {
					reject([403, "Maintainer's account can not be deleted this way."]);
					return;
				}
				if (user.privileges.includes("dev")) {
					reject([403, "Protected Account."]);
					return;
				}
				user.destroy()
					.then(() => {
						API.deleteS3Directory(`usercontent/${userId}/`)
							.then(() => {
								console.log("Deleted", `usercontent/${userId}/`.inverse);
							})
							.catch((e) => {
								console.log(`Error while deleting user's directory ${e.toSting()}`, e);
							});
						resolve([200, "Deleted!"]);
					})
					.catch((err) => {
						reject([500, err]);
						console.log("Error while deleting user #".concat(id), err);
					});
				return null;
			})
			.catch((err) => {
				reject([500, err]);
			});
	});
};
Admin.delete.user = (req, res) => {
	let userId = parseInt(req.params.id);
	if (!userId) {
		res.status(400).json({
			message: "User id is missing or has invalid characters.",
		});
		return;
	}
	Admin.deleteuser(userId)
		.then((r) => {
			res.status(r[0]).json({
				success: true,
				message: r[1],
			});
		})
		.catch((r) => {
			res.status(r[0]).json({
				message: r[1],
			});
		});
};

module.exports = Admin;
