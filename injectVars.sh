SHORT_HASH=$(git rev-parse --short HEAD)
if [[ "$OS" =~ "Windows" ]] || [[ "$OSTYPE" =~ "msys" ]] || [[ "$OSTYPE" =~ "win" ]]; then
  # Use PowerShell to get the version from package.json on Windows
  VERSION=$(powershell -Command "(Get-Content package.json | Out-String | ConvertFrom-Json).version")

  # Use PowerShell to update the version and commit hash in index.html on Windows
  powershell -Command "
    (Get-Content index.html) -replace '<div id=\"commit-hash\".*?>.*?</div>', '<div id=\"commit-hash\" style=\"text-align:center; color:#888; font-size:0.95em; margin-top:18px;\">Commit: ${SHORT_HASH}</div>' |
    ForEach-Object { \$_ -replace '<div id=\"version-number\".*?>.*?</div>', '<div id=\"version-number\" style=\"text-align:center; color:#888; font-size:0.95em; margin-top:4px;\">Version: ${VERSION}</div>' } |
    Set-Content index.html
  "
else
  VERSION=$(jq -r .version package.json)
  
  sed -i '' 's|<div id="commit-hash".*>.*</div>|<div id="commit-hash" style="text-align:center; color:#888; font-size:0.95em; margin-top:18px;">Commit: '"${SHORT_HASH}"'</div>|' index.html
  sed -i '' 's|<div id="version-number".*>.*</div>|<div id="version-number" style="text-align:center; color:#888; font-size:0.95em; margin-top:4px;">Version: '"${VERSION}"'</div>|' index.html
fi


