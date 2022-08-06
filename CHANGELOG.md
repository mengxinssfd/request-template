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




