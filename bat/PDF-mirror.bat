@echo off
rem dq}jA\¦VXe
rem @PDF~[O
set logfile1=%~dp0%~n0_1.log
set logfile2=%~dp0%~n0_2.log
set target1=\\filesv\iso\HöÊèA [´AHö\\»¢QÛ\yØpzFoû¸PDF
set target2=\\filesv\iso\HöÊèA [´AHö\\»¢QÛ\yØpzFü×pPDF
echo Ot@CF%logfile%
echo yØpzFoû¸PDF
robocopy %target1% %~dp0\yØpzFoû¸PDF /MIR /COPY:DT /xf ~$*.* /LOG:%logfile1%
echo yØpzFü×pPDF
robocopy %target2% %~dp0\yØpzFü×pPDF /MIR /COPY:DT /xf ~$*.* /LOG:%logfile2%
