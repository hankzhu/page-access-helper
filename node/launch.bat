@echo off
taskkill /FI "WINDOWTITLE eq Page Access Helper Server" /IM "node.exe"
start "Page Access Helper Server" "node.exe" "main.js"
