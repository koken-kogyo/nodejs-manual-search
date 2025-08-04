@echo off
rem “dŽqƒ}ƒjƒ…ƒAƒ‹•\Ž¦ƒVƒXƒeƒ€
rem @PDFƒ~ƒ‰[ƒŠƒ“ƒO
set logfile1=%~dp0%~n0_1.log
set logfile2=%~dp0%~n0_2.log
set logfile3=%~dp0%~n0_3.log

rem ‘ÎÛƒtƒHƒ‹ƒ_Ý’è
set source1=\\filesv\iso\H’ö•ÊŽè‡‘A’ •[Œ´Ž†AH’ö•\\»‘¢‚Q‰Û\yŒŸØ—pz˜FoŒûŒŸ¸PDF
set source2=\\filesv\iso\H’ö•ÊŽè‡‘A’ •[Œ´Ž†AH’ö•\\»‘¢‚Q‰Û\yŒŸØ—pz˜F“Š“ü‰×ŽpPDF

rem ƒ~ƒ‰[ƒŠƒ“ƒOƒtƒHƒ‹ƒ_Ý’è
set dest1=D:\Node.js\nodejs-20-manual-search\public\pdfs\yŒŸØ—pz˜FoŒûŒŸ¸PDF
set dest2=D:\Node.js\nodejs-20-manual-search\public\pdfs\yŒŸØ—pz˜F“Š“ü‰×ŽpPDF
set dest3=D:\Node.js\nodejs-20-manual-search\public\jpegs\yŒŸØ—pz˜F“Š“ü‰×ŽpPDF

rem ƒ~ƒ‰[ƒŠƒ“ƒO
echo yŒŸØ—pz˜FoŒûŒŸ¸PDF
robocopy %source1% %dest1% /MIR /COPY:DT /xf ~$*.* /LOG:%logfile1%
echo.

echo yŒŸØ—pz˜F“Š“ü‰×ŽpPDF
robocopy %source2% %dest2% /MIR /COPY:DT /xf ~$*.* /LOG:%logfile2%
echo.

pause

rem ‰æ‘œƒgƒŠƒ~ƒ“ƒO
echo PDF2Image
py p_pdf2image.py %dest2% %dest3% >%logfile3%

pause

exit 0
