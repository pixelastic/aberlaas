#!/usr/bin/env bash

source "$(dirname "$0")/../test_framework/index"

test "should succeed if all test passes"

actual() {
	"${ROOT}"/lib/bin/aberlaas.js test "${HERE}/__tests__/feature.js"
}

expect_to_succeed
