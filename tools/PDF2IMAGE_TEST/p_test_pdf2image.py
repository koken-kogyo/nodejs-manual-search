import cv2
import numpy as np
from pdf2image import convert_from_path

def crop_and_save_pdf_content(pdf_path, output_jpeg_path):
    """
    PDFを画像に変換し、線の外周を検出して切り出し、JPEGとして保存する関数

    Args:
        pdf_path (str): 入力PDFファイルのパス
        output_jpeg_path (str): 出力JPEGファイルのパス
    """
    try:
        # 1. PDFを画像に変換

        # PDFの1ページ目を取得します。dpiを高くすることで、より高解像度の画像が得られます。
        images = convert_from_path(pdf_path, dpi=150)
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

        # 切り出す領域に少し余白を追加
        padding = 2
        x_pad = max(0, x - padding)
        y_pad = crop_top_y - padding
        w_pad = min(img_bgr.shape[1] - x_pad, w + 2 * padding)
        h_pad = min(img_bgr.shape[0] - y_pad, h - (crop_top_y - y) + 2 * padding)

        cropped_image = img_bgr[y_pad:y_pad+h_pad, x_pad:x_pad+w_pad]

        # 切り出した画像をJPEGとして保存
        cv2.imwrite(output_jpeg_path, cropped_image, [cv2.IMWRITE_JPEG_QUALITY, 95])
        
        print(f"画像を '{output_jpeg_path}' に保存しました。")

    except Exception as e:
        print(f"エラーが発生しました: {e}")

# 実行例
if __name__ == "__main__":
    # 処理したいPDFファイルのパスを指定
    # このファイルはスクリプトと同じディレクトリにあるか、フルパスで指定してください。
    input_pdf_file = "P_TEST.pdf"
    
    # 出力するJPEGファイルのパスを指定
    output_jpeg_file = "P_TEST.jpg"
    
    # 関数を実行
    crop_and_save_pdf_content(input_pdf_file, output_jpeg_file)
