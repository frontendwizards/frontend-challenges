#!/bin/bash

branch=$1

# default branch is main
if [ -z "$branch" ]; then
    branch="main"
fi


git fetch origin $branch
git merge origin/$branch

CONFLICTS=$(git diff --name-only --diff-filter=U)

# if no conflicts, then push..
if [ -z "$CONFLICTS" ]; then
    current_branch=$(git branch --show-current)
    git push origin $current_branch
fi
