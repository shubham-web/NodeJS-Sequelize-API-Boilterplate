const data = {
	siteTitle: "Api Server",
	url: {
		frontend: "https://example.com/",
		s3Endpoint: "https://cdn.example.com/",
	},
	allowedOrigins: ["https://example.com/", "http://localhost:3000"],
	aws: {
		bucket: "testbucket",
	},
	db: {
		database: "database-name",
		username: "database-username",
		password: "database-password",
		host: "localhost",
	},
	email: {
		from_name: "team example",
		from_email: "no-reply@example.com",
		replyTo: "example.com@gmail.com",
		website: "example.com",
	},
	keys: {
		secret: "cBnN3JLS}~3,$=5d",
		passwordSalt: "MTj^nvsu}atLfB8tvd*nM3.nC%DTEu-D(B&xW:vh",
	},
};
module.exports = data;
