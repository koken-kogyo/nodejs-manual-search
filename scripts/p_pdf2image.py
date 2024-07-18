# coding: utf-8

"""指定フォルダ内のPDFファイルを画像に変換し、さらに指定されたサイズに切りだす
"""

import os
import sys
from pdf2image import convert_from_path
from pathlib import Path
from PIL import Image

# poppler/binを環境変数PATHに追加する
poppler_dir = Path(__file__).parent.absolute() / "pythonPopplerLibrary/bin"
os.environ["PATH"] += os.pathsep + str(poppler_dir)

# PDFファイルのパス
# PDF_ROOT_PATH  = '/Node.js/nodejs-manual-search/public/pdfs/【検証用】炉投入荷姿PDF'
# JPEG_ROOT_PATH = '/Node.js/nodejs-manual-search/public/jpegs/【検証用】炉投入荷姿PDF'

# ファイル毎の処理を記述
def process(path):
    # ターゲットファイルをコンソール出力
    print(Path(path).stem, end="　")

    # PDF -> Image に変換（150dpi）
    pages = convert_from_path(str(path), 150)

    # 1ページ目だけを処理対象
    for i, page in enumerate(pages):
        if i == 0:

            # 変換したオブジェクトをJPEGで保存
            jpeg_path = sys.argv[2] + "/" + Path(path).stem + ".jpeg"
            page.save(jpeg_path, "JPEG")

            # 保存したJPEGを開く
            img = Image.open(jpeg_path)

            # オリジナルサイズ格納
            width_orig, height_orig = img.size
            print('') # ' 幅：', width_orig, ' 高さ：', height_orig)

            # 切り出しサイズの設定
            left = 50
            right = width_orig - 50

            if height_orig >= 900:
                top = 150 # 24.07.18 mod y.w 230
                bottom = 1150

            elif height_orig == 840:
                top = 110 # 24.07.18 mod y.w 190
                bottom = 1050

            else:
                top = 0
                bottom = height_orig

            area = (left, top, right, bottom)

            # 切り出したJPEGファイルを上書き保存
            cropped_img = img.crop(area)
            cropped_img.save(jpeg_path)


# ROOT_PATH の 再帰処理
def recursive_file_check(path):
    if os.path.isdir(path):
        files = os.listdir(path)
        for file in files:
            recursive_file_check(os.path.join(path, file))
    else:
        if path.endswith('.pdf') or path.endswith('.xlsx'):
            process(path)

# メイン処理
if __name__ == "__main__":

    if len(sys.argv) == 3:
        recursive_file_check(sys.argv[1])
        exit(0)
    else:
        print("引数にターゲットフォルダと、変換フォルダを指定してください．")
        exit(1)

