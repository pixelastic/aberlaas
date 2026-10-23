// When tests run through a pre-commit git hook, git exports variables like
// GIT_DIR and GIT_INDEX_FILE. They leak into tests that spawn git in a
// temporary repository, and make git operate on the real repository instead.
// We clear them before each test file runs.
delete process.env.GIT_DIR;
delete process.env.GIT_INDEX_FILE;
delete process.env.GIT_OBJECT_DIRECTORY;
delete process.env.GIT_WORK_TREE;
