@echo off
echo.
echo ================================
echo    Starting The Bill Server
echo ================================
echo.
echo Installing dependencies...
pip install -q -r requirements.txt
echo.
echo Starting Flask server...
echo Server will be available at: http://localhost:10000
echo.
echo Opening browser...
timeout /t 3 /nobreak > nul
start http://localhost:10000
echo.
echo Press CTRL+C to stop the server
echo.
python app.py
