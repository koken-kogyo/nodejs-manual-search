# coding: utf-8

"""指定フォルダ内のPDFファイルを画像変換し、線の外周が最も大きな輪郭を切りだしつつ、上部の1行を抜いて保存
"""

import os
import sys
import cv2                                  # OpenCV 画像処理
import numpy as np
from pdf2image import convert_from_path     # PDF -> Image ( ※Poppler依存 )
from pathlib import Path
from PIL import Image                       # 日本語名でファイル保存する場合に使用

# poppler/binを環境変数PATHに追加する
poppler_dir = Path(__file__).parent.absolute() / "pythonPopplerLibrary/bin"
os.environ["PATH"] += os.pathsep + str(poppler_dir)

# PDFファイルのパス
# PDF_ROOT_PATH  = '/Node.js/nodejs-20-manual-search/public/pdfs/【検証用】炉投入荷姿PDF'
# JPEG_ROOT_PATH = '/Node.js/nodejs-20-manual-search/public/jpegs/【検証用】炉投入荷姿PDF'

# ファイル毎の処理を記述
def process(path):
    # ターゲットファイルをコンソール出力
    print(Path(path).stem, end="　") # endを記述すると改行しない
    print("")

    try:
        # 1. PDFを画像に変換（150dpi）
        images = convert_from_path(str(path), 150)
        if not images:
            print("PDFのページを読み込めませんでした。")
            return
        image = images[0]
        # Pillow画像をOpenCVが扱えるNumPy配列に変換
        img_np = np.array(image)
        # BGR形式に変換（OpenCVはデフォルトでBGRを使用）
        img_bgr = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)



        # 2. 画像処理で線の外周を検出
        
        # グレースケールに変換
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

        # 線の検出 スレッショルド
        # 白い背景に黒い線が想定される場合、THRESH_BINARY_INVを使用します。
        _, thresh = cv2.threshold(gray, 200, 255, cv2.THRESH_BINARY_INV)

        # 輪郭と階層情報を取得 ファインド・カウンターズ
        contours, _         = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if not contours:
            print("輪郭が見つかりませんでした。")
            return
        # 最も大きな輪郭を検出
        # 線の外周が最も大きな輪郭として検出されると仮定します。
        largest_contour = max(contours, key=cv2.contourArea)

        # 輪郭の外接矩形を取得
        x, y, w, h = cv2.boundingRect(largest_contour)



        # 3. 切り出す範囲の特定

        # 水平線の検出 (Hough変換) ホフ・ラインズ
        # 線の最小長さやギャップを調整することで、検出精度を上げることができます。
        lines = cv2.HoughLinesP(
            thresh, 1, np.pi / 180, threshold=100, minLineLength=w*0.9, maxLineGap=10
        )
        if lines is None or len(lines) < 2:
            print("水平線が2本以上検出されませんでした。")
            return

        horizontal_lines = []
        for line in lines:
            x1, y1, x2, y2 = line[0]
            # 最も大きな輪郭の上線付近の水平線は除外
            if y1 > y + 10:
                horizontal_lines.append(y1)
        
        if len(horizontal_lines) < 2:
            print("有効な水平線が2本以上見つかりませんでした。")
            return

        # Y座標でソートして、一番上の線を見つける
        horizontal_lines.sort()
        crop_top_y = horizontal_lines[0]



        # 4. 切り出しと保存
        # 切り出したBGRをRBGに変換して日本語を含むJPEGファイル名として上書き保存

        # 外周輪郭アスペクト比が1.45未満の場合は1.45になるような追加の余白を設定
        aspectpad = 0
        if float(w / h) < 1.45:
            print(f"{w} / {h} = {float(w / h)}")
            aspectpad = int(((h * 1.45) - w) / 2)

        # 切り出す領域に少し余白を追加
        padding = 2
        x_pad = max(0, x - padding - aspectpad)
        y_pad = crop_top_y - padding
        w_pad = min(img_bgr.shape[1] - x_pad, w + 2 * (padding + aspectpad))
        h_pad = min(img_bgr.shape[0] - y_pad, h - (crop_top_y - y) + 2 * padding)

        # 切り出し
        cropped_image = img_bgr[y_pad:y_pad+h_pad, x_pad:x_pad+w_pad]

        # BGRからRGBに変換
        image_rgb = cv2.cvtColor(cropped_image, cv2.COLOR_BGR2RGB)

        # 切り出した画像をJPEGとして保存
        # cv2.imwrite(jpeg_path, cropped_image, [cv2.IMWRITE_JPEG_QUALITY, 95])
        # Pillowを使って日本語を含むフォルダ名ファイル名として保存(opencvが日本語非対応)
        jpeg_path = sys.argv[2] + "/" + Path(path).stem + ".jpeg"
        image_pil = Image.fromarray(image_rgb)
        image_pil.save(jpeg_path)  # 例: "保存先のファイル名_日本語.png"


    except Exception as e:
        print(f"エラーが発生しました: {e}")


# ROOT_PATH の 再帰処理
def recursive_file_check(path):
    if os.path.isdir(path):
        files = os.listdir(path)
        for file in files:
            recursive_file_check(os.path.join(path, file))
    else:
        if path.endswith('.pdf'):

            jpeg_path = sys.argv[2] + "/" + Path(path).stem + ".jpeg"

            # 新規作成の場合
            if not os.path.exists(jpeg_path):
                process(path)

            # 既存の場合
            else:
                # ファイルの更新日付を取得
                source_mtime = os.path.getmtime(path)
                destination_mtime = os.path.getmtime(jpeg_path)
                # PDFが更新されている場合のみ処理対象
                if source_mtime > destination_mtime:
                    process(path)

                # Debug用 全てのファイルを対象に検証したい場合に使用する
                #else:
                    #process(path)


# メイン処理
if __name__ == "__main__":

    if len(sys.argv) == 3:
        recursive_file_check(sys.argv[1])
        exit(0)
    else:
        # Debug用 ソースコードから実行したい場合に使用する
        # PDF_ROOT_PATH  = 'D:/Node.js/nodejs-20-manual-search/public/pdfs/【検証用】炉投入荷姿PDF'
        # JPEG_ROOT_PATH = 'D:/Node.js/nodejs-20-manual-search/public/jpegs/【検証用】炉投入荷姿PDF'
        # sys.argv = ["p_pdf2image.py", f"{PDF_ROOT_PATH}", f"{JPEG_ROOT_PATH}"]
        # recursive_file_check(sys.argv[1])
        print("引数にターゲットフォルダと、変換フォルダを指定してください．")
        exit(1)

