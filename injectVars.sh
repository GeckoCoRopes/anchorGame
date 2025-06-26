SHORT_HASH=$(git rev-parse --short HEAD)
VERSION=$(jq -r .version package.json)


sed -i '' 's|<div id="commit-hash".*>.*</div>|<div id="commit-hash" style="text-align:center; color:#888; font-size:0.95em; margin-top:18px;">Commit: '"${SHORT_HASH}"'</div>|' index.html
sed -i '' 's|<div id="version-number".*>.*</div>|<div id="version-number" style="text-align:center; color:#888; font-size:0.95em; margin-top:4px;">Version: '"${VERSION}"'</div>|' index.html
