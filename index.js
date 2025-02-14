const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

const Posts = require("./Posts.js");

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
		res.render("busca", {});
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

app.listen(3000, () => {
	console.log("Server Rodando...");
});
