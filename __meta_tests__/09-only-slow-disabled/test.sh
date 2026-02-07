#!/usr/bin/env bash

source "$(dirname "$0")/../test_framework/index"

test "should run all tests without --only-slow"

actual() {
	"${ROOT}"/modules/lib/bin/aberlaas.js test \
		"${HERE}/__tests__/feature.js"
}

expect_to_succeed &&
	expect_to_contain "slow test" &&
	expect_to_contain "normal test"
