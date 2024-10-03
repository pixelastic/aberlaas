#!/usr/bin/env bash

source "$(dirname "$0")/../test_framework/index"

test "should succeed by targeting the code file with --related"

actual() {
	"${ROOT}"/lib/bin/aberlaas.js test \
		--related \
		"${HERE}/__tests__/feature.js"
}

expect_to_succeed &&
	expect_to_contain "my-feature"
