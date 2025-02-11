const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

app.use(bodyParser.json());
app.use(
	bodyParser.urlencoded({
		extends: true,
	})
);

app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");
app.use("/public", express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "/views"));

app.get("/", (req, res) => {
	res.send("funcionando");
});

app.listen(3000, () => {
	console.log("Server Rodando...");
});
