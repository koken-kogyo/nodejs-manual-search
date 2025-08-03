@echo off
rem ƒ~ƒ‰[ƒŠƒ“ƒOƒtƒHƒ‹ƒ_Ý’è
set dest2=D:\Node.js\nodejs-20-manual-search\public\pdfs\yŒŸØ—pz˜F“Š“ü‰×ŽpPDF
set dest3=D:\Node.js\nodejs-20-manual-search\public\jpegs\yŒŸØ—pz˜F“Š“ü‰×ŽpPDF

rem ‰æ‘œƒgƒŠƒ~ƒ“ƒO
echo PDF2Image
rem py p_pdf2image.py %dest2% %dest3% >%logfile3%
py p_pdf2image.py %dest2% %dest3% 

pause

exit 0
