#!/usr/bin/env bash

source "$(dirname "$0")/../test_framework/index"

test "should fail early with --failFast"

actual() {
	"${ROOT}"/modules/lib/bin/aberlaas.js test \
		--failFast \
		"${HERE}/__tests__/feature.js"
}

expect_to_fail &&
	expect_to_contain "one: pass" &&
	expect_to_contain "two: fail" &&
	expect_not_to_contain "three: pass"
