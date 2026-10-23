#!/usr/bin/env bash

# config
shopt -s globstar
shopt -s extglob
shopt -s nullglob

# prepare
mkdir -p temp

# function
extract_pack() {
    local SCOPE=$1
    local FILE=$2
    local PATTERN="${3:-"**/lang/*.rpf"}"
    echo "Extracting $SCOPE"
    local TARGET_DIR="raw/$SCOPE"
    rage extract "$FILE" "$PATTERN" -o temp &>/dev/null
    for f in temp/$PATTERN
    do
        local LANG=$(basename "${f%@(dlc|_rel).rpf}")
        mkdir -p "$TARGET_DIR/$LANG"
        rage extract "$f" "*" -o "$TARGET_DIR/$LANG" &>/dev/null
    done
    rm -rf temp/*
}

# x64b: basegame
extract_pack "basegame" "$GTA_ROOT/x64b.rpf"

# x64w: dlcs
mkdir -p x64w
rage extract "$GTA_ROOT/x64w.rpf" "*" -o x64w &>/dev/null
for f in x64w/**/*.rpf
do
    DLC_NAME=$(basename "${f%/*.rpf}")
    extract_pack "$DLC_NAME" "$f"
done
rm -rf x64w

# update: patch
extract_pack "update" "$GTA_ROOT/update/update.rpf" "x64/patch/data/lang/*.rpf"

# update: dlc patch
rage extract "$GTA_ROOT/update/update.rpf" "dlc_patch/*/**/lang/*.rpf" -o temp &>/dev/null
for f in temp/**/*.rpf
do
    DLC_NAME="$(echo "$f" | cut -d'/' -f3)_update"
    LANG=$(basename "${f%@(dlc|_rel).rpf}")
    TARGET_DIR="raw/$DLC_NAME"
    mkdir -p "$TARGET_DIR/$LANG"
    echo "Extracting $DLC_NAME"
    rage extract "$f" "*" -o "$TARGET_DIR/$LANG" &>/dev/null
done
rm -rf temp/*

# update2: patch
extract_pack "update2" "$GTA_ROOT/update/update2.rpf"

# new dlcs
for f in "$GTA_ROOT/update/x64/dlcpacks/"**/*.rpf
do
    DLC_NAME=$(basename "${f%/*.rpf}")
    extract_pack "$DLC_NAME" "$f"
done

# organise
mkdir -p raw/patchDay1NG_patch
mv raw/patchDay1NG/*.rpf raw/patchDay1NG_patch/
for f in raw/patchDay1NG_patch/*.rpf
do
    mv "$f" "raw/patchDay1NG_patch/$(basename ${f%.rpf})"
done

# clean up
rm -rf temp
