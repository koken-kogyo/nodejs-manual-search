@echo off
rem dq}jA\¦VXe
rem @PDF~[O
set logfile1=%~dp0%~n0_1.log
set logfile2=%~dp0%~n0_2.log
set logfile3=%~dp0%~n0_3.log

rem ÎÛtH_Ýè
set source1=\\filesv\iso\HöÊèA [´AHö\\»¢QÛ\yØpzFoû¸PDF
set source2=\\filesv\iso\HöÊèA [´AHö\\»¢QÛ\yØpzFü×pPDF

rem ~[OtH_Ýè
set dest1=D:\Node.js\nodejs-manual-search\public\pdfs\yØpzFoû¸PDF
set dest2=D:\Node.js\nodejs-manual-search\public\pdfs\yØpzFü×pPDF
set dest3=D:\Node.js\nodejs-manual-search\public\jpegs\yØpzFü×pPDF

rem ~[O
echo yØpzFoû¸PDF
robocopy %source1% %dest1% /MIR /COPY:DT /xf ~$*.* /LOG:%logfile1%
echo.

echo yØpzFü×pPDF
robocopy %source2% %dest2% /MIR /COPY:DT /xf ~$*.* /LOG:%logfile2%
echo.

pause

rem æg~O
echo PDF2Image
py p_pdf2image.py %dest2% %dest3% >%logfile3%

pause

exit 0
