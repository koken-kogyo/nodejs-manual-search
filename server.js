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

// log4jsロガー設定
const log4js = require("log4js");
log4js.configure(log4jsConfig);

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

// 履歴表示
app.get('/history/:pdfcd', (req, res) => {
    const folder = getFolderName(req.params.pdfcd);
    res.render("history.ejs", {req, title: `${folder} 履歴`});
});

// PDFファイル検索 API
app.get("/search/filename/:pdfcd/:hmcd", async function (req, res) {
    const folder = getFolderName(req.params.pdfcd);
    const hmcd = req.params.hmcd;

    // スキャンした入力品番が品目マスタに存在するかチェック（スキャナの調子が悪いため）
    const result = await mysqlHandler.isM0500(hmcd);
    if (result == false && hmcd.length > 7) {
        const logger = log4js.getLogger("e");
        logger.error(`品目マスタに存在しません:[${hmcd}]`);
        res.status(404).end();  // 7桁以上の入力 && 品目マスタに存在しない場合
    } else {
        // 入力品番から検索結果のファイル名一覧を取得
        const files = fs.readdirSync(`./public/pdfs/${folder}`);
        const results = files.filter(fn => fn.indexOf(hmcd)!==-1);

        // フォルダ内検索結果を判定
        if ( results.length == 0 ) {
            res.status(299).end(); // 手順書なし
        } else {
            res.status(200).end(JSON.stringify(results));
        }
    }
});

// 担当者検索 API
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

// 電子マニュアル表示履歴ファイル取得 API
app.get("/getapi/kd8230/:args", async (req, res, next) => {
    try {
        const kd8230 = await mysqlHandler.getKD8230(req.params.args);
        res.status(200).json(kd8230);
    } catch (err) {
        next(err);
    }
});

// 絞り込み用社員の取得 API
app.get("/getapi/selectemp", async (req, res, next) => {
    try {
        const results = await mysqlHandler.getSelectEmployee();
        res.status(200).json(results);
    } catch (err) {
        next(err);
    }
});

// 絞り込み用品番の取得 API
app.get("/getapi/selecthmcd", async (req, res, next) => {
    try {
        const results = await mysqlHandler.getSelectHMCD();
        res.status(200).json(results);
    } catch (err) {
        next(err);
    }
});

// 電子マニュアル表示履歴ファイル登録 API
app.get("/insert/:pdfcd/:empno/:hmcd/:version", async (req, res) => {
    const pdfcd = req.params.pdfcd;
    const empno = req.params.empno;
    const hmcd = req.params.hmcd;
    const version = req.params.version;
    try {
        // console.log(pdfcd + ":" + empno + ":" + hmcd);
        await mysqlHandler.insertKD8230(pdfcd, empno, hmcd, version);
        res.status(200).end();
    } catch (err) {
        res.status(299).end();
    }
});

// 目視検査履歴ファイル更新（作業終了） API
app.get("/finish/:pdfcd/:empno/:hmcd/:wksec", async (req, res) => {
    const pdfcd = req.params.pdfcd;
    const empno = req.params.empno;
    const hmcd = req.params.hmcd;
    const wksec = req.params.wksec;
    try {
        // console.log(pdfcd + ":" + empno + ":" + hmcd);
        await mysqlHandler.updateKD8230(pdfcd, empno, hmcd, wksec);
        res.status(200).end();
    } catch (err) {
        res.status(299).end();
    }
});

// 包括的エラーハンドリング
app.use((err, req, res, next) => {
    console.log("包括的エラーハンドリング")
    console.error(err);
    res.status(500).send(`サーバーの動作が失敗しました．:${err.code} `);
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
