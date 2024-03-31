// Expressインスタンスを生成
const express = require("express");
const app = express();

const favicon = require("serve-favicon");
const path = require("path");
const fs = require("fs");

const https = require("https");
const options = {
  key:  fs.readFileSync("./servercert/server.key"),
  cert: fs.readFileSync("./servercert/server.crt")
};
const server = https.createServer(options,app);

// User定義
const { PORT, log4jsConfig } = require("./config.js");
const { getFolderName } = require("./handlers/server.js");
const mysqlHandler = require("./handlers/mysql.js");

// テンプレートエンジンの設定
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use("/static", express.static("./public"));
app.use(favicon(`${__dirname}/public/images/favicon.ico`));

// Top Page
app.get( "/", (req, res) => res.redirect(`https://${req.hostname}/`));

// 初期表示
app.get('/:pdfcd', (req, res) => {
    const folder = getFolderName(req.params.pdfcd);
    res.render("index.ejs", {req, title: `手順書 ${folder}`});
});

// 品番検索
app.get("/search/filename/:pdfcd/:hmcd", (req, res) => {
    const folder = getFolderName(req.params.pdfcd);
    const hmcd = req.params.hmcd;
    const files = fs.readdirSync(`./public/pdfs/${folder}`);

    // ここで入力品番からファイル名を特定
    const results = files.filter(fn => fn.indexOf(hmcd)!==-1);

    // const fn = files[no];
    if ( results.length == 0 ) {
        res.status(299).end();
    } else {
        res.status(200).end(JSON.stringify(results));
    }
});

// 担当者検索
app.get("/search/km0010/:empno", async (req, res) => {
    const empno = req.params.empno;
    try {
        const km0010 = await mysqlHandler.getKM0010(empno);
        if (km0010.length == 0) {
            res.status(299).end();
        } else {
            res.status(200).end(JSON.stringify(km0010[0].NAME));
        }
    } catch (err) {
        next(err);
    }
});

// 目視検査履歴ファイル登録
app.get("/insert/:odcd/:empno/:hmcd", async (req, res) => {
    const odcd = req.params.odcd;
    const empno = req.params.empno;
    const hmcd = req.params.hmcd;
    try {
        // console.log(odcd + ":" + empno + ":" + hmcd);
        await mysqlHandler.insertKD8230(odcd, empno, hmcd);
        res.status(200).end();
    } catch (err) {
        res.status(299).end();
    }
});

// 目視検査履歴ファイル更新（作業終了）
app.get("/update/:odcd/:empno/:hmcd", async (req, res) => {
    const odcd = req.params.odcd;
    const empno = req.params.empno;
    const hmcd = req.params.hmcd;
    try {
        // console.log(odcd + ":" + empno + ":" + hmcd);
        await mysqlHandler.updateKD8230(odcd, empno, hmcd);
        res.status(200).end();
    } catch (err) {
        res.status(299).end();
    }
});

// データベース接続 確証後にサーバーを起動
mysqlHandler.connect
.then(() => {
    console.log(`MySQL Database [${mysqlHandler.database}] Connected!`);
    server.listen(PORT, () => {console.log(`Koken Manuals Search listen on Port:${PORT}`)});
}).catch((err) => {
    console.log("MySQL Database Connection Error!");
    console.log(err);
});
