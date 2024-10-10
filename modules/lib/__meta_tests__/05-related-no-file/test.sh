#!/usr/bin/env bash

source "$(dirname "$0")/../test_framework/index"

test "should succeed if --related points to missing file"

actual() {
	"${ROOT}"/lib/bin/aberlaas.js test \
		--related \
		"${HERE}/nothing_here.js"
}

expect_to_succeed
