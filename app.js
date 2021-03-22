let express = require("express"),
	path = require("path"),
	cookieParser = require("cookie-parser"),
	cors = require("cors"),
	fileUpload = require("express-fileupload");
let app = express();
let routes = require("./config/route");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

// https://medium.com/zero-equals-false/using-cors-in-express-cac7e29b005b
/* app.use(
    cors({
        origin: config.allowedOrigins,
    })
); */

app.use(
	fileUpload({
		useTempFiles: true,
		tempFileDir: path.join(__dirname, "tmp"),
	})
);
app.use(express.static(path.join(__dirname, "public")));

app.disable("X-Powered-By");
app.use(function (req, res, next) {
	res.header("X-Developed-By", "shubham.prajapat@pixelnx.com");
	res.header("X-Powered-By", "pixelnx.com");
	next();
});

app.use("/", routes);

app.use(function (req, res, next) {
	res.status(404).send({
		message: "No such api endpoint found.",
	});
});
/* error handler */
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};
	// render the error page
	res.status(err.status || 500).json({
		message: res.locals.message,
	});
});
module.exports = app;
