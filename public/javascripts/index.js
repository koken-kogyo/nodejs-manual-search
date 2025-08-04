        // 担当者検索関数
        function getEmpName(e) {
            if (inputEmpnoObj.value != "") {
                const empno = ("00000" + inputEmpnoObj.value).slice(-5);
                const xmlHttpRequest = new XMLHttpRequest();
                xmlHttpRequest.open('GET', `/search/km0010/${empno}`, false); // 第3引数false:同期通信
                xmlHttpRequest.send();
                if (xmlHttpRequest.readyState == 4 && xmlHttpRequest.status == 200 ) {
                    const name = JSON.parse(xmlHttpRequest.responseText);
                    // >8 >16
                    if (name.length > 16) {
                        document.querySelector("#worker").style.fontSize = "0.9em";
                    } else if (name.length > 8) {
                        document.querySelector("#worker").style.fontSize = "1.1em";
                    } else {
                        document.querySelector("#worker").style.fontSize = "1.5em";
                    }
                    document.getElementById("worker").innerText = name;
                    inputHmcdObj.select();
                } else {
                    document.getElementById("worker").innerText = "担当者が見つかりません";
                    document.querySelector("#worker").style.fontSize = "1.1em";
                }
            } else {
                document.getElementById("worker").innerText = "Worker";
            }
        }

        // キーボード入力小文字から大文字変換（廃止！！！⇒機能をsearchHMCDに移動）
        function inputChange(){
            const HMCD = document.getElementById("input-hmcd").value.toUpperCase().replace("%", "");
            //alert(document.getElementById("input-hmcd").value + " -> " + HMCD);
            document.getElementById("input-hmcd").value = HMCD;
        }

        function searchHMCD() {
            // 担当者コードの入力チェック
            if (inputEmpnoObj.value == "" || inputEmpnoObj.value == null) {
                alert("担当者コードを先に入力してください．");
                inputEmpnoObj.select(); 
                return;
            }

            // 終了処理で入力ボックスがクリアされる前に変数に格納
            // 全角半角変換もここでしたい
            let inputHmcd = document.getElementById("input-hmcd").value.toUpperCase().replace("%", "");

            // 15文字以上で偶数文字数の場合、正しい品番に修正
            // スキャナの読み取りをJavascriptが認識するまで遅すぎて上手く行かない（ソースコードがしょぼすぎる為）
            if (inputHmcd.length > 15 && inputHmcd.length % 2 == 0) {
                if (inputHmcd.slice(0, inputHmcd.length / 2) == inputHmcd.slice((inputHmcd.length / 2) * -1)) {
                    inputHmcd = inputHmcd.slice(0, inputHmcd.length / 2);
                }
            }
            
            // 作業中が存在した場合、終了処理を先に行う
            const searchhmcd = document.getElementById("searchhmcd").value;
            if (searchhmcd != "" && searchhmcd != null) {
                Finish(); 
            }

            const title = document.getElementById("menutitle");
            const titlepage = document.getElementById("titlepage");
            const output = document.getElementById("output");
            const checkDispObj = document.getElementById("checkDisp");
            const pdfcd = document.getElementById("pdfcd").value;
            const empno = ("00000" + document.getElementById("input-empno").value).slice(-5);

            const xmlHttpRequest = new XMLHttpRequest();
            xmlHttpRequest.open('GET', `/search/filename/${pdfcd}/${empno}/${inputHmcd}`, false);
            xmlHttpRequest.send();
            if (xmlHttpRequest.readyState == 4 && xmlHttpRequest.status == 200 ) {
                const aryfn = JSON.parse(xmlHttpRequest.responseText);

                // タイトル文字列更新
                title.innerText = "手順書 [ " + aryfn[0] + " ] ";
                document.querySelector("#menutitle").style.left = "calc((100vw / 2) - " + aryfn[0].length / 3 + "em)"

                // ファイル名から品番を抽出
                const hmcd = aryfn[0].split("_")[2].toUpperCase().replace(".PDF", "");
                const ctrlno = aryfn[0].split("_")[0];
                const version = ctrlno.substring(ctrlno.lastIndexOf("V"));

                // 1件Hitの場合、入力品番を上書きする
                if (aryfn.length == 1) {
                    titlepage.innerText = "作業中";
                    document.getElementById("input-hmcd").value = hmcd;
                    inputHmcd = hmcd;

                    // カウントアップタイマー起動
                    startInterval();
                }
                
                // 複数Hitした場合、作業開始ボタン、ページ切替ボタンを表示
                let play = "";
                let next = "";
                if (aryfn.length > 1) {
                    titlepage.innerText = aryfn.length + "件Hit";
                    play = "<a href='javascript:play()'><img class='play' src='/static/images/fa-play-circle.png'></a>";
                    next = "<a href='javascript:next()'><img class='next' src='/static/images/fa-chevron-circle-right.png'></a>";
                }

                // PDF表示
                if (pdfcd == "6077") {
                    const subFolder = "【検証用】炉出口検査PDF";
                    const pdfPath = `/static/pdfs/${subFolder}/`;
                    const pdfName = aryfn[0];
                    const pdfPara = "#view=FitV&toolbar=0&zoom=FitV";
                    output.innerHTML = `<iframe src='${pdfPath}${pdfName}${pdfPara}' width='100%' height='100%' frameborder='0' 
                    style='border:none;'></iframe>${play}${next}`;

                // JPEG表示
                } else if (pdfcd == "6078") {
                    const subFolder = "【検証用】炉投入荷姿PDF";
                    const jpegPath = `/static/jpegs/${subFolder}/`;
                    const jpegName = aryfn[0].toUpperCase().replace("PDF", "jpeg");
                    if (checkDispObj.checked) {
                        output.innerHTML = `<img src='${jpegPath}${jpegName}' width='99%' frameborder='0' style='margin:auto'>>${play}${next}`;
                    } else {
                        output.innerHTML = `<img src='${jpegPath}${jpegName}' width='90%' frameborder='0' style='margin:auto'>>${play}${next}`;
                    }
                } else {
                    alert("プログラム想定異常が発生しました．\nシステム担当者に連絡してください");
                    return;
                }

                // 作業履歴ファイルDB更新
                if (aryfn.length == 1) {
                    xmlHttpRequest.open('GET', `/insert/${pdfcd}/${empno}/${hmcd}/${version}`, false);
                    xmlHttpRequest.send();
                    if (xmlHttpRequest.readyState == 4 && xmlHttpRequest.status == 299 ) {
                        alert(pfdcd + ":" + empno + ":" + hmcd + ":" + version + ":");
                        alert("目視検査履歴ファイルの登録に失敗しました\n\nシステム担当者に連絡した上で\n作業は継続してください．");
                    }
                }

                // 検索状態を保持
                document.getElementById("searchhmcd").value = inputHmcd;
                document.getElementById("converthmcd").value = hmcd;
                document.getElementById("pageno").value = "1";
            } else if (xmlHttpRequest.readyState == 4 && xmlHttpRequest.status == 404 ) {
                // PDF表示
                titlepage.innerText = "";
                const pdfPath = "/static/pdfs/";
                const pdfName = "M0500.pdf";
                output.innerHTML = `<iframe src='${pdfPath}${pdfName}#view=FitV&toolbar=0&zoom=FitV' width='100%' height='100%' frameborder='0' style='border:none;'></iframe>`;
                // 検索状態を保持
                document.getElementById("input-hmcd").value = inputHmcd;
                document.getElementById("searchhmcd").value = inputHmcd;
                document.getElementById("converthmcd").value = "";
                document.getElementById("pageno").value = "";
                inputHmcdObj.select();
            } else {
                const subFolder = (pdfcd == "6077") ? "【検証用】炉出口検査PDF" : "【検証用】炉投入荷姿PDF";
                title.innerText = `手順書 ${subFolder}`;
                titlepage.innerText = "";
                // タイトル文字列更新
                document.querySelector("#menutitle").style.left = "calc((100vw / 2) - 3em)"
                document.getElementById("input-hmcd").value = inputHmcd;
                // カウントアップタイマー起動
                startInterval();
                
                // 手順書PDFなしでも登録 24.09.24
                xmlHttpRequest.open('GET', `/insert/${pdfcd}/${empno}/${inputHmcd}/-`, false);
                xmlHttpRequest.send();
                if (xmlHttpRequest.readyState == 4 && xmlHttpRequest.status == 299 ) {
                    alert(pfdcd + ":" + empno + ":" + inputHmcd + ":");
                    alert("目視検査履歴ファイルの登録に失敗しました\n\nシステム担当者に連絡した上で\n作業は継続してください．");
                }
                // PDF表示
                const pdfPath = "/static/pdfs/";
                const pdfName = "Nothing.pdf";
                output.innerHTML = `<iframe src='${pdfPath}${pdfName}#view=FitV&toolbar=0&zoom=FitV' width='100%' height='100%' frameborder='0' style='border:none;'></iframe>`;
                // 検索状態を保持
                document.getElementById("searchhmcd").value = inputHmcd;
                document.getElementById("converthmcd").value = "";
                document.getElementById("pageno").value = "";
            }
            inputHmcdObj.select();
        }

        let interval_id = null;
        let tick = 0;
        // カウントアップタイマー表示
        function startInterval() {
            interval_id = setInterval(() => {
                let h = 0;
                let m = 0;
                let s = 0;
                if (tick>3600)  h = Math.trunc(tick / 3600);
                if (tick>60)    m = Math.trunc((tick-(3600*h)) / 60);
                                s = tick - (3600*h) - (60*m);
                const result = getTick();
                document.getElementById("pause-restarat-button").innerHTML = 
                    `<font color="RED"><strong>作業中</strong></font><br>${result}`;
                tick++;
            }, 1000);
        }
        // 経過時間を日本語文字列で返却
        function getTick() {
            let h = 0;
            let m = 0;
            let s = 0;
            if (tick>3600)  h = Math.trunc(tick / 3600);
            if (tick>60)    m = Math.trunc((tick-(3600*h)) / 60);
                            s = tick - (3600*h) - (60*m);
            return (h==0?"":h+"時間") + (m==0?"":m+"分") + s + "秒";
        }
        function endInterval() {
            clearInterval(interval_id);
            interval_id = null;
            tick = 0;
        }
        function PauseRestarat() {
            if (interval_id) {
                const result = getTick();
                document.getElementById("pause-restarat-button").innerHTML = 
                    `<font color="RED"><strong>作業中断中</strong></font><br>${result}`;
                // タイマーイベント停止
                clearInterval(interval_id);
                interval_id = null;
                inputHmcdObj.select();
            } else if (tick != 0) {
                const result = getTick();
                document.getElementById("pause-restarat-button").innerHTML = 
                    `<font color="RED"><strong>作業再開</strong></font><br>${result}`;
                // タイマーイベント再開
                startInterval();
                inputHmcdObj.select();
            }
        }
        // 作業開始
        function play() {
            const pdfcd = document.getElementById("pdfcd").value;
            const empno = ("00000" + document.getElementById("input-empno").value).slice(-5);
            const hmcd = document.getElementById("converthmcd").value;

            // 開始状態に設定
            document.getElementById("titlepage").innerText = "作業中";
            document.getElementById("input-hmcd").value = hmcd;
            document.getElementById("searchhmcd").value = hmcd;
            if (document.querySelector(".prev")) { document.querySelector(".prev").style.display = "none"; }
            if (document.querySelector(".play")) { document.querySelector(".play").style.display = "none"; }
            if (document.querySelector(".next")) { document.querySelector(".next").style.display = "none"; }
            searchHMCD();
        }

        // 次ページ
        function next() {
            const searchhmcd = document.getElementById("searchhmcd").value;
            const pageno = Number(document.getElementById("pageno").value) + 1;
            const pdfcd = document.getElementById("pdfcd").value;
            const title = document.getElementById("menutitle");
            const titlepage = document.getElementById("titlepage");
            const output = document.getElementById("output");
            const checkDispObj = document.getElementById("checkDisp");
            
            const xmlHttpRequest = new XMLHttpRequest();
            xmlHttpRequest.open('GET', `/search/filename/${pdfcd}//${searchhmcd}`, false);
            xmlHttpRequest.send();
            if (xmlHttpRequest.readyState == 4 && xmlHttpRequest.status == 200 ) {
                const fns = JSON.parse(xmlHttpRequest.responseText);

                // タイトル文字列更新
                title.innerText = "手順書 [ " + fns[pageno - 1] + " ] ";
                titlepage.innerText = (pageno) + "/" + fns.length + "件";
                document.querySelector("#menutitle").style.left = "calc((100vw / 2) - " + fns[pageno - 1].length / 3 + "em)"

                // ファイル名から品番を抽出
                const hmcd = fns[pageno - 1].split("_")[2].toUpperCase().replace(".PDF", "");

                // 作業開始ボタン、ページ切替ボタンを表示
                let prev = "<a href='javascript:prev()'><img class='prev' src='/static/images/fa-chevron-circle-left.png'></a>";
                let play = "<a href='javascript:play()'><img class='play' src='/static/images/fa-play-circle.png'></a>";
                let next = "";
                if (fns.length == pageno) {
                    next = "";
                } else {
                    next = "<a href='javascript:next()'><img class='next' src='/static/images/fa-chevron-circle-right.png'></a>";
                }

                // PDF表示
                if (pdfcd == "6077") {
                    const subFolder = "【検証用】炉出口検査PDF";
                    const pdfPath = `/static/pdfs/${subFolder}/`;
                    const pdfName = fns[pageno - 1];
                    const pdfPara = "#view=FitV&toolbar=0&zoom=FitV";
                    output.innerHTML = `${prev}<iframe src='${pdfPath}${pdfName}${pdfPara}' width='100%' height='100%' frameborder='0' 
                    style='border:none;'></iframe>${play}${next}`;

                // JPEG表示
                } else if (pdfcd == "6078") {
                    const subFolder = "【検証用】炉投入荷姿PDF";
                    const jpegPath = `/static/jpegs/${subFolder}/`;
                    const jpegName = fns[pageno - 1].toUpperCase().replace("PDF", "jpeg");
                    let marginTop = 20;
                    if (checkDispObj.checked) {
                        output.innerHTML = `${prev}<img src='${jpegPath}${jpegName}' width='99%' frameborder='0' style='margin-top:${marginTop}px'>${play}${next}`;
                    } else {
                        output.innerHTML = `${prev}<img src='${jpegPath}${jpegName}' width='90%' frameborder='0' style='margin-top:${marginTop}px'>${play}${next}`;
                    }

                } else {
                    alert("プログラム想定異常が発生しました．\nシステム担当者に連絡してください");
                    return;
                }

                // 検索状態を保持
                document.getElementById("searchhmcd").value = searchhmcd;
                document.getElementById("converthmcd").value = hmcd;
                document.getElementById("pageno").value = pageno;
            } else {
                const subFolder = (pdfcd == "6077") ? "【検証用】炉出口検査PDF" : "【検証用】炉投入荷姿PDF";
                title.innerText = `手順書 ${subFolder}`;
                titlepage.innerText = "";
                document.querySelector("#menutitle").style.left = "calc((100vw / 2) - 3em)"
                // PDF表示
                const pdfPath = "/static/pdfs/";
                const pdfName = "Nothing.pdf";
                output.innerHTML = `<iframe src='${pdfPath}${pdfName}#view=FitV&toolbar=0&zoom=FitV' width='100%' height='100%' frameborder='0' style='border:none;'></iframe>`;
                document.getElementById("searchhmcd").value = "";
                document.getElementById("converthmcd").value = "";
                document.getElementById("pageno").value = "";
            }
            inputHmcdObj.select();
        }

        // 前ページ
        function prev() {
            const searchhmcd = document.getElementById("searchhmcd").value;
            const pageno = Number(document.getElementById("pageno").value) - 1;
            const pdfcd = document.getElementById("pdfcd").value;
            const title = document.getElementById("menutitle");
            const titlepage = document.getElementById("titlepage");
            const output = document.getElementById("output");
            const checkDispObj = document.getElementById("checkDisp");
            
            const xmlHttpRequest = new XMLHttpRequest();
            xmlHttpRequest.open('GET', `/search/filename/${pdfcd}//${searchhmcd}`, false);
            xmlHttpRequest.send();
            if (xmlHttpRequest.readyState == 4 && xmlHttpRequest.status == 200 ) {
                const fns = JSON.parse(xmlHttpRequest.responseText);

                // タイトル文字列更新
                title.innerText = "手順書 [ " + fns[pageno - 1] + " ] ";
                titlepage.innerText = (pageno) + "/" + fns.length + "件";
                document.querySelector("#menutitle").style.left = "calc((100vw / 2) - " + fns[pageno - 1].length / 3 + "em)"

                // ファイル名から品番を抽出
                const hmcd = fns[pageno - 1].split("_")[2].toUpperCase().replace(".PDF", "");

                // 作業開始ボタン、ページ切替ボタンを表示
                let prev = "";
                if (pageno == 1) {
                    prev = "";
                } else {
                    prev = "<a href='javascript:prev()'><img class='prev' src='/static/images/fa-chevron-circle-left.png'></a>";
                }
                let play = "<a href='javascript:play()'><img class='play' src='/static/images/fa-play-circle.png'></a>";
                let next = "<a href='javascript:next()'><img class='next' src='/static/images/fa-chevron-circle-right.png'></a>";
                
                // PDF表示
                if (pdfcd == "6077") {
                    const subFolder = "【検証用】炉出口検査PDF";
                    const pdfPath = `/static/pdfs/${subFolder}/`;
                    const pdfName = fns[pageno - 1];
                    const pdfPara = "#view=FitV&toolbar=0&zoom=FitV";
                    output.innerHTML = `${prev}<iframe src='${pdfPath}${pdfName}${pdfPara}' width='100%' height='100%' frameborder='0' 
                    style='border:none;'></iframe>${play}${next}`;

                // JPEG表示
                } else if (pdfcd == "6078") {
                    const subFolder = "【検証用】炉投入荷姿PDF";
                    const jpegPath = `/static/jpegs/${subFolder}/`;
                    const jpegName = fns[pageno - 1].toUpperCase().replace("PDF", "jpeg");
                    let marginTop = 20;
                    if (checkDispObj.checked) {
                        output.innerHTML = `${prev}<img src='${jpegPath}${jpegName}' width='99%' frameborder='0' style='margin-top:${marginTop}px'>${play}${next}`;
                    } else {
                        output.innerHTML = `${prev}<img src='${jpegPath}${jpegName}' width='90%' frameborder='0' style='margin-top:${marginTop}px'>${play}${next}`;
                    }

                } else {
                    alert("プログラム想定異常が発生しました．\nシステム担当者に連絡してください");
                    return;
                }

                // 検索状態を保持
                document.getElementById("searchhmcd").value = searchhmcd;
                document.getElementById("converthmcd").value = hmcd;
                document.getElementById("pageno").value = pageno;
            } else {
                const subFolder = (pdfcd == "6077") ? "【検証用】炉出口検査PDF" : "【検証用】炉投入荷姿PDF";
                title.innerText = `手順書 ${subFolder}`;
                document.querySelector("#menutitle").style.left = "calc((100vw / 2) - 3em)"
                // PDF表示
                const pdfPath = "/static/pdfs/";
                const pdfName = "Nothing.pdf";
                output.innerHTML = `<iframe src='${pdfPath}${pdfName}#view=FitV&toolbar=0&zoom=FitV' width='100%' height='100%' frameborder='0' style='border:none;'></iframe>`;
                document.getElementById("searchhmcd").value = "";
                document.getElementById("converthmcd").value = "";
                document.getElementById("pageno").value = "";
            }
            inputHmcdObj.select();
        }

        // 作業終了
        function Finish() {
            const pdfcd = document.getElementById("pdfcd").value;
            const empno = ("00000" + document.getElementById("input-empno").value).slice(-5);
            const searchhmcd = document.getElementById("searchhmcd").value;
            const hmcd = document.getElementById("input-hmcd").value;
            const wksec = tick;
            // タイマー解除
            endInterval();
            if (searchhmcd == "" || searchhmcd == null) { location.href = "/"; } // TopPageに戻る
            /*
            if (searchhmcd != document.getElementById("input-hmcd").value) {
                let msg = `表示中の手順書と製品コードが相違してます！ (Product code is Deffer)\n`;
                msg = msg + `[ ${searchhmcd} ]を 作業終了にします．よろしいですか？`;
                if (!window.confirm(msg)) { return; }
            }
            */
            // (1) XMLHttpRequestオブジェクトを作成
            const xmlHttpRequest = new XMLHttpRequest();
            // (2) 作業履歴ファイルDB更新
            xmlHttpRequest.open('GET', `/finish/${pdfcd}/${empno}/${searchhmcd}/${wksec}`, false);
            xmlHttpRequest.send();
            // (3) 同期処理終了後、ステータス判定
            if (xmlHttpRequest.readyState == 4 && xmlHttpRequest.status == 299 ) {
                alert("目視検査履歴ファイルの更新に失敗しました\n\nシステム担当者に連絡した上で\n作業は継続してください．");
            }
            const subFolder = (pdfcd == "6077") ? "【検証用】炉出口検査PDF" : "【検証用】炉投入荷姿PDF";
            document.getElementById("menutitle").innerText = `手順書 ${subFolder}`;
            document.querySelector("#menutitle").style.left = "calc((100vw / 2) - 3em)"
            document.getElementById("titlepage").innerText = "";
            document.getElementById("input-hmcd").value = "";
            document.getElementById("searchhmcd").value = "";
            document.getElementById("converthmcd").value = "";
            document.getElementById("pageno").value = "";
            const output = document.getElementById("output");
            const pdfPath = "/static/pdfs/";
            const pdfName = "Initialize.pdf";
            output.innerHTML = `<iframe src='${pdfPath}${pdfName}#view=FitV&toolbar=0&zoom=FitV' width='100%' height='100%' frameborder='0' style='border:none;'></iframe>`;
            inputHmcdObj.select();
        }

        // 作業者変更
        function WorkerChange() {
            const searchhmcd = document.getElementById("searchhmcd").value;
            if (searchhmcd != "" && searchhmcd != null) { Finish(); } // 作業中の場合、終了処理
            const pdfcd = document.getElementById("pdfcd").value;
            location.href = `/${pdfcd}`;
        }

        // 履歴表示
        function ViewHistory() {
            inputHmcdObj.select();
            const pdfcd = document.getElementById("pdfcd").value;
            window.open(`/history/${pdfcd}`);
        }
        
        // 本日の作業終了
        function ManualExit() {
            Finish();
            location.href = "/";
        }
