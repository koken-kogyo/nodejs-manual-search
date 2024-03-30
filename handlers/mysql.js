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
exports.insertKD8230 = async (odcd, empno, hmcd) => {
    const insert = await getDatabase(
        "insert into kd8230 (ODCD, EMPNO, HMCD, WKSTDT) " + 
        "select ?, ?, ?, now()", [ odcd, empno, hmcd ]
    );
};

// 目視検査履歴ファイル更新（作業終了）
exports.updateKD8230 = async (odcd, empno, hmcd) => {
    const update = await getDatabase(
        "update kd8230 set WKEDDT=now() where ODCD=? and EMPNO=? and HMCD=? and WKEDDT is null"
        , [ odcd, empno, hmcd ]
    );
};
