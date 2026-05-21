@echo off
setlocal enabledelayedexpansion

:: 1. Copy from manualhtml to walkthrough_wiki (with overwrite)
echo Copying files from manualhtml to walkthrough_wiki...
xcopy "manualhtml" "walkthrough_wiki" /E /I /Y

:: 2. Copy from walkthrough_wiki to the local site directory (with overwrite)
echo Copying files to site directory...
xcopy "walkthrough_wiki" "C:\D\Programs\Python\kumiko_site\lessonsinlovewalkthrough" /E /I /Y

:: 3. Change directory to kumiko_site and run Git commands
echo Navigating to kumiko_site directory...
cd /d "C:\D\Programs\Python\kumiko_site"

echo Adding changes to git...
git add .

echo Committing changes...
git commit -m "Lessons in Love Walkthrough Update"

echo Pushing changes to origin...
git push origin

echo Process completed.
pause