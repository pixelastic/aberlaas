#!/usr/bin/env bash

source "$(dirname "$0")/../test_framework/index"

test "should succeed by targeting the code file with --related"

actual() {
	"${ROOT}"/modules/lib/bin/aberlaas.js test \
		--related \
		"${HERE}/feature.js"
}

expect_to_succeed &&
	expect_to_contain "my-feature"
