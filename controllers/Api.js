const config = require("../config/config");
const { scryptSync } = require("crypto");
(path = require("path")),
	(API = {}),
	(jwt = require("jsonwebtoken")),
	(User = require("./../models/User")),
	(fs = require("fs")),
	(AWS = require("aws-sdk")),
	(EmailTemplate = require("./../library/mailtemplate")),
	(fetch = require("node-fetch"));

AWS.config.loadFromPath(path.resolve(__dirname, "../config/aws-config.json"));
const spacesEndpoint = new AWS.Endpoint("s3.amazonaws.com");
const s3Object = new AWS.S3({
	endpoint: spacesEndpoint,
});

API = { get: {}, post: {}, put: {}, delete: {} };
API.getTemplate = (data, file) => {
	let t = new EmailTemplate(file);
	return t.get(data);
};
API.hashpassword = (pwd) => {
	return scryptSync(pwd, config.keys.passwordSalt, 32).toString("hex");
};
API.comparePassword = (source, input) => {
	return API.hashpassword(input) === source;
};

API.sendMail = (params = null) => {
	return new Promise((resolve, reject) => {
		// Load the AWS SDK for Node.js
		let AWS = require("aws-sdk");
		let path = require("path");
		// Set the region
		AWS.config.loadFromPath(path.resolve(__dirname, "./config/aws-config.json"));
		// Create sendEmail params
		let params = {
			Destination: {
				/* required */
				/* CcAddresses: [
			"EMAIL_ADDRESS",
		], */
				ToAddresses: [`"${params.name}" <${params.to}>`],
			},
			Message: {
				/* required */
				Body: {
					/* required */
					Html: {
						Charset: "UTF-8",
						Data: params.message,
					},
				},
				Subject: {
					Charset: "UTF-8",
					Data: params.subject,
				},
			},
			Source: `"${config.email.from_name}" <${config.email.from_email}>` /* required */,
			ReplyToAddresses: [config.email.replyTo],
		};

		// Create the promise and SES service object
		let sendPromise = new AWS.SES({ apiVersion: "2010-12-01" }).sendEmail(params).promise();

		// Handle promise's fulfilled/rejected states
		sendPromise
			.then(function (data) {
				resolve({ success: 1, message: data });
			})
			.catch(function (err) {
				console.error(err, err.stack);
				reject({
					message: "A SES error occurred: " + e.name + " - " + e.message,
				});
			});
	});
};

API.getUserByJwt = (token) => {
	return new Promise((resolve, reject) => {
		let decoded = jwt.verify(token, config.keys.secret);
		// Fetch the user by id
		User.findOne({ where: { id: decoded.id } })
			.then((user) => {
				resolve(user);
			})
			.catch(reject);
	});
};
API.deleteS3Directory = async (dir) => {
	return new Promise((resolve, reject) => {
		const listParams = {
			Bucket: config.aws.bucket,
			Delimiter: "/",
			Prefix: dir,
		};
		s3Object.listObjects(listParams, async (err, data) => {
			if (err) {
				console.error("error while listing objects", err);
				reject("error while listing objects" + err);
				return;
			}
			let listedObjects = data;
			if (listedObjects.CommonPrefixes.length > 0) {
				for (let subFolder of listedObjects.CommonPrefixes) {
					await API.deleteS3Directory(subFolder.Prefix).catch(reject);
				}
			}
			if (listedObjects.Contents.length === 0) {
				resolve(1);
				return;
			}

			const deleteParams = {
				Bucket: config.aws.bucket,
				Delete: { Objects: [] },
			};

			listedObjects.Contents.forEach((content) => {
				deleteParams.Delete.Objects.push({ Key: content.Key });
			});
			s3Object.deleteObjects(deleteParams, async (err, data) => {
				if (err) {
					reject("error while deleting objects from cloud" + err);
					console.error("error while deleting objects from cloud" + err);
					return;
				}
				if (listedObjects.IsTruncated) {
					await API.deleteS3Directory(dir).catch(reject);
					resolve(1);
				} else {
					resolve(1);
				}
			});
		});
	});
};

module.exports = API;
