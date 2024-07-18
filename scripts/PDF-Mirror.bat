@echo off
rem �d�q�}�j���A���\���V�X�e��
rem �@PDF�~���[�����O
set logfile1=%~dp0%~n0_1.log
set logfile2=%~dp0%~n0_2.log
set logfile3=%~dp0%~n0_3.log

rem �Ώۃt�H���_�ݒ�
set source1=\\filesv\iso\�H���ʎ菇���A���[�����A�H���\\�����Q��\�y���ؗp�z�F�o������PDF
set source2=\\filesv\iso\�H���ʎ菇���A���[�����A�H���\\�����Q��\�y���ؗp�z�F�����׎pPDF

rem �~���[�����O�t�H���_�ݒ�
set dest1=D:\Node.js\nodejs-manual-search\public\pdfs\�y���ؗp�z�F�o������PDF
set dest2=D:\Node.js\nodejs-manual-search\public\pdfs\�y���ؗp�z�F�����׎pPDF
set dest3=D:\Node.js\nodejs-manual-search\public\jpegs\�y���ؗp�z�F�����׎pPDF

rem �~���[�����O
echo �y���ؗp�z�F�o������PDF
robocopy %source1% %dest1% /MIR /COPY:DT /xf ~$*.* /LOG:%logfile1%
echo.

echo �y���ؗp�z�F�����׎pPDF
robocopy %source2% %dest2% /MIR /COPY:DT /xf ~$*.* /LOG:%logfile2%
echo.

pause

rem �摜�g���~���O
echo PDF2Image
py p_pdf2image.py %dest2% %dest3% >%logfile3%

pause

exit 0
