const mysql = require('mysql2/promise');
const { mysqlConfig } = require('../config.js');

// MySQL接続情報
const connectionString = {
      host: mysqlConfig.HOST
    , port: mysqlConfig.PORT
    , database: mysqlConfig.DATABASE
    , user: mysqlConfig.USER
    , password: mysqlConfig.PASSWORD
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
exports.insertKD8230 = async (pdfcd, empno, hmcd) => {
    const insert = await getDatabase(
        "insert into kd8230 (PDFCD, EMPNO, HMCD, WKSTDT) " + 
        "select ?, ?, ?, now()", [ pdfcd, empno, hmcd ]
    );
};

// 目視検査履歴ファイル更新（作業終了）
exports.updateKD8230 = async (pdfcd, empno, hmcd) => {
    const update = await getDatabase(
        "update kd8230 set WKEDDT=now() where PDFCD=? and EMPNO=? and HMCD=? and WKEDDT is null"
        , [ pdfcd, empno, hmcd ]
    );
};

// 電子マニュアル表示履歴ファイルデータ取得API
exports.getKD8230 = async (args) => {
    const pdfcd = args.split(":")[0];
    const flg = args.split(":")[1];
    const tancd = args.split(":")[2];
    const hmcd = args.split(":")[3];
    let param1 = "";
    if (flg == "T") {   // Today
        param1 = "and WKSTDT between curdate() and date_add(curdate(),interval 1 day) ";
        param1 = "and WKSTDT between date_add(curdate(),interval -1 day) and date_add(curdate(),interval 1 day) ";
    } else {            // Month
        param1 = "and WKSTDT between date_add(curdate(),interval -1 month) and date_add(curdate(),interval 1 day) ";
    }
    let param2 = "";
    if (tancd != "" && tancd != null) {
        param2 = "and a.EMPNO='" + tancd + "' ";
    }
    let param3 = "";
    if (hmcd != "" && hmcd != null) {
        param3 = "and a.HMCD='" + hmcd + "' ";
    }
    const kd8230 = await getDatabase(
        "select a.*, ifnull(NAME, '-') as OPNAME, " + 
        "date_format(WKSTDT, '%m/%d') as WKSTDT2, " + 
        "date_format(WKSTDT, '%H:%i') as WKSTTM2, " + 
        "ifnull(date_format(WKEDDT, '%H:%i'), '-') as WKEDTM2, " + 
        "ifnull( (date_format(TIMEDIFF(wkeddt,wkstdt), '%H')+0)*60+" + 
                "(date_format(TIMEDIFF(wkeddt,wkstdt), '%i')+0), '-') as WKTIME " + 
        "from kd8230 a left outer join km0010 c on a.EMPNO=c.EMPNO " +
        "where a.PDFCD=? " + 
        param1 + 
        param2 + 
        param3 + 
        "order by a.AUTONO asc"
        , [pdfcd]
    );
    return kd8230;
};

// 社員氏名の取得
exports.getSelectEmployee = async () => {
    const sql = "select distinct a.EMPNO, b.NAME from kd8230 a, km0010 b where a.EMPNO=b.EMPNO order by a.EMPNO"
    return getDatabase(sql, "");
};

// 社員氏名の取得
exports.getSelectHMCD = async () => {
    const sql = "select distinct HMCD from kd8230 order by HMCD"
    return getDatabase(sql, "");
};
