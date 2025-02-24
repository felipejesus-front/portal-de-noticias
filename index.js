const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

const Posts = require("./Posts.js");

var session = require("express-session");

mongoose
	.connect(
		"mongodb+srv://felipecampos:q1CqrkQltFX8vbQy@api-portal-de-noticias.llg11.mongodb.net/portal_de_noticia_prod?retryWrites=true&w=majority&appName=Api-portal-de-noticias",
		{ useNewUrlParser: true, useUnifiedTopology: true }
	)
	.then(() => {
		console.log("conectado ao banco com sucesso");
	})
	.catch((err) => {
		console.log("Conexão com Banco de Dados Falhou:");
		console.log(err.message);
	});

app.use(bodyParser.json());
app.use(
	bodyParser.urlencoded({
		extends: true,
	})
);

const coockieTimeout = 60000 * 60 * 24;
app.use(
	session({
		secret: "keyboard cat",
		cookie: { maxAge: coockieTimeout },
	})
);

app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");
app.use("/public", express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "/pages"));

app.get("/", (req, res) => {
	if (req.query.busca == null) {
		Posts.find({})
			.sort({ _id: -1 })
			.exec((err, posts) => {
				posts = posts.map((post) => {
					return {
						titulo: post.titulo,
						imagem: post.imagem,
						categoria: post.categoria,
						conteudo: post.conteudo,
						descricaoCurta: post.conteudo.substring(0, 120),
						slug: post.slug,
					};
				});

				Posts.find({})
					.sort({ views: -1 })
					.limit(5)
					.exec((err, topPosts) => {
						topPosts = topPosts.map((post) => {
							return {
								titulo: post.titulo,
								imagem: post.imagem,
								categoria: post.categoria,
								conteudo: post.conteudo,
								descricaoCurta: post.conteudo.substring(0, 120),
								slug: post.slug,
								views: post.views,
							};
						});

						res.render("home", { posts, topPosts });
					});
			});
	} else {
		Posts.find(
			{ titulo: { $regex: req.query.busca, $options: "i" } },
			(err, posts) => {
				posts = posts.map((post) => {
					return {
						titulo: post.titulo,
						imagem: post.imagem,
						categoria: post.categoria,
						conteudo: post.conteudo,
						descricaoCurta: post.conteudo.substring(0, 120),
						slug: post.slug,
					};
				});

				res.render("busca", { posts, contagem: posts.length });
			}
		);
	}
});

app.get("/:slug", (req, res) => {
	Posts.findOneAndUpdate(
		{ slug: req.params.slug },
		{ $inc: { views: 1 } },
		{ new: true },
		(err, post) => {
			if (post != null) {
				Posts.find({})
					.sort({ views: -1 })
					.limit(5)
					.exec((err, topPosts) => {
						topPosts = topPosts.map((post) => {
							return {
								titulo: post.titulo,
								imagem: post.imagem,
								categoria: post.categoria,
								conteudo: post.conteudo,
								descricaoCurta: post.conteudo.substring(0, 120),
								slug: post.slug,
								views: post.views,
							};
						});

						res.render("single", { post, topPosts });
					});
			} else {
				res.redirect("/");
			}
		}
	);
});

//mockando usuarios pro curso. apos o curso criar um sistema de autenticação integrado com banco de dados.
const users = [
	{
		email: "bola30@gmail.com",
		password: "123456",
	},
];

app.post("/admin/login", (req, res) => {
	loginEmail = req.body.email;
	loginPassword = req.body.password;
	users.map((user) => {
		if (user.email == loginEmail && user.password == loginPassword) {
			req.session.email = loginEmail;
		}
		res.redirect("/admin/login");
	});
});

app.get("/admin/login", (req, res) => {
	if (req.session.email == null) {
		res.render("admin-login");
	} else {
		res.render("admin-panel");
	}
});

app.post("/admin/create-news", (req, res) => {
	//next step, create at the mongo
	console.log(req.body);
	const newsObject = req.body;
	Posts.create({
		titulo: newsObject.titulo_noticia,
		imagem: newsObject.url_imagem,
		categoria: "notícia",
		conteudo: newsObject.noticia,
		slug: newsObject.slug,
		autor: "admin",
		views: 0,
	});
	res.send("cadastrado com sucesso.");
});

app.get("/admin/delete/:id", (req, res) => {
	res.send("Deletando a notícia com ID: " + req.params.id);
});

app.listen(3000, () => {
	console.log("Server Rodando...");
});
