## [2.2.1](https://github.com/mengxinssfd/request-template/compare/v2.2.0...v2.2.1) (2023-05-07)


### Bug Fixes

* simplifyMethodFactory method为大写的get时，data不会转换为params ([6bdad60](https://github.com/mengxinssfd/request-template/commit/6bdad6050bdba72a449c89b96627221f308acf0b))
* **vue3-hooks:** 请求失败时未为data设置为默认值 ([324669c](https://github.com/mengxinssfd/request-template/commit/324669c2dfd0afe6fd40c8f471e0e3f8162fe4b7))


### Features

* **react-hooks:** 新增 ([109c497](https://github.com/mengxinssfd/request-template/commit/109c497af02d0ce8566de0c2b606ee65f159cede))
* **vue3-hooks:** 添加loadingThreshold阈值，设置后需要在请求成功一段时间后loading才设置为false，不和data同步 ([8d65a18](https://github.com/mengxinssfd/request-template/commit/8d65a1826248c92d1d1e761e0086c5f6c0103857))



# [2.2.0](https://github.com/mengxinssfd/request-template/compare/v2.1.0...v2.2.0) (2023-03-15)


### Features

* **vue3-hooks:** data必须是数组 ([23fe3f9](https://github.com/mengxinssfd/request-template/commit/23fe3f94a59019eda35b9f0b40b2dbf6b64fe780))
* **vue3-hooks:** 移除内部debounce/throttle，并使用setInnerRequest代替 ([84643e6](https://github.com/mengxinssfd/request-template/commit/84643e6b727edeffe2c9cfdf84985d213abe47b2))


### BREAKING CHANGES

* **vue3-hooks:** data从原请求函数的第一个参数改为全部参数组成的数组
* **vue3-hooks:** 移除了内部debounce/throttle



# [2.1.0](https://github.com/mengxinssfd/request-template/compare/v2.0.2...v2.1.0) (2023-03-10)


### Bug Fixes

* **vue3-hooks:** debounce ([7486b25](https://github.com/mengxinssfd/request-template/commit/7486b2557420d08d01405111fae7babd3ab21032))



## [2.0.2](https://github.com/mengxinssfd/request-template/compare/v2.0.1...v2.0.2) (2023-03-09)


### Bug Fixes

* **RequestTemplate:** 开启retry-修复请求成功但statusHandler返回Promise.reject不会触发retry ([c1ceffa](https://github.com/mengxinssfd/request-template/commit/c1ceffa0e3d4954132d823a50befbbb2ecba3e6d))


### Features

* **RequestTemplate:** request添加类型重载，json与非json分开 ([952ad90](https://github.com/mengxinssfd/request-template/commit/952ad90a738d794c8d3f3c8aee642800d251ded9))
* **vue3-hooks:** debounce/throttle，内置防抖节流 ([7126f7b](https://github.com/mengxinssfd/request-template/commit/7126f7ba6069258deb7f5fabdb81fe0f090d0180)), closes [#39](https://github.com/mengxinssfd/request-template/issues/39)



## [2.0.1](https://github.com/mengxinssfd/request-template/compare/v2.0.0...v2.0.1) (2022-10-30)


### Bug Fixes

* **AxiosRequestTemplate:** isCancel和handleCanceler使用的不是子类的static axios，而是用的AxiosRequestTemplate的static axios ([c833a0b](https://github.com/mengxinssfd/request-template/commit/c833a0b3e3cefb32c8054c1bab5d4133fc7d1bbe))
* **wechat:** types ([a9b5952](https://github.com/mengxinssfd/request-template/commit/a9b5952ce29ac0c8ea74788c9e62ae4913b1bb37))


### Features

* wechat ([64b23dc](https://github.com/mengxinssfd/request-template/commit/64b23dc2ba459e9a078fc81b89db61c7e8bebfc9))



# [2.0.0](https://github.com/mengxinssfd/request-template/compare/v2.0.0-beta.3...v2.0.0) (2022-10-29)


### Bug Fixes

* 移除dataDriver ([3f4a1aa](https://github.com/mengxinssfd/request-template/commit/3f4a1aa332008c8e051d71f0938428baa4fac60d))



# [2.0.0-beta.3](https://github.com/mengxinssfd/request-template/compare/v2.0.0-beta.2...v2.0.0-beta.3) (2022-10-29)


### Bug Fixes

* 移除"typings": "src",否则用的时候tsc检查会检查到包里面去 ([23ae676](https://github.com/mengxinssfd/request-template/commit/23ae676c4d9da8bff07ac7e38d0f6559a6b0ba75))


### Reverts

* Revert "fix: types" ([37c3f77](https://github.com/mengxinssfd/request-template/commit/37c3f77772a241c6bb148cf34a71296bab6e8ee3))



# [2.0.0-beta.2](https://github.com/mengxinssfd/request-template/compare/v2.0.0-beta.1...v2.0.0-beta.2) (2022-10-29)


### Bug Fixes

* types ([03722d2](https://github.com/mengxinssfd/request-template/commit/03722d2a5a549f288b5074ffc916b81c236b11e5))



# [2.0.0-beta.1](https://github.com/mengxinssfd/request-template/compare/v2.0.0-beta.0...v2.0.0-beta.1) (2022-10-29)


### Features

* vue3-hooks ([15bd965](https://github.com/mengxinssfd/request-template/commit/15bd965280498de4ceb8aed616b8f1adc8bba5d8))



# [2.0.0-beta.0](https://github.com/mengxinssfd/request-template/compare/v1.0.0...v2.0.0-beta.0) (2022-10-28)


### Code Refactoring

* 使用monorepo结构重构项目 ([82cf611](https://github.com/mengxinssfd/request-template/commit/82cf61167265e7da10e942f56f3a054d2b35b936))


### BREAKING CHANGES

* AxiosRequestTemplate从request-template包独立出来为@request-template/axios包



# [1.0.0](https://github.com/mengxinssfd/request-template/compare/v1.0.0-beta.13...v1.0.0) (2022-10-27)



# [1.0.0-beta.13](https://github.com/mengxinssfd/request-template/compare/v1.0.0-beta.12...v1.0.0-beta.13) (2022-10-27)


### Features

* **AxiosRequestTemplate:** useAxios内'AxiosRequestTemplate.axios = axios;'改为'this.axios = axios;'也就是说子类也可以设置axios能够覆盖父类的axios，init时如果检测到未传入axios将抛出错误 ([ad0f9dd](https://github.com/mengxinssfd/request-template/commit/ad0f9dd921ef014eb4445de258e0494ba09819fd))
* peerDependencies axios ([48f872c](https://github.com/mengxinssfd/request-template/commit/48f872cdac8ebec1c4c913437507b7b56c48e66e))



# [1.0.0-beta.12](https://github.com/mengxinssfd/request-template/compare/v1.0.0-beta.11...v1.0.0-beta.12) (2022-10-27)



# [1.0.0-beta.11](https://github.com/mengxinssfd/request-template/compare/v1.0.0-beta.10...v1.0.0-beta.11) (2022-10-24)


### Features

* 从AxiosRequestTemplate类中抽象出RequestTemplate类，以后非axios可以直接继承实现RequestTemplate ([e66947f](https://github.com/mengxinssfd/request-template/commit/e66947f4d55e38c160f03c5962e303d02a5a7fbc))



# [1.0.0-beta.10](https://github.com/mengxinssfd/request-template/compare/v1.0.0-beta.9...v1.0.0-beta.10) (2022-08-16)


### Features

* **AxiosRequestTemplate.ts:** 新增`clearCache`删除所有缓存的功能 ([9600200](https://github.com/mengxinssfd/request-template/commit/9600200a0be337e16656f289eb5062e3b0ee6ad7))
* **AxiosRequestTemplate.ts:** 新增`deleteCacheByTag`通过tag删除缓存的功能 ([b4509ca](https://github.com/mengxinssfd/request-template/commit/b4509ca183063ea6d6c8170b2d89f3c930bb2012))
* **Cache.ts:** 新增`clear`删除所有缓存的功能 ([81b0bfd](https://github.com/mengxinssfd/request-template/commit/81b0bfda54b93cec742405c060cd39c6f9c45e0f))
* **Cache.ts:** 新增`deleteByTag`通过tag删除缓存的功能 ([fcea8fc](https://github.com/mengxinssfd/request-template/commit/fcea8fc7a180c3576df5ea5e2a0a75e5f8c05f05))
* **types.ts:** Tag抽取出来做为一个独立的类型 ([087230f](https://github.com/mengxinssfd/request-template/commit/087230ff9a0343ebd9d832605cf1d18f8c01e1ed))



# 1.0.0-beta.9 (2022-08-15)


### Bug Fixes

* build:cjs es版本太高导致class里面的属性不被小程序识别 ([a2245db](https://github.com/mengxinssfd/request-template/commit/a2245db091625fedcf1115ae34ee2dfe0d3f641e))
* cache ([76bcc21](https://github.com/mengxinssfd/request-template/commit/76bcc215b620e7c8c3c1a5f5eff15f804b096bbb))
* generateRequestKey data ([f9175a2](https://github.com/mengxinssfd/request-template/commit/f9175a29b7230c37a188ab131e82526cfe09fdb5))
* npm files ([429400c](https://github.com/mengxinssfd/request-template/commit/429400cd7696379b77aa2db628909b411c7f36af))
* npm types缺失 ([3bf815b](https://github.com/mengxinssfd/request-template/commit/3bf815bda5e674f79a235b407ec16e2db1f44fff))
* npm types缺失 ([e633585](https://github.com/mengxinssfd/request-template/commit/e633585f20b4ce50d6689e8b4d1778ff6ece484d))
* simplifyMethodFactory method未传进request ([980f2d0](https://github.com/mengxinssfd/request-template/commit/980f2d07ac4087db5bb50ca13081c0c2616db4cc))
* typings ([cf2d45e](https://github.com/mengxinssfd/request-template/commit/cf2d45ea0e82d13db831a0c5ee71b4bf8621c789))


### Features

* cacheFailedReq默认清理掉失败的缓存 ([4f3c2a8](https://github.com/mengxinssfd/request-template/commit/4f3c2a807d5acb521c82807be5aa60f53c7373fc))
* cacheFailedReq默认清理掉失败的缓存 ([98af78e](https://github.com/mengxinssfd/request-template/commit/98af78ecf584d9806dfee3970907717e16ccf40e))
* **handleStatus:** 不再需要手动实现返回AxiosResponse还是ResType ([fed1b52](https://github.com/mengxinssfd/request-template/commit/fed1b52e4d08c3aebceda46da614bb53e50209b1))
* **init:** 完成 ([b70bc39](https://github.com/mengxinssfd/request-template/commit/b70bc390fa75e67c104c22edda95de05648f1d76))
* isCancel ([a57b3b8](https://github.com/mengxinssfd/request-template/commit/a57b3b8bf115f7dcb919e8d6d4e1771121e85e54))
* methodFactory第二个参数接收函数可以改配置；新增use ([e4cce6d](https://github.com/mengxinssfd/request-template/commit/e4cce6dbb465662d02cf364573a94d7b0fabf957))
* methodFactory第二个参数接收函数可以改配置；新增use ([7a7fd00](https://github.com/mengxinssfd/request-template/commit/7a7fd00acbae348c613a490d5481977b6facfa29))
* **publish:** update npm ignore ([512da2c](https://github.com/mengxinssfd/request-template/commit/512da2c36b8b5de990e8d3c1cfd3ee9e4aae5be3))
* retry ([d1811b0](https://github.com/mengxinssfd/request-template/commit/d1811b002f48807115bc31a91875dd59c0da91b1))
* retry阶段请求不再计入缓存，而是外面那层计入缓存 ([4ea005e](https://github.com/mengxinssfd/request-template/commit/4ea005ed7b302e72544ccc46106de685083123a9))
* simplifyMethodFactory ([d391a84](https://github.com/mengxinssfd/request-template/commit/d391a847794425fe29ce1bafc6830fcad1b23eeb))
* tag ([5ddd489](https://github.com/mengxinssfd/request-template/commit/5ddd489d9e8631075504699c01559d456c391f29))
* **tag:** 支持使用symbol作为tag ([4986b71](https://github.com/mengxinssfd/request-template/commit/4986b7104ea55506476f2f3f0a8b1c8a396fb347))
* v0.0.6 ([1e8eceb](https://github.com/mengxinssfd/request-template/commit/1e8eceb9b58c5093535b4ab1f3c960211ee6b2d6))
* 从`handleCanceler`中抽离出`registerCanceler`,方便不用`axios`的项目重写 ([92ac4f7](https://github.com/mengxinssfd/request-template/commit/92ac4f73acac42a045f6deac8978011c865a9b50))
* **优化:** Cache支持扩展 ([21de450](https://github.com/mengxinssfd/request-template/commit/21de4507f2efdbdc960359699dee70af35695246))
* **优化:** requestConfig、customConfig提升到类成员属性，各个方法不再接收配置参数；全局配置由private改为protected；StatusHandler接收requestConfig；request方法的requestConfig的ts类型里剔除掉几个属性 ([4224e31](https://github.com/mengxinssfd/request-template/commit/4224e314bcf0463ce58261dd8fd2fc71dd185bb0))
* **优化:** 为了扩展性 constructor部分步骤移动到init方法 ([331c7af](https://github.com/mengxinssfd/request-template/commit/331c7af69183e2ba8f1d207d48520c2d7603a991))
* **优化:** 使用context代替原来的customConfig requestConfig类属性 ([4bc9cdc](https://github.com/mengxinssfd/request-template/commit/4bc9cdc3c9f7a4ff510fe1d4c7e1b80b56fe6e52))
* **优化:** 修复cancelCurrentRequest会多调一次的问题 ([8b64c77](https://github.com/mengxinssfd/request-template/commit/8b64c77c8aff22fb363398605ff20420f3049582))
* **优化:** 取消当前请求；取消全部请求 ([23d01d1](https://github.com/mengxinssfd/request-template/commit/23d01d1e570b3620ecb620c4ed1e5d29f47b5741))
* **优化:** 调整cache配置，让其部分参数可以全局配置 ([0c3099e](https://github.com/mengxinssfd/request-template/commit/0c3099ea37cf7ab5d52b8b908dcfba9a8846c718))
* 全部模块都是可替换的 ([499f978](https://github.com/mengxinssfd/request-template/commit/499f978354776876f4197b24ae97d5a2cf56ae93))
* 完善模块加载方式 ([daf40ca](https://github.com/mengxinssfd/request-template/commit/daf40cafe5eb80a9d31a6f7be61a618a3b7e3d3c))
* **实现:** 完成 ([cb4aefe](https://github.com/mengxinssfd/request-template/commit/cb4aefe000e6477a5f00d64d810a76490e1b0b84))
* 改名为RequestTemplate ([e5899c5](https://github.com/mengxinssfd/request-template/commit/e5899c5136dfe3615124be4c27a87fdb07f640fc))
* 新增缓存刷新功能，只要刷新一次缓存，那么之前的相同key的缓存就作废 ([6a3d604](https://github.com/mengxinssfd/request-template/commit/6a3d60452e71db9c4cdcb77d88aadd631a52b567))
* **测试:** babel + script ([4a98181](https://github.com/mengxinssfd/request-template/commit/4a981815b79ebf585cbcf15e2fd8aa762ece790e))
* **测试:** jest testEnvironment: 'jsdom' ([d3f96e3](https://github.com/mengxinssfd/request-template/commit/d3f96e3bbd67252eaefbe327712323e026bf8c1e))
* **测试:** 未完 ([b4dc369](https://github.com/mengxinssfd/request-template/commit/b4dc369f38400fe173ff8dec62203a3ce13f69d2))
* **测试:** 未完待续 ([f0524b2](https://github.com/mengxinssfd/request-template/commit/f0524b2faa67009b1c548e16eea9f2e48b9d30bd))
* **测试:** 测试并修复完成 ([5811c58](https://github.com/mengxinssfd/request-template/commit/5811c58a627a037b817f2171c43d172a508c1dd7))
* 脱离axios ([46a46b7](https://github.com/mengxinssfd/request-template/commit/46a46b726ca9fa2b68db63e4aa9b664dc34fe200))
* **重构:** cancelerMap改为cancelerSet；Context添加clearSet；重构retry；jest环境改为node ([4671e88](https://github.com/mengxinssfd/request-template/commit/4671e88e1770520a9f57ee49e77dbc9233706706))
* **重构:** Context移除requestKey，不再生成公共key；添加beforeRequest，handleCanceler移动到beforeRequest ([291857a](https://github.com/mengxinssfd/request-template/commit/291857a9a1d8d4f624c0bc367735641a4ee3ec70))
* **重构:** params不能去除 handleRequestData和generateRequestKey的执行顺序调换 ([b5c7f29](https://github.com/mengxinssfd/request-template/commit/b5c7f299b19f7ebfbb7de04cc0ab881f61479c08))
* **重构:** 测试重试成功 ([dcc1876](https://github.com/mengxinssfd/request-template/commit/dcc1876b6c7cdee880a35339a7f2fffaa3577196))
* 页面请求缓慢，然后开启了缓存并且取消了该请求，那么删除该请求缓存 ([4b0b7ce](https://github.com/mengxinssfd/request-template/commit/4b0b7cebde71e3423f0e14b16291dca5e56961a6))


### BREAKING CHANGES

* 不在主动引入axios，使用时需要手动AxiosRequestTemplate.useAxios(axios)



# 1.0.0-beta.8 (2022-08-11)


### Bug Fixes

* build:cjs es版本太高导致class里面的属性不被小程序识别 ([a2245db](https://github.com/mengxinssfd/request-template/commit/a2245db091625fedcf1115ae34ee2dfe0d3f641e))
* cache ([76bcc21](https://github.com/mengxinssfd/request-template/commit/76bcc215b620e7c8c3c1a5f5eff15f804b096bbb))
* generateRequestKey data ([f9175a2](https://github.com/mengxinssfd/request-template/commit/f9175a29b7230c37a188ab131e82526cfe09fdb5))
* npm files ([429400c](https://github.com/mengxinssfd/request-template/commit/429400cd7696379b77aa2db628909b411c7f36af))
* npm types缺失 ([3bf815b](https://github.com/mengxinssfd/request-template/commit/3bf815bda5e674f79a235b407ec16e2db1f44fff))
* npm types缺失 ([e633585](https://github.com/mengxinssfd/request-template/commit/e633585f20b4ce50d6689e8b4d1778ff6ece484d))
* simplifyMethodFactory method未传进request ([980f2d0](https://github.com/mengxinssfd/request-template/commit/980f2d07ac4087db5bb50ca13081c0c2616db4cc))
* typings ([cf2d45e](https://github.com/mengxinssfd/request-template/commit/cf2d45ea0e82d13db831a0c5ee71b4bf8621c789))


### Features

* cacheFailedReq默认清理掉失败的缓存 ([4f3c2a8](https://github.com/mengxinssfd/request-template/commit/4f3c2a807d5acb521c82807be5aa60f53c7373fc))
* cacheFailedReq默认清理掉失败的缓存 ([98af78e](https://github.com/mengxinssfd/request-template/commit/98af78ecf584d9806dfee3970907717e16ccf40e))
* **handleStatus:** 不再需要手动实现返回AxiosResponse还是ResType ([fed1b52](https://github.com/mengxinssfd/request-template/commit/fed1b52e4d08c3aebceda46da614bb53e50209b1))
* **init:** 完成 ([b70bc39](https://github.com/mengxinssfd/request-template/commit/b70bc390fa75e67c104c22edda95de05648f1d76))
* isCancel ([a57b3b8](https://github.com/mengxinssfd/request-template/commit/a57b3b8bf115f7dcb919e8d6d4e1771121e85e54))
* methodFactory第二个参数接收函数可以改配置；新增use ([e4cce6d](https://github.com/mengxinssfd/request-template/commit/e4cce6dbb465662d02cf364573a94d7b0fabf957))
* methodFactory第二个参数接收函数可以改配置；新增use ([7a7fd00](https://github.com/mengxinssfd/request-template/commit/7a7fd00acbae348c613a490d5481977b6facfa29))
* **publish:** update npm ignore ([512da2c](https://github.com/mengxinssfd/request-template/commit/512da2c36b8b5de990e8d3c1cfd3ee9e4aae5be3))
* retry ([d1811b0](https://github.com/mengxinssfd/request-template/commit/d1811b002f48807115bc31a91875dd59c0da91b1))
* retry阶段请求不再计入缓存，而是外面那层计入缓存 ([4ea005e](https://github.com/mengxinssfd/request-template/commit/4ea005ed7b302e72544ccc46106de685083123a9))
* simplifyMethodFactory ([d391a84](https://github.com/mengxinssfd/request-template/commit/d391a847794425fe29ce1bafc6830fcad1b23eeb))
* tag ([5ddd489](https://github.com/mengxinssfd/request-template/commit/5ddd489d9e8631075504699c01559d456c391f29))
* **tag:** 支持使用symbol作为tag ([4986b71](https://github.com/mengxinssfd/request-template/commit/4986b7104ea55506476f2f3f0a8b1c8a396fb347))
* v0.0.6 ([1e8eceb](https://github.com/mengxinssfd/request-template/commit/1e8eceb9b58c5093535b4ab1f3c960211ee6b2d6))
* 从`handleCanceler`中抽离出`registerCanceler`,方便不用`axios`的项目重写 ([92ac4f7](https://github.com/mengxinssfd/request-template/commit/92ac4f73acac42a045f6deac8978011c865a9b50))
* **优化:** Cache支持扩展 ([21de450](https://github.com/mengxinssfd/request-template/commit/21de4507f2efdbdc960359699dee70af35695246))
* **优化:** requestConfig、customConfig提升到类成员属性，各个方法不再接收配置参数；全局配置由private改为protected；StatusHandler接收requestConfig；request方法的requestConfig的ts类型里剔除掉几个属性 ([4224e31](https://github.com/mengxinssfd/request-template/commit/4224e314bcf0463ce58261dd8fd2fc71dd185bb0))
* **优化:** 为了扩展性 constructor部分步骤移动到init方法 ([331c7af](https://github.com/mengxinssfd/request-template/commit/331c7af69183e2ba8f1d207d48520c2d7603a991))
* **优化:** 使用context代替原来的customConfig requestConfig类属性 ([4bc9cdc](https://github.com/mengxinssfd/request-template/commit/4bc9cdc3c9f7a4ff510fe1d4c7e1b80b56fe6e52))
* **优化:** 修复cancelCurrentRequest会多调一次的问题 ([8b64c77](https://github.com/mengxinssfd/request-template/commit/8b64c77c8aff22fb363398605ff20420f3049582))
* **优化:** 取消当前请求；取消全部请求 ([23d01d1](https://github.com/mengxinssfd/request-template/commit/23d01d1e570b3620ecb620c4ed1e5d29f47b5741))
* **优化:** 调整cache配置，让其部分参数可以全局配置 ([0c3099e](https://github.com/mengxinssfd/request-template/commit/0c3099ea37cf7ab5d52b8b908dcfba9a8846c718))
* 全部模块都是可替换的 ([499f978](https://github.com/mengxinssfd/request-template/commit/499f978354776876f4197b24ae97d5a2cf56ae93))
* 完善模块加载方式 ([daf40ca](https://github.com/mengxinssfd/request-template/commit/daf40cafe5eb80a9d31a6f7be61a618a3b7e3d3c))
* **实现:** 完成 ([cb4aefe](https://github.com/mengxinssfd/request-template/commit/cb4aefe000e6477a5f00d64d810a76490e1b0b84))
* 改名为RequestTemplate ([e5899c5](https://github.com/mengxinssfd/request-template/commit/e5899c5136dfe3615124be4c27a87fdb07f640fc))
* **测试:** babel + script ([4a98181](https://github.com/mengxinssfd/request-template/commit/4a981815b79ebf585cbcf15e2fd8aa762ece790e))
* **测试:** jest testEnvironment: 'jsdom' ([d3f96e3](https://github.com/mengxinssfd/request-template/commit/d3f96e3bbd67252eaefbe327712323e026bf8c1e))
* **测试:** 未完 ([b4dc369](https://github.com/mengxinssfd/request-template/commit/b4dc369f38400fe173ff8dec62203a3ce13f69d2))
* **测试:** 未完待续 ([f0524b2](https://github.com/mengxinssfd/request-template/commit/f0524b2faa67009b1c548e16eea9f2e48b9d30bd))
* **测试:** 测试并修复完成 ([5811c58](https://github.com/mengxinssfd/request-template/commit/5811c58a627a037b817f2171c43d172a508c1dd7))
* 脱离axios ([46a46b7](https://github.com/mengxinssfd/request-template/commit/46a46b726ca9fa2b68db63e4aa9b664dc34fe200))
* **重构:** cancelerMap改为cancelerSet；Context添加clearSet；重构retry；jest环境改为node ([4671e88](https://github.com/mengxinssfd/request-template/commit/4671e88e1770520a9f57ee49e77dbc9233706706))
* **重构:** Context移除requestKey，不再生成公共key；添加beforeRequest，handleCanceler移动到beforeRequest ([291857a](https://github.com/mengxinssfd/request-template/commit/291857a9a1d8d4f624c0bc367735641a4ee3ec70))
* **重构:** params不能去除 handleRequestData和generateRequestKey的执行顺序调换 ([b5c7f29](https://github.com/mengxinssfd/request-template/commit/b5c7f299b19f7ebfbb7de04cc0ab881f61479c08))
* **重构:** 测试重试成功 ([dcc1876](https://github.com/mengxinssfd/request-template/commit/dcc1876b6c7cdee880a35339a7f2fffaa3577196))
* 页面请求缓慢，然后开启了缓存并且取消了该请求，那么删除该请求缓存 ([4b0b7ce](https://github.com/mengxinssfd/request-template/commit/4b0b7cebde71e3423f0e14b16291dca5e56961a6))


### BREAKING CHANGES

* 不在主动引入axios，使用时需要手动AxiosRequestTemplate.useAxios(axios)



# 1.0.0-beta.7 (2022-08-09)


### Features

* 完善模块加载方式 ([daf40ca](https://github.com/mengxinssfd/request-template/commit/daf40cafe5eb80a9d31a6f7be61a618a3b7e3d3c))


# 1.0.0-beta.6 (2022-08-09)


### Features

* 从`handleCanceler`中抽离出`registerCanceler`,方便不用`axios`的项目重写 ([92ac4f7](https://github.com/mengxinssfd/request-template/commit/92ac4f73acac42a045f6deac8978011c865a9b50))




# 1.0.0-beta.5 (2022-08-06)


### Bug Fixes

* build:cjs es版本太高导致class里面的属性不被小程序识别 ([a2245db](https://github.com/mengxinssfd/request-template/commit/a2245db091625fedcf1115ae34ee2dfe0d3f641e))


# 1.0.0-beta.1 (2022-08-06)


### Bug Fixes

* cache ([76bcc21](https://github.com/mengxinssfd/request-template/commit/76bcc215b620e7c8c3c1a5f5eff15f804b096bbb))
* generateRequestKey data ([f9175a2](https://github.com/mengxinssfd/request-template/commit/f9175a29b7230c37a188ab131e82526cfe09fdb5))
* npm files ([429400c](https://github.com/mengxinssfd/request-template/commit/429400cd7696379b77aa2db628909b411c7f36af))
* npm types缺失 ([3bf815b](https://github.com/mengxinssfd/request-template/commit/3bf815bda5e674f79a235b407ec16e2db1f44fff))
* npm types缺失 ([e633585](https://github.com/mengxinssfd/request-template/commit/e633585f20b4ce50d6689e8b4d1778ff6ece484d))
* simplifyMethodFactory method未传进request ([980f2d0](https://github.com/mengxinssfd/request-template/commit/980f2d07ac4087db5bb50ca13081c0c2616db4cc))


### Features

* cacheFailedReq默认清理掉失败的缓存 ([4f3c2a8](https://github.com/mengxinssfd/request-template/commit/4f3c2a807d5acb521c82807be5aa60f53c7373fc))
* cacheFailedReq默认清理掉失败的缓存 ([98af78e](https://github.com/mengxinssfd/request-template/commit/98af78ecf584d9806dfee3970907717e16ccf40e))
* **handleStatus:** 不再需要手动实现返回AxiosResponse还是ResType ([fed1b52](https://github.com/mengxinssfd/request-template/commit/fed1b52e4d08c3aebceda46da614bb53e50209b1))
* **init:** 完成 ([b70bc39](https://github.com/mengxinssfd/request-template/commit/b70bc390fa75e67c104c22edda95de05648f1d76))
* isCancel ([a57b3b8](https://github.com/mengxinssfd/request-template/commit/a57b3b8bf115f7dcb919e8d6d4e1771121e85e54))
* methodFactory第二个参数接收函数可以改配置；新增use ([e4cce6d](https://github.com/mengxinssfd/request-template/commit/e4cce6dbb465662d02cf364573a94d7b0fabf957))
* methodFactory第二个参数接收函数可以改配置；新增use ([7a7fd00](https://github.com/mengxinssfd/request-template/commit/7a7fd00acbae348c613a490d5481977b6facfa29))
* **publish:** update npm ignore ([512da2c](https://github.com/mengxinssfd/request-template/commit/512da2c36b8b5de990e8d3c1cfd3ee9e4aae5be3))
* retry ([d1811b0](https://github.com/mengxinssfd/request-template/commit/d1811b002f48807115bc31a91875dd59c0da91b1))
* retry阶段请求不再计入缓存，而是外面那层计入缓存 ([4ea005e](https://github.com/mengxinssfd/request-template/commit/4ea005ed7b302e72544ccc46106de685083123a9))
* simplifyMethodFactory ([d391a84](https://github.com/mengxinssfd/request-template/commit/d391a847794425fe29ce1bafc6830fcad1b23eeb))
* tag ([5ddd489](https://github.com/mengxinssfd/request-template/commit/5ddd489d9e8631075504699c01559d456c391f29))
* **tag:** 支持使用symbol作为tag ([4986b71](https://github.com/mengxinssfd/request-template/commit/4986b7104ea55506476f2f3f0a8b1c8a396fb347))
* v0.0.6 ([1e8eceb](https://github.com/mengxinssfd/request-template/commit/1e8eceb9b58c5093535b4ab1f3c960211ee6b2d6))
* **优化:** Cache支持扩展 ([21de450](https://github.com/mengxinssfd/request-template/commit/21de4507f2efdbdc960359699dee70af35695246))
* **优化:** requestConfig、customConfig提升到类成员属性，各个方法不再接收配置参数；全局配置由private改为protected；StatusHandler接收requestConfig；request方法的requestConfig的ts类型里剔除掉几个属性 ([4224e31](https://github.com/mengxinssfd/request-template/commit/4224e314bcf0463ce58261dd8fd2fc71dd185bb0))
* **优化:** 为了扩展性 constructor部分步骤移动到init方法 ([331c7af](https://github.com/mengxinssfd/request-template/commit/331c7af69183e2ba8f1d207d48520c2d7603a991))
* **优化:** 使用context代替原来的customConfig requestConfig类属性 ([4bc9cdc](https://github.com/mengxinssfd/request-template/commit/4bc9cdc3c9f7a4ff510fe1d4c7e1b80b56fe6e52))
* **优化:** 修复cancelCurrentRequest会多调一次的问题 ([8b64c77](https://github.com/mengxinssfd/request-template/commit/8b64c77c8aff22fb363398605ff20420f3049582))
* **优化:** 取消当前请求；取消全部请求 ([23d01d1](https://github.com/mengxinssfd/request-template/commit/23d01d1e570b3620ecb620c4ed1e5d29f47b5741))
* **优化:** 调整cache配置，让其部分参数可以全局配置 ([0c3099e](https://github.com/mengxinssfd/request-template/commit/0c3099ea37cf7ab5d52b8b908dcfba9a8846c718))
* 全部模块都是可替换的 ([499f978](https://github.com/mengxinssfd/request-template/commit/499f978354776876f4197b24ae97d5a2cf56ae93))
* **实现:** 完成 ([cb4aefe](https://github.com/mengxinssfd/request-template/commit/cb4aefe000e6477a5f00d64d810a76490e1b0b84))
* 改名为RequestTemplate ([e5899c5](https://github.com/mengxinssfd/request-template/commit/e5899c5136dfe3615124be4c27a87fdb07f640fc))
* **测试:** babel + script ([4a98181](https://github.com/mengxinssfd/request-template/commit/4a981815b79ebf585cbcf15e2fd8aa762ece790e))
* **测试:** jest testEnvironment: 'jsdom' ([d3f96e3](https://github.com/mengxinssfd/request-template/commit/d3f96e3bbd67252eaefbe327712323e026bf8c1e))
* **测试:** 未完 ([b4dc369](https://github.com/mengxinssfd/request-template/commit/b4dc369f38400fe173ff8dec62203a3ce13f69d2))
* **测试:** 未完待续 ([f0524b2](https://github.com/mengxinssfd/request-template/commit/f0524b2faa67009b1c548e16eea9f2e48b9d30bd))
* **测试:** 测试并修复完成 ([5811c58](https://github.com/mengxinssfd/request-template/commit/5811c58a627a037b817f2171c43d172a508c1dd7))
* 脱离axios ([46a46b7](https://github.com/mengxinssfd/request-template/commit/46a46b726ca9fa2b68db63e4aa9b664dc34fe200))
* **重构:** cancelerMap改为cancelerSet；Context添加clearSet；重构retry；jest环境改为node ([4671e88](https://github.com/mengxinssfd/request-template/commit/4671e88e1770520a9f57ee49e77dbc9233706706))
* **重构:** Context移除requestKey，不再生成公共key；添加beforeRequest，handleCanceler移动到beforeRequest ([291857a](https://github.com/mengxinssfd/request-template/commit/291857a9a1d8d4f624c0bc367735641a4ee3ec70))
* **重构:** params不能去除 handleRequestData和generateRequestKey的执行顺序调换 ([b5c7f29](https://github.com/mengxinssfd/request-template/commit/b5c7f299b19f7ebfbb7de04cc0ab881f61479c08))
* **重构:** 测试重试成功 ([dcc1876](https://github.com/mengxinssfd/request-template/commit/dcc1876b6c7cdee880a35339a7f2fffaa3577196))
* 页面请求缓慢，然后开启了缓存并且取消了该请求，那么删除该请求缓存 ([4b0b7ce](https://github.com/mengxinssfd/request-template/commit/4b0b7cebde71e3423f0e14b16291dca5e56961a6))


### BREAKING CHANGES

* 不在主动引入axios，使用时需要手动AxiosRequestTemplate.useAxios(axios)



# 1.0.0-beta.0 (2022-08-06)


### Features

* 脱离axios ([46a46b7](https://github.com/mengxinssfd/request-template/commit/46a46b726ca9fa2b68db63e4aa9b664dc34fe200))


### BREAKING CHANGES

* 不在主动引入axios，使用时需要手动AxiosRequestTemplate.useAxios(axios)


# 0.1.8 (2022-06-16)
### Bug Fixes

* cache ([76bcc21](https://github.com/mengxinssfd/request-template/commit/76bcc215b620e7c8c3c1a5f5eff15f804b096bbb))
* generateRequestKey data ([f9175a2](https://github.com/mengxinssfd/request-template/commit/f9175a29b7230c37a188ab131e82526cfe09fdb5))
* npm types缺失 ([3bf815b](https://github.com/mengxinssfd/request-template/commit/3bf815bda5e674f79a235b407ec16e2db1f44fff))
* npm types缺失 ([e633585](https://github.com/mengxinssfd/request-template/commit/e633585f20b4ce50d6689e8b4d1778ff6ece484d))
* simplifyMethodFactory method未传进request ([980f2d0](https://github.com/mengxinssfd/request-template/commit/980f2d07ac4087db5bb50ca13081c0c2616db4cc))


### Features

* cacheFailedReq默认清理掉失败的缓存 ([4f3c2a8](https://github.com/mengxinssfd/request-template/commit/4f3c2a807d5acb521c82807be5aa60f53c7373fc))
* cacheFailedReq默认清理掉失败的缓存 ([98af78e](https://github.com/mengxinssfd/request-template/commit/98af78ecf584d9806dfee3970907717e16ccf40e))
* **handleStatus:** 不再需要手动实现返回AxiosResponse还是ResType ([fed1b52](https://github.com/mengxinssfd/request-template/commit/fed1b52e4d08c3aebceda46da614bb53e50209b1))
* **init:** 完成 ([b70bc39](https://github.com/mengxinssfd/request-template/commit/b70bc390fa75e67c104c22edda95de05648f1d76))
* isCancel ([a57b3b8](https://github.com/mengxinssfd/request-template/commit/a57b3b8bf115f7dcb919e8d6d4e1771121e85e54))
* methodFactory第二个参数接收函数可以改配置；新增use ([e4cce6d](https://github.com/mengxinssfd/request-template/commit/e4cce6dbb465662d02cf364573a94d7b0fabf957))
* methodFactory第二个参数接收函数可以改配置；新增use ([7a7fd00](https://github.com/mengxinssfd/request-template/commit/7a7fd00acbae348c613a490d5481977b6facfa29))
* **publish:** update npm ignore ([512da2c](https://github.com/mengxinssfd/request-template/commit/512da2c36b8b5de990e8d3c1cfd3ee9e4aae5be3))
* retry ([d1811b0](https://github.com/mengxinssfd/request-template/commit/d1811b002f48807115bc31a91875dd59c0da91b1))
* retry阶段请求不再计入缓存，而是外面那层计入缓存 ([4ea005e](https://github.com/mengxinssfd/request-template/commit/4ea005ed7b302e72544ccc46106de685083123a9))
* simplifyMethodFactory ([d391a84](https://github.com/mengxinssfd/request-template/commit/d391a847794425fe29ce1bafc6830fcad1b23eeb))
* tag ([5ddd489](https://github.com/mengxinssfd/request-template/commit/5ddd489d9e8631075504699c01559d456c391f29))
* **tag:** 支持使用symbol作为tag ([4986b71](https://github.com/mengxinssfd/request-template/commit/4986b7104ea55506476f2f3f0a8b1c8a396fb347))
* v0.0.6 ([1e8eceb](https://github.com/mengxinssfd/request-template/commit/1e8eceb9b58c5093535b4ab1f3c960211ee6b2d6))
* **优化:** Cache支持扩展 ([21de450](https://github.com/mengxinssfd/request-template/commit/21de4507f2efdbdc960359699dee70af35695246))
* **优化:** requestConfig、customConfig提升到类成员属性，各个方法不再接收配置参数；全局配置由private改为protected；StatusHandler接收requestConfig；request方法的requestConfig的ts类型里剔除掉几个属性 ([4224e31](https://github.com/mengxinssfd/request-template/commit/4224e314bcf0463ce58261dd8fd2fc71dd185bb0))
* **优化:** 为了扩展性 constructor部分步骤移动到init方法 ([331c7af](https://github.com/mengxinssfd/request-template/commit/331c7af69183e2ba8f1d207d48520c2d7603a991))
* **优化:** 使用context代替原来的customConfig requestConfig类属性 ([4bc9cdc](https://github.com/mengxinssfd/request-template/commit/4bc9cdc3c9f7a4ff510fe1d4c7e1b80b56fe6e52))
* **优化:** 修复cancelCurrentRequest会多调一次的问题 ([8b64c77](https://github.com/mengxinssfd/request-template/commit/8b64c77c8aff22fb363398605ff20420f3049582))
* **优化:** 取消当前请求；取消全部请求 ([23d01d1](https://github.com/mengxinssfd/request-template/commit/23d01d1e570b3620ecb620c4ed1e5d29f47b5741))
* **优化:** 调整cache配置，让其部分参数可以全局配置 ([0c3099e](https://github.com/mengxinssfd/request-template/commit/0c3099ea37cf7ab5d52b8b908dcfba9a8846c718))
* 全部模块都是可替换的 ([499f978](https://github.com/mengxinssfd/request-template/commit/499f978354776876f4197b24ae97d5a2cf56ae93))
* **实现:** 完成 ([cb4aefe](https://github.com/mengxinssfd/request-template/commit/cb4aefe000e6477a5f00d64d810a76490e1b0b84))
* 改名为RequestTemplate ([e5899c5](https://github.com/mengxinssfd/request-template/commit/e5899c5136dfe3615124be4c27a87fdb07f640fc))
* **测试:** babel + script ([4a98181](https://github.com/mengxinssfd/request-template/commit/4a981815b79ebf585cbcf15e2fd8aa762ece790e))
* **测试:** jest testEnvironment: 'jsdom' ([d3f96e3](https://github.com/mengxinssfd/request-template/commit/d3f96e3bbd67252eaefbe327712323e026bf8c1e))
* **测试:** 未完 ([b4dc369](https://github.com/mengxinssfd/request-template/commit/b4dc369f38400fe173ff8dec62203a3ce13f69d2))
* **测试:** 未完待续 ([f0524b2](https://github.com/mengxinssfd/request-template/commit/f0524b2faa67009b1c548e16eea9f2e48b9d30bd))
* **测试:** 测试并修复完成 ([5811c58](https://github.com/mengxinssfd/request-template/commit/5811c58a627a037b817f2171c43d172a508c1dd7))
* **重构:** cancelerMap改为cancelerSet；Context添加clearSet；重构retry；jest环境改为node ([4671e88](https://github.com/mengxinssfd/request-template/commit/4671e88e1770520a9f57ee49e77dbc9233706706))
* **重构:** Context移除requestKey，不再生成公共key；添加beforeRequest，handleCanceler移动到beforeRequest ([291857a](https://github.com/mengxinssfd/request-template/commit/291857a9a1d8d4f624c0bc367735641a4ee3ec70))
* **重构:** params不能去除 handleRequestData和generateRequestKey的执行顺序调换 ([b5c7f29](https://github.com/mengxinssfd/request-template/commit/b5c7f299b19f7ebfbb7de04cc0ab881f61479c08))
* **重构:** 测试重试成功 ([dcc1876](https://github.com/mengxinssfd/request-template/commit/dcc1876b6c7cdee880a35339a7f2fffaa3577196))
* 页面请求缓慢，然后开启了缓存并且取消了该请求，那么删除该请求缓存 ([4b0b7ce](https://github.com/mengxinssfd/request-template/commit/4b0b7cebde71e3423f0e14b16291dca5e56961a6))




