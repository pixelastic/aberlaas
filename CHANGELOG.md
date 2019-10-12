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

