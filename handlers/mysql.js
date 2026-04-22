const mysql = require('mysql2/promise');
const { mysqlConfig } = require('../config.js');
const { decryptPassword } = require("./decrypt-password.js");
const decPasswd = decryptPassword(mysqlConfig.PASSWORD);

// MySQL接続情報
const connectionString = {
      host: mysqlConfig.HOST
    , port: mysqlConfig.PORT
    , database: mysqlConfig.DATABASE
    , user: mysqlConfig.USER
    , password: decPasswd
    , dateStrings: 'date' /*または'true'*/
};
exports.database = connectionString.database;

// コネクションプールの取得
const pool = mysql.createPool(connectionString);
const connect = pool.getConnection()
exports.connect = connect;


// Database から データを取得する
const getDatabase = async (sql, param) => {
    const conn = await pool.getConnection();
    const results = await conn.query(sql, param);
    conn.release();
    return JSON.parse(JSON.stringify(results[0]));;
};

// 社員氏名の取得
exports.getKM0010 = async (empno) => {
    const sql = "select NAME from km0010 where EMPNO=? and ACTIVE='1'"
    return getDatabase(sql, [empno]);
};

// 目視検査履歴ファイル登録
exports.insertKD8230 = async (pdfcd, empno, hmcd, version) => {
    const insert = await getDatabase(
        "insert into kd8230 (PDFCD, EMPNO, HMCD, VERSION, WKSTDT) " + 
        "select ?, ?, ?, ?, now()", [ pdfcd, empno, hmcd, version ]
    );
};

// 目視検査履歴ファイル更新（作業終了）
exports.updateKD8230 = async (pdfcd, empno, hmcd, wksec) => {
    // 同一テーブルのサブクエリUpdateがOracleのようにいかない！
    // select文でラップしてaliasを付ける！
    const update = await getDatabase(
        "update kd8230 set WKEDDT=now(), WKSEC=? where AUTONO=(" + 
            "select AUTONO from ( " + 
                "select AUTONO from kd8230 where PDFCD=? and EMPNO=? and HMCD=? " + 
                "and WKEDDT is null order by AUTONO desc limit 1 " + 
            ") updateInFromClauseError" + 
        ")", [ wksec, pdfcd, empno, hmcd ]
    );
};

// 電子マニュアル表示履歴ファイルデータ取得API
exports.getKD8230 = async (args) => {
    const dateflg = args.split(":")[0];
    const datevalue = args.split(":")[1];
    const pdfcd = args.split(":")[2];
    const tancd = args.split(":")[3];
    const hmcd = args.split(":")[4];
    let param1 = "";
    // 日付条件指定
    if (dateflg == "0") {        // Today
        //Debug param1 = "and WKSTDT between date_add(curdate(),interval -1 day) and date_add(curdate(),interval 1 day) ";
        param1 = "and WKSTDT between curdate() and date_add(curdate(), interval 1 day) ";
    } else if (dateflg == "1") { // 日付指定
        param1 = `and WKSTDT between '${datevalue}' and date_add('${datevalue}', interval 1 day) `;
    } else if (dateflg == "2") { // 期間指定
        const dtF = datevalue.substring(0, 10);
        const dtT = datevalue.slice(-10);
        param1 = `and WKSTDT between '${dtF}' and date_add('${dtT}', interval 1 day) `;
    } else if (dateflg == "3") { // 過去一か月間
        param1 = "and WKSTDT between date_add(curdate(),interval -1 month) and date_add(curdate(),interval 1 day) ";
    } else {
        param1 = "";
    }
    // 入力場所指定
    let param2 = "";
    if (pdfcd != "" && pdfcd != null) {
        param2 = "and a.PDFCD='" + pdfcd + "' ";
    }
    // 担当者条件指定
    let param3 = "";
    if (tancd != "" && tancd != null) {
        param3 = "and a.EMPNO='" + tancd + "' ";
    }
    // 品番条件指定
    let param4 = "";
    if (hmcd != "" && hmcd != null) {
        param4 = "and a.HMCD='" + hmcd + "' ";
    }
    const sql = 
        "select a.*, ifnull(NAME, '-') as OPNAME, " + 
        "date_format(WKSTDT, '%m/%d') as WKSTDT2, " + 
        "date_format(WKSTDT, '%H:%i') as WKSTTM2, " + 
        "ifnull(date_format(WKEDDT, '%H:%i'), '-') as WKEDTM2, " + 
        "ifnull( (date_format(TIMEDIFF(wkeddt,wkstdt), '%H')+0)*60+" + 
                "(date_format(TIMEDIFF(wkeddt,wkstdt), '%i')+0), '-') as WKTIME, " + 
        "if(WKSEC>60, concat(truncate(WKSEC/60,0),'分'), concat(WKSEC,'秒')) as WKSECSTR, " + 
        "ifnull(VERSION, '-') as VERSION2 " + 
        "from kd8230 a left outer join km0010 c on a.EMPNO=c.EMPNO " + 
        "where a.autono = a.autono " + 
        param1 + 
        param2 + 
        param3 + 
        param4 + 
        "order by a.WKSTDT asc";
    return await getDatabase(sql);
};

// 社員氏名の取得 2025.12.14 廃止
exports.getSelectEmployee = async () => {
    const sql = "select distinct a.EMPNO, b.NAME from kd8230 a, km0010 b where a.EMPNO=b.EMPNO order by a.EMPNO"
    return getDatabase(sql, "");
};

// 品番の取得 2025.12.14 廃止
exports.getSelectHMCD = async () => {
    const sql = "select distinct HMCD from kd8230 order by HMCD"
    return getDatabase(sql, "");
};

// 品目マスタ(M0500)存在チェック
exports.isM0500 = async (hmcd) => {
    const m0500 = await getDatabase("select HMCD from m0500 where HMCD=?", [hmcd]);
    return m0500.length == 0 ? false : true;
};
