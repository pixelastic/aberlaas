#!/usr/bin/env bash

source ../test_framework

test "should succeed if all test passes"

actual() {
	yarn run test \
		--include "*.js.meta" \
		"$(dirname "$0")/test.js.meta"
}

expect_to_succeed
