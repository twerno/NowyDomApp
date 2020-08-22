del deploy /F /Q /S
del dist /F /Q /S
call npm run tsc
mkdir deploy
cd deploy
mkdir dist
cd ..
xcopy "dist" "deploy/dist" /S
copy package.json deploy
cd deploy
call npm install --only=prod
cd ..
#przygotuj plik zip - niestety "powershell Compress-Archive" nie utworzy poprawnego archiwum (https://stackoverflow.com/a/54426847)
