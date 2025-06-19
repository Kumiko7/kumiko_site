@echo off
REM This batch file executes the VNDB data fetcher script and,
REM if successful, commits and pushes the result to Git.
REM
REM Prerequisites:
REM 1. Python 3 installed and in PATH.
REM 2. 'requests' library installed (`pip install requests`).
REM 3. Git installed and configured with credentials for push access.

SET "JSON_FILE=vn_sedai.json"
SET "PYTHON_SCRIPT=get_vndb_data.py"

echo ===================================================
echo   VNDB Data Update and Git Push Automation
echo ===================================================
echo.

REM Step 1: Run the Python script to fetch and generate the JSON file
echo [STEP 1/3] Running Python script to fetch data from VNDB...
python %PYTHON_SCRIPT%

REM Check the exit code of the Python script. 
REM %errorlevel% 0 means success. Non-zero means an error occurred.
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Python script failed to execute successfully.
    echo Please check the error messages above.
    echo Aborting Git operations.
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Python script completed. Data saved to %JSON_FILE%.
echo.

REM Step 2: Run Git commands
echo [STEP 2/3] Staging and committing changes with Git...

REM Check if the file was actually changed
git diff --quiet %JSON_FILE%
if %errorlevel% equ 0 (
    echo No changes detected in %JSON_FILE%. Nothing to commit.
    goto :Finish
)

git add %JSON_FILE%
if %errorlevel% neq 0 (
    echo [ERROR] 'git add' failed.
    pause
    exit /b 1
)

REM Use a consistent commit message
git commit -m "Automated: Update VN data from VNDB API"
if %errorlevel% neq 0 (
    echo [ERROR] 'git commit' failed. It might be because there were no staged changes to commit.
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Changes committed successfully.
echo.

REM Step 3: Push to the remote repository
echo [STEP 3/3] Pushing changes to remote repository...
git push origin

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] 'git push' failed.
    echo Please check your network connection and repository permissions.
    pause
    exit /b 1
)

:Finish
echo.
echo ===================================================
echo   Process completed successfully.
echo ===================================================
echo.
pause