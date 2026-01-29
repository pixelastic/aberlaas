## v2.20.1

I borked the previous release. My token didn't had right to push a new package.
So bumping patch with the right packages this time.

## v2.20.0


### Features

- Release does all the pre-checks (2cb2924)
- **release:** Add almost complete-flow (missing tag creation) (7f0501c)
- **release:** Create tag and push it (b61724b)
- **readme:** Modernize template system with frontmatter-based config (265aadc)
- **release:** Finalize changelog generation, with preview and edit (54e7522)
- **readme:** Add --add-to-git for readme (636d1f0)
- **ci:** Decouple test and lint from direct imports (d056a77)
- **init:** Add .editorconfig template and improve backup handling (cb56ca7)
- **readme:** Add readme template system with auto-staging (223a30b)

### Bug Fixes

- **init:** Remove node/yarn version duplication (8ee1077)
- **init:** Remove .gitattributes template and references (f27dd10)
- **helper:** Preserve colors in yarn run commands (5284bd8)

## [0.11.4](https://github.com/pixelastic/aberlaas/compare/0.11.3...0.11.4) (2020-01-17)


### Bug Fixes

* **init:** Actually call setDefaultName ([8c9797f](https://github.com/pixelastic/aberlaas/commit/8c9797f795df864362e194ed12ab72fd2f15bf59))
* **lint:** Stop ignoring unused _ variable ([54c1b8d](https://github.com/pixelastic/aberlaas/commit/54c1b8db8824818940ff7f4e5f86078e5d64519c))

## [0.11.3](https://github.com/pixelastic/aberlaas/compare/0.11.2...0.11.3) (2020-01-15)


### Bug Fixes

* **deps:** update babel monorepo to v7.8.0 ([f6f2a9f](https://github.com/pixelastic/aberlaas/commit/f6f2a9f702b69cef234ac65d5be400d3a265df59))
* **deps:** update babel monorepo to v7.8.3 ([6cadf1e](https://github.com/pixelastic/aberlaas/commit/6cadf1e8541956e000cd34994f18a7178fb7a229))
* **deps:** update dependency @babel/preset-env to v7.8.2 ([e1daba3](https://github.com/pixelastic/aberlaas/commit/e1daba31be1058d2062d9c0229172e6316fb2158))
* **deps:** update dependency eslint-plugin-jest to v23.5.0 ([bb01d26](https://github.com/pixelastic/aberlaas/commit/bb01d261896e77a8ad5323bb502d8435534d24a9))
* **deps:** update dependency eslint-plugin-jest to v23.6.0 ([fca63b5](https://github.com/pixelastic/aberlaas/commit/fca63b5dc0089ed1857ff460fad0aa0a05198831))
* **deps:** update dependency eslint-plugin-jsdoc to v20.2.0 ([e96689d](https://github.com/pixelastic/aberlaas/commit/e96689ddeb2296f968eca6ab3a07fbb3f3d7047e))
* **deps:** update dependency eslint-plugin-jsdoc to v20.3.0 ([6d88d3f](https://github.com/pixelastic/aberlaas/commit/6d88d3f89d91bb3e9776c7fb61b6b9f18f21627c))
* **deps:** update dependency eslint-plugin-jsdoc to v20.3.1 ([48ffe13](https://github.com/pixelastic/aberlaas/commit/48ffe13effaed4b3a6eaae9ac1c6154977e6607a))


### Features

* **eslint:** Don't warn for unused _vars ([563d277](https://github.com/pixelastic/aberlaas/commit/563d27794017d3b081c39a6f88120697fdafcc07))

## [0.11.2](https://github.com/pixelastic/aberlaas/compare/0.11.1...0.11.2) (2020-01-11)


### Bug Fixes

* **deps:** update dependency eslint-plugin-import to v2.20.0 ([cc19762](https://github.com/pixelastic/aberlaas/commit/cc1976207610934cb6ebbd37f3aac9b62517d02e))
* **deps:** update dependency eslint-plugin-jest to v23.4.0 ([1080b33](https://github.com/pixelastic/aberlaas/commit/1080b3305d4df8d291a274f03884452e51f08e45))
* **deps:** update dependency eslint-plugin-jsdoc to v20.0.4 ([dae2f4b](https://github.com/pixelastic/aberlaas/commit/dae2f4b23d416901d7d5c5a2e17c1557a99593ab))
* **deps:** update dependency eslint-plugin-jsdoc to v20.0.5 ([502ef99](https://github.com/pixelastic/aberlaas/commit/502ef99c7b058f1eb1ad78b42fa51e8587220321))
* **deps:** update dependency eslint-plugin-jsdoc to v20.1.0 ([ac8b3f6](https://github.com/pixelastic/aberlaas/commit/ac8b3f6e3537f248e84accdd0043bf18fd6c5428))


### Features

* **init:** Set a default package name on aberlaas init ([ae082ee](https://github.com/pixelastic/aberlaas/commit/ae082eebe397d5c70bc7e2dd81242e338710c7a2))

## [0.11.1](https://github.com/pixelastic/aberlaas/compare/0.11.0...0.11.1) (2020-01-08)


### Bug Fixes

* **deps:** update dependency eslint-plugin-jest to v23.3.0 ([f37b4ac](https://github.com/pixelastic/aberlaas/commit/f37b4ac561b436a4ffaa6868c38116287ec0715c))
* **deps:** update dependency eslint-plugin-jsdoc to v20.0.1 ([64db994](https://github.com/pixelastic/aberlaas/commit/64db994676bf3c5e2d32577a024301a3b369f86f))
* **deps:** update dependency eslint-plugin-jsdoc to v20.0.2 ([e6f0bb1](https://github.com/pixelastic/aberlaas/commit/e6f0bb136f1d5b2da927d90bf7888dd71194adb8))
* **deps:** update dependency eslint-plugin-jsdoc to v20.0.3 ([9462429](https://github.com/pixelastic/aberlaas/commit/94624296aec39ff5ad86eafbc26b23d13e19ae74))
* **deps:** update dependency firost to v0.21.0 ([3e0b6a5](https://github.com/pixelastic/aberlaas/commit/3e0b6a56867a12c856319ba12b513174f594e744))


### Features

* **init:** Set a default v0.0.1 ([702b9d4](https://github.com/pixelastic/aberlaas/commit/702b9d4f4f6a6f93107d91c2629277efa47f3bc8))

# [0.11.0](https://github.com/pixelastic/aberlaas/compare/0.10.9...0.11.0) (2020-01-03)


### Bug Fixes

* **ci:** Set absolute path in spy ([e423d9e](https://github.com/pixelastic/aberlaas/commit/e423d9e1442f33b3aae426763eef261d1626db40))
* **deps:** update babel monorepo to v7.7.7 ([ea2125a](https://github.com/pixelastic/aberlaas/commit/ea2125a4e5f15cbb3e98426ba073b23ad0c0708e))
* **deps:** update dependency eslint-config-prettier to v6.9.0 ([b33d003](https://github.com/pixelastic/aberlaas/commit/b33d003a438fe0f1d113cbfea1783c7a0ea0223c))
* **deps:** update dependency eslint-plugin-jest to v23.2.0 ([3fa68fd](https://github.com/pixelastic/aberlaas/commit/3fa68fd2f50977c5b097edcbb7cb184bca5e51ee))
* **tests:** Create ./tmp/release folder before moving to it ([a4a3d20](https://github.com/pixelastic/aberlaas/commit/a4a3d20e7bcce00f918fc03cd742a2b289ce9ae2))

## [0.10.9](https://github.com/pixelastic/aberlaas/compare/0.10.8...0.10.9) (2020-01-03)

## [0.10.8](https://github.com/pixelastic/aberlaas/compare/0.10.7...0.10.8) (2020-01-03)


### Features

* **circleci:** Use v2.1 ([e1078cb](https://github.com/pixelastic/aberlaas/commit/e1078cbf8d748b300930de55d6aa75a2486d7987))

## [0.10.7](https://github.com/pixelastic/aberlaas/compare/0.10.6...0.10.7) (2020-01-03)


### Features

* **circleci:** Use extended yaml syntax by default ([662d086](https://github.com/pixelastic/aberlaas/commit/662d086a1b395afa5f286803dad0fb10de15e4bd))

## [0.10.6](https://github.com/pixelastic/aberlaas/compare/0.10.5...0.10.6) (2020-01-02)


### Features

* **lint:** Enforce dot notation in JavaScript ([613aaac](https://github.com/pixelastic/aberlaas/commit/613aaac7e9d255c4c9dc96ee13f2744e36573f7b))

## [0.10.5](https://github.com/pixelastic/aberlaas/compare/0.10.4...0.10.5) (2019-12-18)


### Features

* **ci:** Fix node to v12.12.0 ([4dee77d](https://github.com/pixelastic/aberlaas/commit/4dee77d2529fce2d4ddcccc9540d4ada020bec98))

## [0.10.4](https://github.com/pixelastic/aberlaas/compare/0.10.3...0.10.4) (2019-12-18)


### Bug Fixes

* **ci:** Correctly scope the call to yarnRun ([b810073](https://github.com/pixelastic/aberlaas/commit/b8100739c8d09af15ec353da7aa629695c46ed7e))

## [0.10.3](https://github.com/pixelastic/aberlaas/compare/0.10.2...0.10.3) (2019-12-17)


### Bug Fixes

* **lint:** Do not fail css linting if file not found ([070c873](https://github.com/pixelastic/aberlaas/commit/070c87312d3d29aa8d98112a950ca10bbbc117a1))

## [0.10.2](https://github.com/pixelastic/aberlaas/compare/0.10.1...0.10.2) (2019-12-02)


### Bug Fixes

* **init:** Fix spinner never ending ([e278efc](https://github.com/pixelastic/aberlaas/commit/e278efceecee841d17e3fb698de05c6d6d49cbc2))


### Features

* **lint:** Allow importing aberlaas/ from templates ([399f733](https://github.com/pixelastic/aberlaas/commit/399f733ef48ca28d5000d22a405320dc03f20196))

## [0.10.1](https://github.com/pixelastic/aberlaas/compare/0.10.0...0.10.1) (2019-11-29)


### Features

* **node:** Downgrade to node 12 instead of node 13 ([09a0325](https://github.com/pixelastic/aberlaas/commit/09a03252e152d17bd008047e29a9e8f7c811a6b2))

# [0.10.0](https://github.com/pixelastic/aberlaas/compare/0.9.3...0.10.0) (2019-11-27)


### Bug Fixes

* **deps:** update dependency firost to v0.19.0 ([057c3e5](https://github.com/pixelastic/aberlaas/commit/057c3e50cec76cf06daefbfdcea9a6ddbcf78170))


### Features

* **release:** Git pull before release ([25f5605](https://github.com/pixelastic/aberlaas/commit/25f56053f239de33c786fb66b7b3bd747b428d40))
* **release:** Update meta release sript ([40e94f0](https://github.com/pixelastic/aberlaas/commit/40e94f0c3d6ce67796588fc82ef551ca1c212913))

## [0.9.3](https://github.com/pixelastic/aberlaas/compare/0.9.2...0.9.3) (2019-11-27)


### Bug Fixes

* **deps:** update dependency firost to v0.17.1 ([502eb4d](https://github.com/pixelastic/aberlaas/commit/502eb4d34414446c7899dbb7a4586c711e6a85e8))
* **deps:** update dependency golgoth to v0.6.1 ([334dec4](https://github.com/pixelastic/aberlaas/commit/334dec48ab5fe0bf3c528d9db09951331c25a05b))
* **test:** captureOutput correctly flushes after errors ([cf72c89](https://github.com/pixelastic/aberlaas/commit/cf72c891ff73da526fcc7b87687d98f483710b72))

## [0.9.2](https://github.com/pixelastic/aberlaas/compare/0.9.1...0.9.2) (2019-11-27)


### Bug Fixes

* **deps:** update dependency eslint-plugin-jest to v23.0.5 ([e900e2d](https://github.com/pixelastic/aberlaas/commit/e900e2debd3f45827f05c7a2300ea6dc2eaf1178))
* **deps:** update dependency lint-staged to v9.5.0 ([2b34d39](https://github.com/pixelastic/aberlaas/commit/2b34d39a0f39d88a3191adb7daef00e33930351a))
* **init:** Do not pin engine in package.json ([e8afa8c](https://github.com/pixelastic/aberlaas/commit/e8afa8c7155ec69ed76a67291801a98881e316b0))


### Features

* **init:** Add progress spinner ([70650b5](https://github.com/pixelastic/aberlaas/commit/70650b56ebde5bbad287753d20eafa9c4420ea72))
* **release:** Pull remote before releasing ([61fa9d3](https://github.com/pixelastic/aberlaas/commit/61fa9d3c76fcfe0e9e70c369630f9aadbf941b52))

## [0.9.1](https://github.com/pixelastic/aberlaas/compare/0.9.0...0.9.1) (2019-11-26)


### Features

* **ci:** Add CircleCI config to init script ([5ba7fd7](https://github.com/pixelastic/aberlaas/commit/5ba7fd7a045a6cfc5e7d67bd392750df58456ad5))

# [0.9.0](https://github.com/pixelastic/aberlaas/compare/0.8.1...0.9.0) (2019-11-26)


### Bug Fixes

* **ci:** Don't treat Renovate PRs any differently ([bdb2a29](https://github.com/pixelastic/aberlaas/commit/bdb2a29a4d8f6e1b7b4cfc8851c8aeee09775e4b))
* **ci:** Force isRenovatePR to false in tests ([4193804](https://github.com/pixelastic/aberlaas/commit/419380496cbcbb7a186ffe5320cf370a39750eae))
* **deps:** update babel monorepo to v7.7.4 ([f4e16ca](https://github.com/pixelastic/aberlaas/commit/f4e16cad74e1c83c8f9a1574dba136eb1f6d1882))
* **deps:** update dependency eslint to v6.7.1 ([e39b2f8](https://github.com/pixelastic/aberlaas/commit/e39b2f87508a4e6ba8473feb12d08336f23fbe7b))
* **deps:** update dependency eslint-config-prettier to v6.7.0 ([315e1bf](https://github.com/pixelastic/aberlaas/commit/315e1bf22161544bf42e0533fe44841f816e5dc5))
* **deps:** update dependency eslint-plugin-jest to v22.21.0 ([5a952c1](https://github.com/pixelastic/aberlaas/commit/5a952c1b965f497b42425de26f49f3df414c550d))
* **deps:** update dependency eslint-plugin-jest to v23 ([27067a2](https://github.com/pixelastic/aberlaas/commit/27067a2d65f25655e75db8678033e9dab749a4cf))
* **deps:** update dependency eslint-plugin-jsdoc to v15.12.2 ([edd3463](https://github.com/pixelastic/aberlaas/commit/edd34634efab809c73a42ac88281522caa99c7a8))
* **deps:** update dependency eslint-plugin-jsdoc to v18 ([28c3ead](https://github.com/pixelastic/aberlaas/commit/28c3ead0b35a49a46bb62fe371e632fe5d67f897))
* **deps:** update dependency eslint-plugin-prettier to v3.1.1 ([045d45a](https://github.com/pixelastic/aberlaas/commit/045d45a61abea463eef11bd34133161e62f4aa17))
* **deps:** update dependency execa to v3 ([55ad68d](https://github.com/pixelastic/aberlaas/commit/55ad68dfcc852f14b86ffa66bdc263e5cc3aea96))
* **deps:** update dependency firost to v0.17.0 ([2793e9a](https://github.com/pixelastic/aberlaas/commit/2793e9a1d84fab651fe286abeb2db1a39d1838b2))
* **deps:** update dependency release-it to v12.4.3 ([5b8ebe3](https://github.com/pixelastic/aberlaas/commit/5b8ebe338cbceac5e1e928e8a15d3f558828ce77))
* **deps:** update dependency stylelint to v11.1.1 ([50e8522](https://github.com/pixelastic/aberlaas/commit/50e8522a0eee5c9488418f505efc248407d36228))
* **deps:** update dependency stylelint to v12 ([a2d0aac](https://github.com/pixelastic/aberlaas/commit/a2d0aac1a645710e3876b22249bb71479e5ef3cc))
* **init:** Remove yarnrc ([4a1d9de](https://github.com/pixelastic/aberlaas/commit/4a1d9de619474fab9e81e45e11221fa86dab7b65))
* **lint:** Change order of checks ([6fc0f21](https://github.com/pixelastic/aberlaas/commit/6fc0f21871be3592da124503436300ce441a8249))


### Features

* **ci:** Add ci command ([00e28a8](https://github.com/pixelastic/aberlaas/commit/00e28a8f0f368870e98de6f712c799b894996c35))
* **ci:** Add circleci integration ([8990b2e](https://github.com/pixelastic/aberlaas/commit/8990b2ef64af384a05d186960b69c0c38ff32ac0))
* **ci:** Skip redundant build ([5cbc4bb](https://github.com/pixelastic/aberlaas/commit/5cbc4bb30f6d60e4e24ad2bdc126e2fb09820722))
* **lint:** Update eslint plugin for jest ([b0fa89d](https://github.com/pixelastic/aberlaas/commit/b0fa89df3c15f0e4670f0831c9791a7fda42b484))

## [0.8.1](https://github.com/pixelastic/aberlaas/compare/0.8.0...0.8.1) (2019-11-24)


### Features

* **lint:** Always validate circleci on itself ([3a3617f](https://github.com/pixelastic/aberlaas/commit/3a3617f3758baca83515178ac0a07169bcaea010))

# [0.8.0](https://github.com/pixelastic/aberlaas/compare/0.7.3...0.8.0) (2019-11-24)


### Bug Fixes

* **deps:** update dependency execa to v2.1.0 ([538f594](https://github.com/pixelastic/aberlaas/commit/538f5942909812f40f9bc618767a96157950c763))
* **deps:** update dependency husky to v3.1.0 ([fc295fe](https://github.com/pixelastic/aberlaas/commit/fc295fe430a7ba138203ebff275ccbd9d48e7dca))


### Features

* **lint:** Add linting of circleci config ([1357222](https://github.com/pixelastic/aberlaas/commit/13572220acc6e2c54692f599d97b37eca15ef7df))

## [0.7.3](https://github.com/pixelastic/aberlaas/compare/0.7.2...0.7.3) (2019-11-22)


### Bug Fixes

* **deps:** update dependency golgoth to v0.5.1 ([7f59d6d](https://github.com/pixelastic/aberlaas/commit/7f59d6d9627ddafa306bd2c81b74701b6da08647))
* **deps:** update dependency lint-staged to v9.4.3 ([#30](https://github.com/pixelastic/aberlaas/issues/30)) ([8879c11](https://github.com/pixelastic/aberlaas/commit/8879c119eda5cd9e471ada4640e1e9adda42ca2d))

## [0.7.2](https://github.com/pixelastic/aberlaas/compare/0.7.1...0.7.2) (2019-11-20)


### Features

* **release:** Attempt to build before releasing ([f66f054](https://github.com/pixelastic/aberlaas/commit/f66f05495aec1474f17ff3e6b9bb7e6efc90f1a6))

## [0.7.1](https://github.com/pixelastic/aberlaas/compare/0.7.0...0.7.1) (2019-11-20)


### Features

* **renovate:** Try to update deps as soon as possible ([4cacb96](https://github.com/pixelastic/aberlaas/commit/4cacb9618cebde02e531eb016de1580a0b01ad83))
* **test:** Expose `testName` in each Jest test ([0284b61](https://github.com/pixelastic/aberlaas/commit/0284b61b41623757fd2f5df997227a5280c2b17c))
* **test:** Use lodash instead of lodash-es in tests ([18faa4c](https://github.com/pixelastic/aberlaas/commit/18faa4cf5e96abeea9d22feff795a3e133304c83))

# [0.7.0](https://github.com/pixelastic/aberlaas/compare/0.6.10...0.7.0) (2019-11-06)


### Bug Fixes

* **lint:** Correctly exit when lint fixing still has errors ([e312973](https://github.com/pixelastic/aberlaas/commit/e312973669ab22220a49b7d828e4eb998f2185b7))

## [0.6.10](https://github.com/pixelastic/aberlaas/compare/0.6.9...0.6.10) (2019-10-30)


### Bug Fixes

* **lint:** Prevent shadowing variables in JS ([76fc92b](https://github.com/pixelastic/aberlaas/commit/76fc92be87316395c0aac3557352eda577aef2bc))

## [0.6.9](https://github.com/pixelastic/aberlaas/compare/0.6.8...0.6.9) (2019-10-22)


### Bug Fixes

* **lint:** Revert husky logic. Test all files at once ([a77279f](https://github.com/pixelastic/aberlaas/commit/a77279f523a0dacc841e463ab075751e0d2b5831))

## [0.6.8](https://github.com/pixelastic/aberlaas/compare/0.6.7...0.6.8) (2019-10-22)


### Bug Fixes

* **lint:** Fixing of files displays the file that errored ([e9367b4](https://github.com/pixelastic/aberlaas/commit/e9367b4646c8ef2b77d0da82bfdafe5cfa640d9c))


### Features

* **lint:** Use single quotes in CSS ([f0f6dd4](https://github.com/pixelastic/aberlaas/commit/f0f6dd413afb46642a1a8a23f3dc5c1066133c53))

## [0.6.7](https://github.com/pixelastic/aberlaas/compare/0.6.6...0.6.7) (2019-10-17)


### Features

* **renovate:** Default to silent merging on renovate ([68d51a4](https://github.com/pixelastic/aberlaas/commit/68d51a4a93b29066ec4ac7de49d12e3f71a795d8))

## [0.6.6](https://github.com/pixelastic/aberlaas/compare/0.6.5...0.6.6) (2019-10-12)


### Bug Fixes

* **husky:** Correctly name the template file ([97240a8](https://github.com/pixelastic/aberlaas/commit/97240a882b91ecd52ad216c56d5e738d45f57d9a))

## [0.6.5](https://github.com/pixelastic/aberlaas/compare/0.6.4...0.6.5) (2019-10-12)


### Bug Fixes

* **husky:** Rename "precommit" to "husky:precommit" script ([326db9c](https://github.com/pixelastic/aberlaas/commit/326db9c34804915405281bbab8dd3107904d202f))

## [0.6.4](https://github.com/pixelastic/aberlaas/compare/0.6.3...0.6.4) (2019-10-10)


### Features

* **release:** Add changelog to release notes ([2e97865](https://github.com/pixelastic/aberlaas/commit/2e97865c8e14ba9f1b7ba7600781204a85b6440e))



## [0.6.3](https://github.com/pixelastic/aberlaas/compare/0.6.2...0.6.3) (2019-10-10)


### Bug Fixes

* **release:** Revert testing before release. Add to script instead ([2d21931](https://github.com/pixelastic/aberlaas/commit/2d21931dc3fdde6e015086e5201052e360be88cf))



## [0.6.2](https://github.com/pixelastic/aberlaas/compare/0.6.0...0.6.2) (2019-10-10)


### Bug Fixes

* **deps:** update dependency golgoth to v0.4.2 ([#19](https://github.com/pixelastic/aberlaas/issues/19)) ([1ddaea8](https://github.com/pixelastic/aberlaas/commit/1ddaea839baba454ff345fba5724b7eb7d811d8a))
* **release:** Automatically test and build before release ([3cb9456](https://github.com/pixelastic/aberlaas/commit/3cb9456c5584c2db2d75d877dfc6c442a979fa4d))
* **release:** Set build to true by default in release ([27ebbaf](https://github.com/pixelastic/aberlaas/commit/27ebbaff32e6d703ee6b4228c48a33e131c4a133))


### Features

* **release:** Test code before release ([36a8aae](https://github.com/pixelastic/aberlaas/commit/36a8aaef7782d7552530cd08695bcb2eeaa86e5d))



# [0.6.0](https://github.com/pixelastic/aberlaas/compare/0.5.1...0.6.0) (2019-10-09)


### Features

* **lint:** Add lint-staged for precommits ([e79e99e](https://github.com/pixelastic/aberlaas/commit/e79e99e1e309e753bdcddf904953a588cf0273ec))
* **precommit:** Add better handling of changed files ([16980d9](https://github.com/pixelastic/aberlaas/commit/16980d9bb898d8689acdb4d1ecbb79f905e926df))



## [0.5.1](https://github.com/pixelastic/aberlaas/compare/0.5.0...0.5.1) (2019-10-08)



# [0.5.0](https://github.com/pixelastic/aberlaas/compare/0.4.11...0.5.0) (2019-10-08)


### Bug Fixes

* **helper:** Fix spawning of node binaries ([d0516df](https://github.com/pixelastic/aberlaas/commit/d0516df83d9361b72695159b62d67698123cd3b5))


### Features

* **lint:** Add YAML linter ([acdb137](https://github.com/pixelastic/aberlaas/commit/acdb137662d6b388816572516f12f31222fdbd90))



## [0.4.11](https://github.com/pixelastic/aberlaas/compare/0.4.10...0.4.11) (2019-10-05)


### Bug Fixes

* **deps:** update dependency husky to v1.3.1 ([13c88f7](https://github.com/pixelastic/aberlaas/commit/13c88f705634d02732335b51b043fcbdee03ba70))


### Features

* **init:** Add renovate config by default ([24ab155](https://github.com/pixelastic/aberlaas/commit/24ab155aa268043ecb6b94fa2b249970911d2aa7))
* **renovate:** Configure renovate ([598bd8e](https://github.com/pixelastic/aberlaas/commit/598bd8ec0c9e6c1a62b46d47fda015e5f4b30a3f))
* **renovate:** Enable automerge ([041e102](https://github.com/pixelastic/aberlaas/commit/041e102d2a00f5c0390c9a504b0ebfd4a48064ad))



## [0.4.10](https://github.com/pixelastic/aberlaas/compare/0.4.9...0.4.10) (2019-10-04)


### Bug Fixes

* **init:** Stop adding LICENSE to list of released files (by default) ([52e0ee7](https://github.com/pixelastic/aberlaas/commit/52e0ee7104a54b5a85f163dfb7fbf895f7006a37))
* **release:** Exits with code 1 on error ([bec6a81](https://github.com/pixelastic/aberlaas/commit/bec6a81567f2a1d74fb8e0c74757139ad4a3d0bd))



## [0.4.9](https://github.com/pixelastic/aberlaas/compare/0.4.8...0.4.9) (2019-09-26)


### Features

* **lint:** Allow importing .pug files, but warn if do not exist ([1491abd](https://github.com/pixelastic/aberlaas/commit/1491abd0ba9cd514a94fe509b17d73fe214ebd90))



## [0.4.8](https://github.com/pixelastic/aberlaas/compare/0.4.7...0.4.8) (2019-09-25)



## [0.4.7](https://github.com/pixelastic/aberlaas/compare/0.4.6...0.4.7) (2019-09-25)



## [0.4.6](https://github.com/pixelastic/aberlaas/compare/0.4.5...0.4.6) (2019-09-25)


### Features

* **test:** Set Jest to correct version ([f1dc7a9](https://github.com/pixelastic/aberlaas/commit/f1dc7a988471f4fa39c9c3581a56d24624fcadf4))



## [0.4.5](https://github.com/pixelastic/aberlaas/compare/0.4.4...0.4.5) (2019-09-25)


### Bug Fixes

* **test:** Re-disnable Jest cache ([7247605](https://github.com/pixelastic/aberlaas/commit/7247605c48bf409e579502569fd54373ddbd6c89))


### Performance Improvements

* **jest:** Update to Jest head and enable cache to fasten tests ([10716ab](https://github.com/pixelastic/aberlaas/commit/10716ab4eb7eb9eef5d8fbd9f1ea3cc336f3684a))



## [0.4.4](https://github.com/pixelastic/aberlaas/compare/0.4.3...0.4.4) (2019-09-24)


### Bug Fixes

* **husky:** Only define hooks if matching script exists ([a02c613](https://github.com/pixelastic/aberlaas/commit/a02c6138002830f01cf34b5809ab90a977a1d2ab))



## [0.4.3](https://github.com/pixelastic/aberlaas/compare/0.4.2...0.4.3) (2019-09-20)



## [0.4.2](https://github.com/pixelastic/aberlaas/compare/0.4.1...0.4.2) (2019-09-20)


### Bug Fixes

* **test:** Make jest-extended always loaded ([46a555b](https://github.com/pixelastic/aberlaas/commit/46a555bcfab73f4b6935ce9d89f6956ddd2bed24))



## [0.4.1](https://github.com/pixelastic/aberlaas/compare/0.4.0...0.4.1) (2019-09-19)



# [0.4.0](https://github.com/pixelastic/aberlaas/compare/0.3.1...0.4.0) (2019-09-17)


### Features

* **init:** Adds a LICENSE file on init ([0c18312](https://github.com/pixelastic/aberlaas/commit/0c183124665b70749002715d6c888c01289f5ada))



## [0.3.1](https://github.com/pixelastic/aberlaas/compare/0.3.0...0.3.1) (2019-09-10)


### Bug Fixes

* **lint:** Force disabling no-console ([6722ace](https://github.com/pixelastic/aberlaas/commit/6722ace1c16a5e3d3f4f7310143d55c974ff37a1))



# [0.3.0](https://github.com/pixelastic/aberlaas/compare/0.2.2...0.3.0) (2019-08-27)


### Bug Fixes

* **lint:** Fix linting of several json files ([008a8ee](https://github.com/pixelastic/aberlaas/commit/008a8ee46e7784d07194b32d990fc73776c096c8))



## [0.2.2](https://github.com/pixelastic/aberlaas/compare/0.2.1...0.2.2) (2019-08-22)


### Features

* **jest:** Add jest-extended ([6b15865](https://github.com/pixelastic/aberlaas/commit/6b15865043e92130fa3979ea327f9d687a83d842))



## [0.2.1](https://github.com/pixelastic/aberlaas/compare/0.2.0...0.2.1) (2019-08-11)


### Bug Fixes

* **init:** Fix typo in method name ([965384a](https://github.com/pixelastic/aberlaas/commit/965384a5d50301b05035d8e5d9dc428c63c2ca5d))



# [0.2.0](https://github.com/pixelastic/aberlaas/compare/0.1.10...0.2.0) (2019-08-11)


### Features

* **init:** Update init method ([33657da](https://github.com/pixelastic/aberlaas/commit/33657daff0bf0b711a0197d57c4b5cdb176d52e3))



## [0.1.10](https://github.com/pixelastic/aberlaas/compare/0.1.9...0.1.10) (2019-08-02)



## [0.1.9](https://github.com/pixelastic/aberlaas/compare/0.1.8...0.1.9) (2019-08-02)


### Bug Fixes

* **config:** Fallback to configs in build/ folder in aberlaas ([ad8364d](https://github.com/pixelastic/aberlaas/commit/ad8364df218f6217550217a98ae5de4dfa7cef9b))


### Features

* **lint:** Allow passing specific confifs per linter ([b318b52](https://github.com/pixelastic/aberlaas/commit/b318b52033cd69135634dc77748d709a3d19e0d7))
* **test:** Setting default testEnvironment to node instead of jsdom ([87e4112](https://github.com/pixelastic/aberlaas/commit/87e4112e0bbe61987b021d4adf9f22f670256095))



## [0.1.8](https://github.com/pixelastic/aberlaas/compare/0.1.7...0.1.8) (2019-07-24)



## [0.1.7](https://github.com/pixelastic/aberlaas/compare/0.1.6...0.1.7) (2019-07-24)


### Bug Fixes

* **test:** Correctly allow passing files to test ([58ecb13](https://github.com/pixelastic/aberlaas/commit/58ecb13a7e73f7c3d1773716355ad63b3be4d2f7))



## [0.1.6](https://github.com/pixelastic/aberlaas/compare/0.1.5...0.1.6) (2019-07-19)


### Features

* **release:** Better warn if release can't be done properly ([8b360c7](https://github.com/pixelastic/aberlaas/commit/8b360c74efcf9ad6bb16074d84b2d4663328fe3a))



## [0.1.5](https://github.com/pixelastic/aberlaas/compare/0.1.4...0.1.5) (2019-07-17)



## [0.1.4](https://github.com/pixelastic/aberlaas/compare/0.1.3...0.1.4) (2019-07-17)



## [0.1.3](https://github.com/pixelastic/aberlaas/compare/0.1.2...0.1.3) (2019-07-16)



## [0.1.2](https://github.com/pixelastic/aberlaas/compare/0.1.1...0.1.2) (2019-07-05)



## [0.1.1](https://github.com/pixelastic/aberlaas/compare/0.1.0...0.1.1) (2019-07-04)


### Bug Fixes

* **lint:** Add json-fix script ([92e809a](https://github.com/pixelastic/aberlaas/commit/92e809a8c6bc9db6211eee76078e713bdbeeb613))



# [0.1.0](https://github.com/pixelastic/aberlaas/compare/0.0.41...0.1.0) (2019-07-04)



## [0.0.41](https://github.com/pixelastic/aberlaas/compare/0.0.40...0.0.41) (2019-07-03)


### Features

* **folders:** Exclude vendors folder by default ([13553b1](https://github.com/pixelastic/aberlaas/commit/13553b1d55f364d13068cd559209ea1946bce6c7))



## [0.0.40](https://github.com/pixelastic/aberlaas/compare/0.0.39...0.0.40) (2019-07-03)


### Bug Fixes

* **install:** Update installer to add lint-js script ([62e8ea9](https://github.com/pixelastic/aberlaas/commit/62e8ea964c4959ca51d99c8a666aa1b9c12c98fc))
* **release:** Allow releasing a specific patch/minor/major ([16dc1df](https://github.com/pixelastic/aberlaas/commit/16dc1df80120ad332786bf5248ffbfc6481b0700))
* **test:** Make sure we return an array of path and not a string ([e4a16ec](https://github.com/pixelastic/aberlaas/commit/e4a16ecca5bbe007f5c76671498a9f2b481ee5f4))
* **test:** Run test on host dir by default ([c41ef64](https://github.com/pixelastic/aberlaas/commit/c41ef64c2dfafedd0629fffe7ff7faf33d01aa8e))


### Features

* **lint:** Add linting of CSS files through Stylelint ([8f49aca](https://github.com/pixelastic/aberlaas/commit/8f49acaf76647b1bc536a0df87c3370cdc6db378))
* **lint:** Allow linting of JSON files as well ([4401ca0](https://github.com/pixelastic/aberlaas/commit/4401ca0f28aec47a181aa5677a9d3862103ccace))
* **lint:** Better finding of js/json files for linting ([c093cc4](https://github.com/pixelastic/aberlaas/commit/c093cc4d0d0e0586600170434fa739f3d05d0ea2))
* **lint:** Fixes CSS files ([5940d29](https://github.com/pixelastic/aberlaas/commit/5940d295dd0c3c3bd7c7151030ea14cccdab9928))
* **lint:** Update stylelint rules ([2190bfd](https://github.com/pixelastic/aberlaas/commit/2190bfd59511598f3363dd6f4310776ffc4777f0))



## [0.0.39](https://github.com/pixelastic/aberlaas/compare/0.0.38...0.0.39) (2019-06-21)


### Bug Fixes

* **lint:** Allow double quotes if contains single quote ([a9478aa](https://github.com/pixelastic/aberlaas/commit/a9478aa020b710662b0b24f9d01d6895ff82aed0))



## [0.0.38](https://github.com/pixelastic/aberlaas/compare/0.0.37...0.0.38) (2019-06-21)


### Features

* **lint:** Disable some ESLint/Jest rules ([d587d45](https://github.com/pixelastic/aberlaas/commit/d587d45f248eb17cfea8a7b8c99f9a2752fe3470))



## [0.0.37](https://github.com/pixelastic/aberlaas/compare/0.0.36...0.0.37) (2019-06-20)


### Bug Fixes

* **lint:** Exclude build, node_modules and tmp from watch at any depth ([0ce9fa5](https://github.com/pixelastic/aberlaas/commit/0ce9fa56fe2d02522db43797545a9243c81be2d7))



## [0.0.36](https://github.com/pixelastic/aberlaas/compare/0.0.35...0.0.36) (2019-06-19)



## [0.0.35](https://github.com/pixelastic/aberlaas/compare/0.0.34...0.0.35) (2019-06-19)


### Features

* **eslint:** Allow indentation in JSDoc ([782ee83](https://github.com/pixelastic/aberlaas/commit/782ee83d2bdf6d7127af32dbef8bf24c1b272ea3))



## [0.0.34](https://github.com/pixelastic/aberlaas/compare/0.0.33...0.0.34) (2019-06-19)


### Bug Fixes

* **eslint:** Allow type 'promise' ([7680b7a](https://github.com/pixelastic/aberlaas/commit/7680b7a204ea6268f1907ea5da51ff8c8804bad0))



## [0.0.33](https://github.com/pixelastic/aberlaas/compare/0.0.32...0.0.33) (2019-06-19)


### Features

* **jsdoc:** Adding linting of JSDoc back ([c8d915d](https://github.com/pixelastic/aberlaas/commit/c8d915d6a24a5ba57f34970b82edfef73f52fee9))



## [0.0.32](https://github.com/pixelastic/aberlaas/compare/0.0.31...0.0.32) (2019-06-18)


### Features

* **lint:** Allow passing custom config file to lint script ([adb4b57](https://github.com/pixelastic/aberlaas/commit/adb4b57bc77b5a9d9d73726a13545fd061d92367))



## [0.0.31](https://github.com/pixelastic/aberlaas/compare/0.0.30...0.0.31) (2019-06-18)


### Bug Fixes

* **lint:** Expand input globs for lint command ([73f585f](https://github.com/pixelastic/aberlaas/commit/73f585fb66ae658c1a81d31707262937f1294ca0))



## [0.0.30](https://github.com/pixelastic/aberlaas/compare/0.0.29...0.0.30) (2019-06-14)


### Features

* **eslint:** Ignore line-length because of strings ([96ab7af](https://github.com/pixelastic/aberlaas/commit/96ab7af5abfdce5c53b0d652ef8269793ff07c06))



## [0.0.29](https://github.com/pixelastic/aberlaas/compare/0.0.28...0.0.29) (2019-06-14)


### Bug Fixes

* **lint:** Actually lint files ([f7adfd4](https://github.com/pixelastic/aberlaas/commit/f7adfd41fb74623beb4083b7b0b761bef013fedb))



## [0.0.28](https://github.com/pixelastic/aberlaas/compare/0.0.27...0.0.28) (2019-06-14)



## [0.0.27](https://github.com/pixelastic/aberlaas/compare/0.0.26...0.0.27) (2019-06-13)


### Bug Fixes

* **build:** Fix own build script ([fc112ad](https://github.com/pixelastic/aberlaas/commit/fc112ad8fa9dac1a10119438d2cfea0fe2ec45d0))



## [0.0.26](https://github.com/pixelastic/aberlaas/compare/0.0.25...0.0.26) (2019-06-11)


### Bug Fixes

* **deps:** Load firost directly ([142e630](https://github.com/pixelastic/aberlaas/commit/142e6305e4694eb3c541cb82025d045d3b613461))



## [0.0.25](https://github.com/pixelastic/aberlaas/compare/0.0.24...0.0.25) (2019-06-11)



## [0.0.24](https://github.com/pixelastic/aberlaas/compare/0.0.23...0.0.24) (2019-06-11)



## [0.0.23](https://github.com/pixelastic/aberlaas/compare/0.0.22...0.0.23) (2019-05-02)



## [0.0.22](https://github.com/pixelastic/aberlaas/compare/0.0.21...0.0.22) (2019-04-24)



## [0.0.21](https://github.com/pixelastic/aberlaas/compare/0.0.20...0.0.21) (2019-04-23)



## [0.0.20](https://github.com/pixelastic/aberlaas/compare/0.0.19...0.0.20) (2018-12-23)



## [0.0.19](https://github.com/pixelastic/aberlaas/compare/0.0.18...0.0.19) (2018-12-23)



## [0.0.18](https://github.com/pixelastic/aberlaas/compare/0.0.17...0.0.18) (2018-12-21)


### Bug Fixes

* **tests:** Stop watching files in ./tmp, ./node_modules and ./build ([3ade66f](https://github.com/pixelastic/aberlaas/commit/3ade66f858f0b6b90ca86d818fa1253e7abebd2d))



## [0.0.17](https://github.com/pixelastic/aberlaas/compare/0.0.16...0.0.17) (2018-12-21)



## [0.0.16](https://github.com/pixelastic/aberlaas/compare/0.0.15...0.0.16) (2018-12-21)


### Bug Fixes

* **babel:** Use babel.config.js instead of .babelrc.js ([e57ac69](https://github.com/pixelastic/aberlaas/commit/e57ac693385343f7f91a9ad3c2c36ff6042879c8))


### Features

* **release:** Allow passing the semver part to update in release ([3418b6a](https://github.com/pixelastic/aberlaas/commit/3418b6a3d781f01cf55a41266a9b1cb48afdfb68))



## [0.0.15](https://github.com/pixelastic/aberlaas/compare/0.0.14...0.0.15) (2018-11-30)


### Bug Fixes

* **templates:** Templates correctly reference build files ([bb80093](https://github.com/pixelastic/aberlaas/commit/bb80093635a232ac128e42f7905648453b5e8713))



## [0.0.14](https://github.com/pixelastic/aberlaas/compare/0.0.13...0.0.14) (2018-11-28)


### Bug Fixes

* **lint:** Fix hidden js files ([4e2db79](https://github.com/pixelastic/aberlaas/commit/4e2db7959a0e901be6fc26df7c705b44f355a0ca))



## [0.0.13](https://github.com/pixelastic/aberlaas/compare/0.0.12...0.0.13) (2018-11-28)


### Features

* **husky:** Eat our own dog food and use husky ([1c912dc](https://github.com/pixelastic/aberlaas/commit/1c912dc86f2ce656ba51f0fde972ddc897ddc3eb))



## [0.0.12](https://github.com/pixelastic/aberlaas/compare/0.0.11...0.0.12) (2018-11-16)


### Bug Fixes

* **lint:** Correctly exit with error code if linting fails ([5a62573](https://github.com/pixelastic/aberlaas/commit/5a625734ca37ed42dfe74c7dab68eb4f4ce016d4))



## [0.0.11](https://github.com/pixelastic/aberlaas/compare/0.0.10...0.0.11) (2018-11-15)


### Bug Fixes

* **test:** Don't fail if no tests defined ([aad27dc](https://github.com/pixelastic/aberlaas/commit/aad27dc09fb55fd6e953c8bbde1bd77ed95401c8))



## [0.0.10](https://github.com/pixelastic/aberlaas/compare/0.0.9...0.0.10) (2018-11-15)



## [0.0.9](https://github.com/pixelastic/aberlaas/compare/0.0.8...0.0.9) (2018-11-07)



## [0.0.8](https://github.com/pixelastic/aberlaas/compare/0.0.7...0.0.8) (2018-11-05)



## [0.0.7](https://github.com/pixelastic/aberlaas/compare/0.0.6...0.0.7) (2018-11-03)



## [0.0.6](https://github.com/pixelastic/aberlaas/compare/0.0.5...0.0.6) (2018-11-03)



## [0.0.5](https://github.com/pixelastic/aberlaas/compare/0.0.4...0.0.5) (2018-11-02)



## [0.0.4](https://github.com/pixelastic/aberlaas/compare/0.0.3...0.0.4) (2018-11-02)



## [0.0.3](https://github.com/pixelastic/aberlaas/compare/0.0.2...0.0.3) (2018-10-31)



## 0.0.2 (2018-10-29)