#!/usr/bin/env bash

source "$(dirname "$0")/../test_framework/index"

test "should succeed even if no file is found"

actual() {
	"${ROOT}"/lib/bin/aberlaas.js test "${HERE}/__tests__/nothing_here.js"
}

expect_to_succeed
