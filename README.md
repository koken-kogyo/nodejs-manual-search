# 電子マニュアル表示システム  
- [KMD008JW] 20-manual-search  

## 概要  
- 品番入力された手順書PDFを表示  
- サブシステム毎に用意されたフォルダ内のPDFを検索  

## 開発環境  
- Node.js v18.12.1  
- MySQL 8.0.32  
- nvm-windows 1.1.10  

## npmパッケージ
- ejs@3.1.9  
- express@4.18.3  
- mysql2@3.9.3  
- serve-favicon@2.5.0  

## メンバー  
- y.watanabe  

## プロジェクト構成  
~~~
./
│  .gitignore                                  # ソース管理除外対象
│  config.js                                   # webアプリケーション設定ファイル (git管理外)
│  package.json                                # パッケージ管理ファイル
│  README.md                                   # このファイル
│  server.js                                   # メインとなるサーバー起動ファイル
│  
├─ handler                                    # ☆サーバー側で使用するハンドラー群
│          mysql.js                            # MySQL関連のハンドラー
│  
├─ public                                     # ☆クライアントに公開するモジュール群
│  ├─ css
│  │      style-basic.css                     # 共通で使用するスタイルシート
│  │      style-index.css                     # メインのスタイルシート
│  │
│  ├─ imsges                                 # クライアントに提供するファイル群
│  │
│  └─ pdfs                                   # クライアントに提供する電子マニュアル群
│  
├─ settingfiles                               # 設定ファイルのバックアップ用フォルダ・・・ (未使用)
│  
├─ views                                      # ☆EJSテンプレートエンジン群
│          _footer.ejs                         # フッター
│          _header.ejs                         # ヘッダー
│          history.ejs                         # 表示履歴表示画面
│          index.ejs                           # TopPage
│      
└─ specification
        [KMD008JW] xxx 機能仕様書_Ver.1.0.0.0.xlsx
        
~~~

## データベース  

| Table    | Name                      |  
| :------: | :------------------------ |  
| kd8230   | 目視検査履歴ファイル      |  

## 設定ファイル [config.js(git管理外)]  

- PORT番号  
- データベース接続設定  
- log4js設定  
- メール送信設定  

## アセンブリ情報  

- 著作権： © 2023 koken-kogyo CO,LTD.

