const config = require("../config/config");
const AWS = require("aws-sdk");
const Common = { get: {}, post: {}, put: {}, delete: {} };

const path = require("path");
AWS.config.loadFromPath(path.resolve(__dirname, "../config/aws-config.json"));
const spacesEndpoint = new AWS.Endpoint("s3.amazonaws.com");
const s3Object = new AWS.S3({
	endpoint: spacesEndpoint,
});

const stripUTF8 = (text) => {
	return text.replace(/[^\x00-\x7F]/g, "_");
};

Common.s3Url = (path = "") => {
	if (!path) {
		return null;
	}
	if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("blob:")) {
		return path;
	}
	let _ = config.url.s3Endpoint.concat(path);
	return _.toString();
};
Common.post.getSignedUrl = (req, res) => {
	let params = req.body;
	if (!params.k || !params.n) {
		res.status(404).json({
			errCode: 1,
			message: "No such file exists.",
		});
		return;
	}
	let Key = params.k;
	let url = s3Object.getSignedUrl("getObject", {
		Bucket: config.aws.bucket,
		Key,
		Expires: 600, // seconds
		ResponseContentDisposition: `attachment; filename=${stripUTF8(params.n)}.mp4;`,
	});
	let urlObject = new URL(url);
	url = url.replace(`${urlObject.origin}/`, config.url.s3Endpoint);
	res.status(200).json({
		success: 1,
		url: url,
	});
};

Common.compressResponse = (arrayOfObjects) => {
	const compressed = {
		keys: {},
		data: [],
	};
	if (arrayOfObjects.length === 0) {
		return compressed;
	}
	let keyys = Object.keys(arrayOfObjects[0]);
	keyys.forEach((k, index) => {
		compressed.keys[k] = index;
	});
	arrayOfObjects.forEach((v) => {
		compressed.data.push(Object.values(v));
	});
	return compressed;
};
module.exports = Common;
