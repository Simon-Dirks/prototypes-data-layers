#!/bin/bash

set -euo pipefail

prepareDistribution() {
  local url="$1"
  local outputFile="$2"

  echo "Downloading, validating and converting '$url'"

  baseFileName=$(basename "$url")

  wget -q $url -O "/tmp/$baseFileName"

  # Test for gzip
  if gzip -t "/tmp/$baseFileName" 2>/dev/null; then
    gunzip -f "/tmp/$baseFileName"  # Remove the .gz suffix automatically
    baseFileName="${baseFileName%.*}" # Remove the *last* dot‑extension, i.e. `.gz`
  fi

  extension="${outputFile##*.}" # E.g. `nq`

  # Validate and convert the distribution
  riot --output $extension "/tmp/$baseFileName" > "$outputFile"
}

mapRdfToRdf() {
  local inputFile="$1"
  local queryFile="$2"
  local outputFile="$3"

  echo "Mapping data in '$inputFile' to '$outputFile' according to '$queryFile'"

  # Remove existing file, if any
  rm -f $outputFile

  extension="${outputFile##*.}" # E.g. `ttl`

  sparql --data "$inputFile" --query "$queryFile" --results $extension > "$outputFile"
}

toJsonLd() {
  local inputFile="$1"
  local outputFile="$2"

  echo "Transforming data in '$inputFile' to JSON-LD in '$outputFile'..."

  # Remove existing file, if any
  rm -f $outputFile

  riot --output jsonld "$inputFile" > "$outputFile"
}

prepare() {
  local url="$1"
  local queryFile="$2"
  local jsonldFile="$3"
  local startTime=$SECONDS

  echo "Preparing data from '$url'..."

  outputDirName=$(dirname "$jsonldFile")
  outputFileName=$(basename "$jsonldFile")

  nquadsFile="$outputDirName/$outputFileName.nq"
  turtleFile="$outputDirName/$outputFileName.ttl"

  # Optimization for testing: do not prepare again if the file already exists
  if [[ ! -e "$nquadsFile" ]]; then
    prepareDistribution "$url" "$nquadsFile"
  fi

  mapRdfToRdf "$nquadsFile" "$queryFile" "$turtleFile"
  toJsonLd "$turtleFile" "$jsonldFile"

  rm -f "$turtleFile"

  local endTime=$SECONDS
  local duration=$((endTime-startTime))

  echo "Done preparing in $duration seconds"
}

prepare "https://collections.uu.nl/datadump_28-03-2026.jsonld.gz" "./queries/collections-uu.rq" "./data/collections-uu.jsonld"
