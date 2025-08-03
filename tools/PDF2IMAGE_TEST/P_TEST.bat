@echo off
rem ミラーリングフォルダ設定
set dest2=D:\Node.js\nodejs-20-manual-search\public\pdfs\【検証用】炉投入荷姿PDF
set dest3=D:\Node.js\nodejs-20-manual-search\public\jpegs\【検証用】炉投入荷姿PDF

rem 画像トリミング
echo PDF2Image 外周切り出しテスト
py p_test_pdf2image.py . . 

pause

exit 0
