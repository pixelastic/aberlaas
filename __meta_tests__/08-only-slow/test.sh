#!/usr/bin/env bash

source "$(dirname "$0")/../test_framework/index"

test "should run only slow tests with --only-slow"

actual() {
	"${ROOT}"/modules/lib/bin/aberlaas.js test \
		--only-slow \
		"${HERE}/__tests__/feature.js"
}

expect_to_succeed &&
	expect_to_contain "slow test" &&
	expect_not_to_contain "normal test"
