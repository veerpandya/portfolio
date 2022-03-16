const express = require("express");
const mongoose = require("mongoose");
const Article = require("./models/article");
const User = require("./models/user");
const dbConfig = require("./config/db.config");
const articleRouter = require("./routes/articles");
const authRouter = require("./routes/auth");
const methodOverride = require("method-override");
const cors = require("cors");
const cookieSession = require("cookie-session");
require("dotenv").config();
const app = express();
app.use(express.static(__dirname));

mongoose
    .connect(
        process.env.MONGODB_URI ||
            `mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    )
    .catch((err) => {
        console.error("Connection error", err);
        process.exit();
    });

var corsOptions = {
    origin: "http://localhost:3001",
};
app.use(cors(corsOptions));

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(
    cookieSession({
        name: "portfolio-session",
        secret: "COOKIE_SECRET", // should use as secret environment variable
        httpOnly: true,
    })
);
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
    next();
});
app.get("/", async (req, res) => {
    const articles = await Article.find().sort({ createdAt: "desc" });
    res.render("articles/index", { articles: articles });
});

app.use("/articles", articleRouter);
app.use("/auth", authRouter);

const port = process.env.PORT || 3000;

app.listen(port);
