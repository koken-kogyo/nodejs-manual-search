// 検索用フォルダ名称を取得しエンコーディングし返却
const getFolderName = (pdfcd) => {
    let folder = ""
    if (pdfcd == "6077") {
        folder = "【検証用】炉出口検査PDF";
    } else if (pdfcd == "6078") {
        folder = "【検証用】炉投入荷姿PDF";
    } else {
        folder = "【検証用】炉出口検査PDF";
    }
    return folder;
};
exports.getFolderName = getFolderName;

