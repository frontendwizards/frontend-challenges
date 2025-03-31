gh pr list --author "dependabot[bot]" --state open --json number --jq '.[].number' | xargs -I {} gh pr merge {} --merge
