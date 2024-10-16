#!/usr/bin/env bash

source "$(dirname "$0")/../test_framework/index"

test "should fail if at least one test fails"

actual() {
	"${ROOT}"/modules/lib/bin/aberlaas.js test "${HERE}/__tests__/feature.js"
}

expect_to_fail
