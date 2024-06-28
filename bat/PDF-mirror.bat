@echo off
rem 電子マニュアル表示システム
rem 　PDFミラーリング
set logfile1=%~dp0%~n0_1.log
set logfile2=%~dp0%~n0_2.log
set target1=\\filesv\iso\工程別手順書、帳票原紙、工程表\製造２課\【検証用】炉出口検査PDF
set target2=\\filesv\iso\工程別手順書、帳票原紙、工程表\製造２課\【検証用】炉投入荷姿PDF
echo ログファイル：%logfile%
echo 【検証用】炉出口検査PDF
robocopy %target1% %~dp0\【検証用】炉出口検査PDF /MIR /COPY:DT /xf ~$*.* /LOG:%logfile1%
echo 【検証用】炉投入荷姿PDF
robocopy %target2% %~dp0\【検証用】炉投入荷姿PDF /MIR /COPY:DT /xf ~$*.* /LOG:%logfile2%
