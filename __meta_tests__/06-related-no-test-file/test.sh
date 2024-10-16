#!/usr/bin/env bash

source "$(dirname "$0")/../test_framework/index"

test "should succeed even if --related file as no test associated"

actual() {
	"${ROOT}"/modules/lib/bin/aberlaas.js test \
		--related \
		"${HERE}/feature.js"
}

expect_to_succeed
