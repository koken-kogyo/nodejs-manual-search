@echo off
rem �d�q�}�j���A���\���V�X�e��
rem �@PDF�~���[�����O
set logfile1=%~dp0%~n0_1.log
set logfile2=%~dp0%~n0_2.log
set target1=\\filesv\iso\�H���ʎ菇���A���[�����A�H���\\�����Q��\�y���ؗp�z�F�o������PDF
set target2=\\filesv\iso\�H���ʎ菇���A���[�����A�H���\\�����Q��\�y���ؗp�z�F�����׎pPDF
echo ���O�t�@�C���F%logfile%
echo �y���ؗp�z�F�o������PDF
robocopy %target1% %~dp0\�y���ؗp�z�F�o������PDF /MIR /COPY:DT /xf ~$*.* /LOG:%logfile1%
echo �y���ؗp�z�F�����׎pPDF
robocopy %target2% %~dp0\�y���ؗp�z�F�����׎pPDF /MIR /COPY:DT /xf ~$*.* /LOG:%logfile2%
