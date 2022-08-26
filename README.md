# 前言

请求封装在网上很多，大致分为以下几种封装风格：

- 普通封装
- 类封装
- 装饰器封装
- 插件式封装
- hook式封装

网上最多的是普通封装，功能比较齐全，可以任意修改，但在我看来这种方式只是把一些代码写到一起，比较散乱缺少统合，用的时候需要复制粘贴代码，不太算真正意义上的封装。

类封装也挺常见的，而我所使用的也即是类封装。类封装有个优点：可以通过继承复用方法，且替换原类方法或在原类方法上添加逻辑也很方便。

装饰器封装比较少见，类似于`nestjs`那种使用方式，在类封装的基础上加上装饰器，不过这种方式有点局限性——只能在`ts`或构建环境中使用，不过如果你确定你的项目一定是在构建环境中写的话那也可以放心的使用。

插件式封装也挺少见的了，这种方式拓展性很强，模块相对独立，我也写了插件式封装，不过总感觉有点使用起来不是很方便，便不了了之了，或许以后可以优化一下。

hook式封装多见于`react`或`vue3`项目中，与框架和业务绑定较深，在`vue2`或原生微信小程序下就不好使用了，不过它与上面几个封装并不冲突，可以叠加使用。


# `request-template`

`request-template`是一款可复用可扩展的请求封装库。

- 基于 `axios` 的请求封装，该库使用模板方法模式实现，每一个步骤都可以被子类覆盖方便扩展，配置可复用；

- 它也像一个适配器：
  - 不与框架绑定：你可以用 vue 写的请求，也能在 react 甚至小程序上使用；
  - 也不与请求工具绑定：你可以用`axios`做为请求工具，也可以用`fetch`或`wx.request`；

- 这不是一个最终方案，不是说用了它就能什么都不用写了，但它能极大减少你的代码复杂度，提高代码的复用性，为你的最终方案提供支持；也方便移植。

它的配置可能相对来说会繁琐一点，但是之后修改和移植就会很方便了。


GitHub：[https://github.com/mengxinssfd/request-template](https://github.com/mengxinssfd/request-template)

欢迎 star、issue、pr

# 主要实现

- [x] 多模块支持
  - [x] `esm` 模块
  - [x] `cjs` 模块
- [x] 多环境支持
  - [x] `浏览器`
  - [x] `小程序`
  - [x] `node`
- [x] 开放式封装
  - [x] 对于继承扩展开放
  - [x] 对于使用时修改关闭
- [x] 模板方法模式实现
  - [x] 可实现自定义模板
  - [x] 可继承复用基础模板
- [x] 多实例
- [x] ts 类型支持
  - [x] 范型支持
  - [x] 原 axios 类型支持
- [x] 多状态处理
- [x] 接口缓存
  - [x] 自定义缓存命中规则
  - [x] 自定义缓存过期时间
  - [x] 是否缓存失败请求
- [x] 配置
  - [x] 全局配置(保持统一，复用配置)
  - [x] 局部配置(支持个性化配置{某些不按规范实现的接口})
- [x] 配置复用
  - [x] 继承复用
  - [x] 实例级复用
  - [x] api 级复用
- [x] 取消请求
  - [x] 取消单个请求
  - [x] 根据 tag 取消请求
  - [x] 取消所有请求
- [x] 请求失败重试
  - [x] 重试次数
  - [x] 延时重试
  - [x] 第一次重试立即启动（可选）
  - [x] 可中断重试
- [x] 测试覆盖率100%

# 流程

```mermaid
flowchart
MergeConfig[fa:fa-spinner 合并配置]
CreateTemplate[fa:fa-spinner 创建模板new AxiosRequestTemplate]
GlobalRequestConfig[全局请求配置]
GlobalCustomConfig[全局自定义配置]


CreateTemplate --> GlobalRequestConfig --> template实例
CreateTemplate --> GlobalCustomConfig --> template实例


template实例 --> request


request --> MergeConfig --> 使用缓存?

添加Canceler钩子 --> 这一步后才可以执行取消handler

使用缓存? --> |否| 请求开始 --> 添加Canceler钩子  --> 请求 -->  缓存请求  --> 请求成功?

使用缓存? --> |是| 命中缓存?

命中缓存?  --> |是| 使用缓存 --> 请求成功?
命中缓存?  --> |否| 请求开始


请求成功? --> |是| 处理请求结果
请求成功? --> |否| 请求被取消? --> |是| 清理该请求缓存 --> 结束retry --> 请求完成
请求被取消? --> |否| retry?

retry? --> |否| 处理请求结果
retry? --> |是| 添加清理钩子 --> 请求开始


处理请求结果 --> 处理状态 --> 请求完成 --> 清理钩子





```

# 安装

可以使用`npm` `cnpm` `yarn` `pnpm`等方式安装

```shell
pnpm add request-template
```

# 基础用法（使用默认模板）

## 零配置直接使用

这时约等于`axios({url})`

```ts
import axios from 'axios';
import { AxiosRequestTemplate } from 'request-template';

// 从v1.0.0开始不再内置axios，需要把axios传进去
AxiosRequestTemplate.useAxios(axios);
// new一个实例
const template = new AxiosRequestTemplate();

// request<T = never, RC extends boolean = false>(requestConfig: Omit<AxiosRequestConfig, 'cancelToken' | 'url'> & {
//        url: string;
//    }, customConfig?: DynamicCustomConfig<CC, RC>): Promise<RC extends true ? AxiosResponse<ResType<T>> : ResType<T>>;

// `request`支持2个参数分别是`axios`的请求设置`requestConfig`，以及自定义设置的`customConfig`
// `requestConfig`为`axios`原设置（除了cancelToken：有另外一套机制取消），具体参数可去axios官方查看配置
// `request`默认为`get`请求
template.request({ url: '/test', params: { param1: 1, param2: 2 } }).then((res) => {
  console.log(res);
});
// `post`请求，`delete` `patch`也是以此类推
template.request({ url: '/test', data: { param1: 1, param2: 2 }, method: 'post' }).then((res) => {
  console.log(res);
});
```

## 使用`methodFactory`方法生成一个`method`函数

上面使用每次都要设置`method`有些麻烦了，可以用`methodFactory`函数生成一个`method`函数简化一下

```ts
// 代码复用自'零配置直接使用'
// 'post','get','patch'...
const post = template.methodFactory('post');
post({ url: '/test', data: { param1: 1, param2: 2 } }).then((res) => {
  console.log(res);
});
post({ url: '/test', data: { param1: 1, param2: 2 } }).then((res) => {
  console.log(res);
});
```

注意：`methodFactory`生成的 `method`函数与 `request`参数返回值一致，且 `requestConfig`里的 `method`属性不再起作用

该方法第二个参数接收一个`handler`可以对配置进行一些处理，如设置一些公共 url 前缀等。

## 范型支持

```ts
// 代码复用自'零配置直接使用'
const post = template.methodFactory('post');

// 此时的res类型为{code:number; data:{username:string;id:number;}; msg:string;}
const res = await post<{ username: string; id: number }>({
  url: '/user',
  data: { param1: 1, param2: 2 },
});
```

自定义参数也支持范型约束以及提示，在此就不一一展示了

![type-support.png](./docs/type-support.png)

## 使用缓存

命中缓存时，该次请求结果会直接从缓存中拿，不会发起新的请求，被取消的请求不会进入缓存

注意：缓存时拿到请求结果最好深拷贝一下，否则可能会因为数据被前面操作而导致出问题；缓存很好用但不是银弹要注意场合使用。

### 默认 5 秒内使用缓存

```ts
// 代码复用自'零配置直接使用'
export function getGoodsList(params: {}) {
  // 5秒内都会是同样的数据
  return get<{ list: Goods[]; total: number }>({ url: '/goods', params }, { cache: true });
}
```

> 如果是多操作的列表数据型请求(类似电商的商品搜索，里面有很多类目可操作)，应避免使用过长的缓存时间，否则有内存溢出的风险(如果缓存时间过长且类目多、并长时间未命中缓存；容易命中的缓存不会有这种风险)。

### 自定义过期时间

```ts
// 代码复用自'零配置直接使用'
export function getGoodsList(params: {}) {
  // timeout单位为毫秒
  return get<{ list: Goods[]; total: number }>(
    { url: '/goods', params },
    { cache: { timeout: 30 * 60 * 1000 } },
  );
}
```

### 缓存失败请求

一般很少会缓存失败请求

```ts
// 代码复用自'零配置直接使用'
export function getGoodsList(params: {}) {
  return get<{ list: Goods[]; total: number }>(
    { url: '/goods', params },
    { cache: { timeout: 30 * 60 * 1000, failedReq: true } },
  );
}
```

这时候如果请求失败该请求也会被缓存，所以你上次请求失败接口返回什么错误信息，如果你不改数据再次命中缓存还是会提示一样的错误信息。

### 自定义缓存命中策略

> 默认缓存命中策略为 `{url,headers,data,method,params}` 5 个合成的对象转为的字符串是一样的则会命中缓存。
>
> 现在在原有基础上添加一条：根据`tag`命中缓存

需要实现自定义模板

```ts
export default class MyCacheTemplate extends AxiosRequestTemplate {
  private readonly cacheKeys = ['cache', 'login'];
  private constructor() {
    super({ baseURL: 'http://test.test' });
  }

  // 转换缓存所用的key，默认根据配置生成key
  protected generateRequestKey(ctx) {
    // 只要是tag在cacheKeys中就命中缓存
    const tag = ctx.customConfig.tag;
    if (cacheKeys.includes(tag)) {
      return tag;
    }
    // 复用之前的逻辑
    return super.generateRequestKey(ctx);
  }
}
```

## 取消请求

很多人不知道取消请求的作用，说什么后端还是会收到请求，请求还是发出去了什么的。

其实那些我们完全不需要关心这些，

我们只需要关心：不要再处理接口后续，也就是说那些接口不管成不成功那些结果我都不要了，这就是取消请求的意义

当然取消只对应获取数据，提交数据不应该取消，出现重复提交只能说逻辑有错，而不应该靠工具兜底

### 取消当前请求

获取`cancleHandler`的时机很重要，必须在 `request`、`get`、`post` 等请求方法执行后获取的取消函数才是有效的，而且必须使用对应的实例来取消请求

```ts
// 复用‘默认 5 秒内使用缓存’
const req = login({ username: 'test', password: 'test' });
// 必须使用对应的实例来取消请求
template.cancelCurrentRequest('cancel message');
try {
  await req;
} catch (e: { message: string }) {
  // 会捕获该报错
  // message: "cancel message"
}
```

使用该方法可以取消失败重试`retry`，但由于时机难以确定——当前请求可能变成了其他请求，所以不推荐使用它取消重试

### 取消所有请求

```ts
// 复用‘默认 5 秒内使用缓存’
const req = login({ username: 'test', password: 'test' });
// 或者
template.cancelAll('cancel message');
try {
  await req;
} catch (e: { message: string }) {
  // 会捕获该报错
  // message: "cancel message"
}
```

可以取消重试，但范围太大，可能会误伤其他请求，需要慎重使用

### 根据`tag`取消请求

```ts
// 代码复用自'零配置直接使用'
export function login(data: { username: string; password: string }) {
  // timeout单位为毫秒
  return post<{ token: string }>('/user/login', data, { tag: 'cancelable' });
}
```

```ts
const req = login({ username: 'test', password: 'test' });
template.cancelWithTag('cancelable', 'cancel message');
try {
  await req;
} catch (e: { message: string }) {
  // 会捕获该报错
  // message: "cancel message"
}
```

使用`tag`方式取消很方便灵活且实用，我们可以在请求前取消相同`tag`的请求；

或者复用模板时所有请求设置一个默认`tag`，然后某一个请求设置为不一样的`tag`，从而实现反向`tag`取消的功能

还能取消正在执行中的失败重试

## 失败重试

失败重试算是比较少用到的功能了，但是秉持着`我可以不用，你不能没有`的想法把这功能给内置了

### 重试

重试 3 次，`http`状态码非`200`时会重试 3 次。如果一直失败的话，加上第一次失败请求，那么最后会发起 4 次相同请求

```ts
// 代码复用自'零配置直接使用'
try {
  await post({ url: '/retry' }, { retry: 3 });
} catch (e: any) {
  // 会捕获最后一次请求的错误
}
```

### 重试间隔

重试 3 次，每次重试间隔 3 秒, `interval`缺省时为 0 秒，也就是说每次都是`setTimeout(request, undefined))`请求

```ts
// 代码复用自'零配置直接使用'
try {
  await post({ url: '/retry' }, { retry: { times: 3, interval: 3000 } });
} catch (e: any) {
  // 会捕获最后一次请求的错误
}
```

### 第一次重试零间隔

重试 3 次，每次重试间隔 3 秒, 第一次重试零间隔，也就是说第一次重试是`setTimeout(request, undefined))`请求

```ts
// 代码复用自'零配置直接使用'
try {
  await post({ url: '/retry' }, { retry: { times: 3, interval: 3000, immediate: true } });
} catch (e: any) {
  // 会捕获最后一次请求的错误
}
```

### 取消重试

错误的方式

```ts
// 代码复用自'零配置直接使用'
const req = post({ url: '/retry' }, { retry: 3 });
const cancel = template.cancelCurrentRequest;
cancel(); // 错误，由于`cancelCurrentRequest`会记住当前请求，此时无法确定当前是哪个请求
try {
  await req;
  // do something
} catch (e) {
  // do something
}
```

> 由于`cancelCurrentRequest`会记住此时无法确定当前是哪个请求，虽然可以直接调用`template.cancelCurrentRequest()`，但是如果请求多的话，可能会误伤其他请求。
>
> 所以最好的办法是使用`tag`方式取消请求。

正确的方式

```ts
// 代码复用自'零配置直接使用'
const symbol = Symbol('cancel'); // 可以使用字符串，但是用Symbol可以让tag不会与任何tag重复
const req = post({ url: '/retry' }, { retry: 3, tag: symbol });
template.cancelWithTag(symbol, 'msg');
try {
  await req;
  // do something
} catch (e) {
  // do something
}
```

## 多状态处理

使用默认模板时需要后台数据结构为`{data:any; code: number; msg: string;}`

请求级状态处理更多时候是作为一种补充，常用状态处理推荐写到`自定义模板`+`全局配置`上

```ts
// 代码复用自'零配置直接使用'
post(
  '/login',
  {},
  {
    statusHandlers: {
      // code为200时调用
      200(_, res, data) {
        // do something
      },
      // code为20时调用
      20(_, res, data) {
        // do something
      },
    },
  },
);
```

## 全局配置

```ts
import { AxiosRequestTemplate } from './AxiosRequestTemplate';

const template = new AxiosRequestTemplate({
  // AxiosRequestConfig axios配置
  requestConfig: { data: { a: 1 }, params: { a: 1 } },
  // 自定义配置
  customConfig: {
    tag: 'cancelable',
    retry: { times: 3, interval: 3000, immediate: true },
    statusHandlers: {
      // code为200时调用
      200(_, res, data) {
        // do something
      },
      // code为20时调用
      20(_, res, data) {
        // do something
      },
    },
    cache: { timeout: 30 * 60 * 1000, enable: true },
  },
});
```

```ts
const post = template.methodFactory('post');
post('/test').then((res) => {
  // do something
});
```

此时的每次请求都会使用缓存，带上`tag`，使用状态处理，失败重试， `data`或`params`会带上`{a:1}`

```ts
post({ url: '/test' }, { cache: true }).then((res) => {
  // do something
});
```

> 全局`cache`有一个小技巧，可以先设置`{ timeout: 30 * 60 * 1000, enable: false }`，把`enable`设置为`false`，只设置`timeout`
>
> 然后请求时，把`cache`设置为`true`，那么就可以全局不使用缓存，只使用缓存时间，请求时只需要开启请求缓存功能就好了，简化了操作

## 配置复用

目前提供三个级别的配置复用，分别是继承级、实例级以及 api 级配置复用

### 继承配置复用

扩展性最大的方式，继承后你可以改成任何你需要的样子，可以完全复用或重构整个模版，具体可看案例或完整 demo

### 实例配置复用

在 new 一个实例时带上参数后，该实例的所有请求都会带上复用这些参数，例子可看[全局配置](#全局配置)

### api 配置复用

目前提供 3 个方法以供 api 配置复用，分别是`methodFactory`、 `use`、 `simplifyMethodFactory`方法

#### `methodFactory`

该方法返回一个闭包，提供配置缓存的功能，接收`method` `handler`两个参数，`handler`支持统一对配置修改，返回一个`request`方法

该方法返回的`request`方法`method`以固定，不能修改

以统一加上`url`前缀，并且全部添加缓存为例

```ts
import { AxiosRequestConfig } from 'axios';
import { CustomConfig, AxiosRequestTemplate } from 'request-template';

const req = new AxiosRequestTemplate({ requestConfig: { baseURL: 'https://test.com/1' } });

const handler = (config: { requestConfig: AxiosRequestConfig; customConfig: CustomConfig }) => {
  // 支持对axios和自定义配置修改
  config.requestConfig.url = '/test' + config.requestConfig.url;
  config.customConfig.cache = true;
};
const post = req.methodFactory('post', handler);
const get = req.methodFactory('get', handler);

post({ url: '/path' }); // 实际url为 https://test.com/1/test/path
get({ url: '/path' }); // 实际url为 https://test.com/1/test/path
```

#### `use`

该方法返回一个闭包，提供配置缓存的功能，接收`config`参数，`config` 参数包含 `requestConfig` `customConfig` 两个属性，返回一个`request`方法

跟`methodFactory`的区别是`methodFactory`能通过回调修改配置，而`use`内部实现了合并配置，但没有函数灵活；

该方法返回的`request`方法仍然能改`method`

以统一加上`url`前缀，并且全部添加缓存为例

```ts
import { AxiosRequestConfig } from 'axios';
import { AxiosRequestTemplate } from 'request-template';

const req = new AxiosRequestTemplate({ requestConfig: { baseURL: 'https://test.com/1' } });

// use内部实现了url但拼接
const post = req.use({
  requestConfig: { method: 'post', url: '/test' },
  customConfig: { cache: true },
});
const get = req.use({
  requestConfig: { method: 'get', url: '/test' },
  customConfig: { cache: true },
});

post({ url: '/path' }); // 实际url为 https://test.com/1/test/path
get({ url: '/path' }); // 实际url为 https://test.com/1/test/path
```

注意：跟其他库的`use`会影响到实例不一样，`use`只会影响到闭包内的请求

#### `simplifyMethodFactory`

写多了请求你会发现：其实你很少会去改`axios`的其他配置，真正常改动的只有`method` `url` `data`这三个参数，

也不关心数据是属于`data`还是`params`，我只知道它是数据，遇到`get` `post`给我自动转换就好（一般来说很少会在`post`请求里传`params`）

针对这种情况我提供了`simplifyMethodFactory`方法

该方法同样返回一个闭包，接收`method`和`urlPrefix`（考虑到公共 url 前缀挺常用的，可不传）

返回一个只接收`(url:string, data:{}, customConfig:{})`修改过的`request`方法，不再提供`axios`配置修改，简化操作

```ts
import { AxiosRequestConfig } from 'axios';
import { AxiosRequestTemplate } from 'request-template';

const req = new AxiosRequestTemplate({ requestConfig: { baseURL: 'https://test.com/1' } });

// simplifyMethodFactory内部实现了url但拼接
const post = req.simplifyMethodFactory('post', '/test');
const get = req.req.simplifyMethodFactory('get', '/test');

// 不管你是data也好params也好，我都不关心，我只知道它是数据，方法内部给我处理好就行

post('/path', { page: 1 }); // 实际url为 https://test.com/1/test/path

get('/path', { page: 1 }, { cache: true }); // 实际url为 https://test.com/1/test/path
```

# 实际场景及解决方案

## 全局请求`loading`

以`elementPlus`为例，具体可以使用自己喜欢的 ui 库实现，该实现需要自定义模板

```ts
import { ElLoading, ILoadingInstance } from 'element-plus';
import { AxiosRequestTemplate, Context, CustomConfig } from 'request-template';

// 扩展自定义配置，令api的时候有ts类型提示
interface MyConfig extends CustomConfig {
  loading?: boolean;
}

class RequestWithLoading<CC extends MyConfig = MyConfig> extends AxiosRequestTemplate<CC> {
  private loading?: ILoadingInstance;

  // 调起loading
  protected beforeRequest(ctx: Context<CC>) {
    super.beforeRequest(ctx); // 复用基础模板逻辑
    if (ctx.customConfig.loading) {
      this.loading = ElLoading.service({ fullscreen: true });
    }
  }
  // 关闭loading
  protected afterRequest(ctx) {
    super.afterRequest(ctx); // 复用基础模板逻辑
    // 加个定时器避免请求太快，loading一闪而过
    setTimeout(() => {
      this.loading?.close();
    }, 200);
  }
}
```

```ts
// 可以配置默认是开启还是关闭，此例子默认所有的都开启
const req = new RequestWithLoading({}, { loading: true });

const get = req.simplifyMethodFactory('get');

// 此时所有的请求都可以带上loading
get('/test');
get('/test');

// 单独某个请求不使用`loading`
get('/test', {}, { loading: false });
```

注意：`elementPlus`例子多次调用`loading`并不会打开多个`loading`

> 需要注意的是，以服务的方式调用的全屏 Loading 是单例的。 若在前一个全屏 Loading 关闭前再次调用全屏 Loading，并不会创建一个新的 Loading 实例，而是返回现有全屏 Loading 的实例

如果你的`loading`不是单例的，那么你需要自己处理一下多个`loading`存在可能导致的问题

## 全局请求显示信息弹窗

很多时候提交数据到服务器都需要显示操作是否成功的信息给用户，比如说创建文章，更新文章(当然不是所有的都是，比如掘金就是直接跳页面，视业务而定)，这时候直接写到 api 文件上就好了

```ts
import { AxiosRequestTemplate, Context, CustomConfig } from 'request-template';
import { Method } from 'axios';
import { statusHandlers } from './statusHandlers';

// 扩展自定义配置
export interface PrimaryCustomConfig extends CustomConfig {
  showSuccessMsg?: boolean;
  successMsg?: string;
}

export class PrimaryRequest<
  CC extends PrimaryCustomConfig = PrimaryCustomConfig,
> extends AxiosRequestTemplate<CC> {
  static readonly ins = new PrimaryRequest();

  private constructor() {
    super({
      requestConfig: { baseURL: import.meta.env.VITE_BASE_URL },
      customConfig: {
        statusHandlers,
        showSuccessMsg: undefined,
      } as CC,
    });
  }

  protected beforeRequest(ctx: Context<CC>) {
    // 复用基础模板逻辑
    super.beforeRequest(ctx);

    // 未设置showSuccessMsg时，且非get请求则全部显示请求成功信息
    if (ctx.requestConfig.method !== 'get' && ctx.customConfig.showSuccessMsg === undefined) {
      ctx.customConfig.showSuccessMsg = true;
    }
  }
}
export const [Get, Post, Patch, Delete] = PrimaryRequest.ins.methodsWithUrl(
  ['get', 'post', 'patch', 'delete'],
  '',
);
```

在相应的成功 code 回调上写上处理

```ts
import { PrimaryCustomConfig } from '@/http/primary/index';
import { HttpStatus, StatusHandler, StatusHandlers } from 'request-template';
import { ElMessage } from 'element-plus';

export const statusHandlers: StatusHandlers<PrimaryCustomConfig> = {
  [HttpStatus.OK]: ({ customConfig }, res, data) => {
    customConfig.showSuccessMsg &&
      ElMessage({ type: 'success', message: customConfig.successMsg || data.msg });
    return customConfig.returnRes ? res : data;
  },
  default: errorHandler,
};
```

api 调用

```ts
// 更新文章
export function updateArticle(articleId: number | string, data: {}) {
  // 默认开启，也可以使用showSuccessMsg: false关闭
  return Patch(`/${articleId}`, data, { successMsg: '更新成功' });
}
// 编辑文章
export function createArticle(data: {}) {
  return Post<{ articleId: number }>('', data, { showSuccessMsg: true, successMsg: '添加成功' });
}
```

这样信息弹窗就不需要你写到你的 api 调用的组件上了，我只要数据，其他弹窗什么的我一概不管，不过比较复杂的场景还是需要关闭该弹窗而手动实现的

## 全局请求带上`token`

`token`操作封装，默认保存到`localStorage`,可以按照自己喜欢保存到`sectionStorage`或`cookie`上

```ts
export class Token {
  private static KEY = 'token';

  static set key(key: string) {
    Token.KEY = key;
  }
  static get key(): string {
    return Token.KEY;
  }

  static get(): string {
    return localStorage.getItem(Token.KEY) || '';
  }
  static set(token: string) {
    localStorage.setItem(Token.KEY, token);
  }

  static clear() {
    localStorage.removeItem(Token.KEY);
  }
  static exists(): boolean {
    return !!Token.get();
  }
}
```

状态码为`401`时清除`token`, 状态码为`207`时保存`token`, 可按实际业务调整

```ts
import { StatusHandlers } from 'request-template';
export const statusHandlers: StatusHandlers = {
  401: (ctx, res, data) => {
    Token.clear();
    return Promise.reject(data);
  },
  207: ({ customConfig }, res, data) => {
    data.data.token && Token.set(data.data.token);
    return customConfig.returnRes ? res : data;
  },
};
```

如果`token`是放置在`headers`，那么在设置`axios`配置时顺带配置好`headers`

```ts
export class PrimaryRequest extends AxiosRequestTemplate {
  protected handleRequestConfig(url, requestConfig) {
    if (!requestConfig.headers) requestConfig.headers = {};
    Token.exists() && (requestConfig.headers.authorization = `Bearer ${Token.get()}`);
    return super.handleRequestConfig(url, requestConfig);
  }
}
```

也可以想很多人那样设置在拦截器上，不过个人不是很推荐，这样有点不太好理解

```ts
export class PrimaryRequest extends AxiosRequestTemplate {
  protected setInterceptors() {
    this.interceptors.request.use((requestConfig) => {
      if (!requestConfig.headers) requestConfig.headers = {};
      Token.exists() && (requestConfig.headers.authorization = `Bearer ${Token.get()}`);
    });
  }
}
```

## 页面频繁操作数据缓存

> 比如在一个列表页面，可以选择分类以及标签，还有排序方式（其实就是我的博客 😄）。
> 这些可操作区域可能会经常点来点去，但是其实数据不会刷新那么快，很容易产生冗余的请求，我们完全可以把请求缓存起来，并阻止新请求发出。

```ts
const req = new AxiosRequestTemplate();

// api
export function getArticleList(params: { cate: number; tags: number[]; sort: number; p: number }) {
  req.cancelWithTag(tag);
  return req.request({ url: '/api/article', params }, { cache: true });
}
```

然后只要`{url,headers,data,method,params}`这些配置是一样的话就不会发起新请求了，而是直接从缓存中拿数据，不过按`f5`刷新的话还是会发起请求的。

如果要实现按`f5`也还是从缓存中取数据，实现请求缓存到本地存储的功能也很简单：只要继承`AxiosRequestTemplate` `Cache`，并重写`Cache`的`getter` `setter`以及`AxiosRequestTemplate`的`init`方法就可以实现。

## post 请求参数序列化

> 有时候后端要求`Content-Type`必须以`application/x-www-form-urlencoded`形式，这时候我们需要处理一下`headers`和`data`

自定义模板

```ts
import Qs from 'qs';
export default class MyTemplate extends AxiosRequestTemplate {
  protected handleRequestConfig(requestConfig) {
    requestConfig = super.handleRequestConfig(requestConfig);
    //  设置headers
    if (!requestConfig.headers) requestConfig.headers = {};
    requestConfig.headers['Content-Type'] = 'application/x-www-form-urlencoded';

    // 使用qs序列化参数
    if (
      String(requestConfig.method).toLowerCase() === 'post' &&
      !(requestConfig.data instanceof FormData)
    ) {
      requestConfig.data = Qs.stringify(requestConfig.data);
    }

    return requestConfig;
  }
}
```

或者使用`axios`全局配置

```ts
import Qs from 'qs';
export default class MyTemplate extends AxiosRequestTemplate {
  constructor() {
    //  设置headers
    super({ headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
  }

  protected handleRequestConfig(requestConfig) {
    requestConfig = super.handleRequestConfig(requestConfig);
    // qs序列化
    if (
      String(requestConfig.method).toLowerCase() === 'post' &&
      !(requestConfig.data instanceof FormData)
    ) {
      requestConfig.data = Qs.stringify(requestConfig.data);
    }
    return requestConfig;
  }
}
```

也可以用`requestMethod`或`use`来复用这些配置，具体要使用哪个需要视复用广度而定。

## 分页场景快速切换页码时中断请求

> 分页场景，快速的点击 1，2，3 页，发出去 3 个请求，请求返回有快有慢，最后点击的第三页，但是最后返回的是第二页的数据，那页面，肯定是会渲染第二页的，是不是个 bug，那么同时请求了多个相同请求，那么是不是可以中断之前的请求，只执行最后一个请求呢

这种场景挺常见的，跟上面的页面频繁操作类似，不过从缓存拿数据很快，用户点击不可能会比从缓存拿数据快。

这是属于前面请求数据作废场景，我们可以很简单的实现该功能

```ts
const req = new AxiosRequestTemplate();
// 使用Symbol避免与其他请求重名
const tag = Symbol('xx_list');
// api
export function getXXList(p: number) {
  req.cancelWithTag(tag);
  return req.request({ url: '/xx_list', params: { p } }, { tag });
}
```

只要给该请求加上`tag`，然后每次调用前取消就好了，是不是很简单呢。

## 前端并发 10 个相同的请求，怎么控制为只发一个请求？

这问题来源于[前端并发 10 个相同的请求，怎么控制为只发一个请求？ - 掘金 (juejin.cn)](https://juejin.cn/post/7052700635154219015)

> ### 描述如下
>
> - 同时发多个相同的请求，如果第一个请求成功，那么剩余的请求都不会发出，成功的结果作为剩余请求返回
> - 如果第一个请求失败了，那么接着发编号为 2 的请求，如果请求成功，那么剩余的请求都不会发出，成功的结果作为剩余请求返回
> - 如果第二个请求失败了，那么接着发编号为 3 的请求，如果请求成功，那么剩余的请求都不会发出，成功的结果作为剩余请求返回
> - `...`以此递推，直到遇到最坏的情况需要发送最后一个请求
>
> > 并发： 一个接口请求还处于 pending，短时间内就发送相同的请求

这个问题刚开始时看岔了，被 10 个请求误导了，以为 10 次以后就用失败的。

仔细看后其实说起来还是缓存问题，就是失败的不缓存，有请求成功的就请求用成功的数据，并且请求成功后后续同类请求不再发出。

跟我上面的缓存场景类似，直接用缓存功能就是

```ts
const req = new AxiosRequestTemplate();

export function request() {
  // 不知道它要求多长时间内，就定为无限吧，并且不缓存失败请求
  return req.request({ url: '/test' }, { cache: { timeout: Infinity, failedReq: false } });
}
```

# 完整 demo

这是我博客前台的`api`使用封装

环境：vue3、vite、ts、elementplus

目录结构

```text
src
├── api
|  ├── user.ts // 具体的api
|  ├── tag.ts // 具体的api
|  └── ....
├── http
|  ├─── primary // 主请求模板
|  |   ├── index.ts // 请求模板
|  |   ├── token.ts // token操作工具类
|  |   └── statusHandlers.ts // 状态处理
|  └─── other  // 其他规则模板
|      ├── index.ts // 请求模板
|      └── statusHandlers.ts // 状态处理
```

## 主模板封装

### src/primary/token.ts

`token`封装类

```ts
export class Token {
  private static KEY = 'token';

  static set key(key: string) {
    Token.KEY = key;
  }
  static get key(): string {
    return Token.KEY;
  }

  static get(): string {
    return localStorage.getItem(Token.KEY) || '';
  }
  static set(token: string) {
    localStorage.setItem(Token.KEY, token);
  }

  static clear() {
    localStorage.removeItem(Token.KEY);
  }
  static exists(): boolean {
    return !!Token.get();
  }
}
```

### src/primary/statusHandlers.ts

给用户提示错误信息，`token`的保存、清理、刷新等操作的通用处理

```ts
import { HttpStatus, StatusHandler, StatusHandlers, CustomConfig, Context } from 'request-template';
import { ElMessage } from 'element-plus';
import { Token } from './token';
import Store from '@/store/index';

// 通用错误Handler
const commonErrorHandler: StatusHandler<CustomConfig> = ({ customConfig }, res, data) => {
  // 非静音模式下，有错误直接显示错误信息
  !customConfig.silent && ElMessage({ type: 'error', message: data.msg });
  return Promise.reject(customConfig.returnRes ? res : data);
};

export const statusHandlers: StatusHandlers = {
  //  401 token失效或者未登录
  [HttpStatus.UNAUTHORIZED]: (ctx, res, data) => {
    // 从vuex或pinia中删除用户信息
    // Store.commit('clearUser');
    Token.clear();
    return commonErrorHandler(ctx, res, data);
  },
  // token刷新时
  207: ({ customConfig }, res, data) => {
    data.data.token && Token.set(data.data.token);
    return customConfig.returnRes ? res : data;
  },
  // 200 普通成功请求
  [HttpStatus.OK]: ({ customConfig }, res, data) => {
    return customConfig.returnRes ? res : data;
  },
  // ...
  // 其余状态全部走错误处理
  default: commonErrorHandler,
};
```

### src/primary/index.ts

实现自定义请求模板，添加全局`loading`、`token`、`uuid`等, 并生成`Get`、`Post`、`Patch`、`Delete`等常用`method`

```ts
import { Token } from './token';
import { statusHandlers } from './statusHandlers';
import { AxiosRequestTemplate, Context, CustomConfig } from 'request-template';
import { ElLoading, ILoadingInstance } from 'element-plus';
import { Method } from 'axios';

let uuid = localStorage.getItem('uuid');

// 扩展自定义配置，令api使用的时候有ts类型提示
interface LoadingCustomConfig extends CustomConfig {
  loading?: boolean;
}

export class PrimaryRequest<
  CC extends LoadingCustomConfig = LoadingCustomConfig,
> extends AxiosRequestTemplate<CC> {
  // 单例模式
  static readonly ins = new PrimaryRequest();

  private loading?: ILoadingInstance;

  private constructor() {
    super(
      // baseUrl，axios配置，每个请求都会拼接上baseUrl作为前缀，跟process.env.BASE_URL类似
      // VITE_BASE_URL定义在.env文件中，方便使用环境变量切换baseurl
      { baseURL: import.meta.env.VITE_BASE_URL },
      // 缓存设置60秒
      { statusHandlers, cache: { enable: false, timeout: 60 * 1000 }, loading: false } as CC,
    );
  }

  // 转换响应数据结构为{code:number; data:any; msg:string}
  // 例如有些接口的code可能叫status或ercode，msg叫message之类的
  // 如果是一样的结构可以跳过该方法
  protected handleResponse(ctx: Context<CC>, response: AxiosResponse) {
    const data = (response?.data as ResType) || {};
    return {
      code: data.code,
      data: data.data,
      msg: data.msg,
    };
  }

  // 请求前开启loading
  protected beforeRequest(ctx: Context<CC>) {
    super.beforeRequest(ctx); // 复用基础模板逻辑
    if (ctx.customConfig.loading) {
      this.loading = ElLoading.service({ fullscreen: true });
    }
  }

  // 请求后关闭loading
  protected afterRequest(ctx) {
    super.afterRequest(ctx); // 复用基础模板逻辑
    // 加个定时器避免请求太快，loading一闪而过
    setTimeout(() => {
      this.loading?.close();
    }, 200);
  }

  // 生成uuid
  private static getUUID() {
    if (uuid) {
      return uuid;
    }
    uuid = Math.floor(Math.random() * 0xffffffffff).toString(16);
    localStorage.setItem('uuid', uuid);
    return uuid;
  }

  // 处理config，添加uuid和token到headers
  protected handleRequestConfig(requestConfig) {
    if (!requestConfig.headers) requestConfig.headers = {};
    Token.exists() && (requestConfig.headers.authorization = `Bearer ${Token.get()}`);
    requestConfig.headers.uuid = PrimaryRequest.getUUID();
    return super.handleRequestConfig(requestConfig);
  }

  // 通过数组生成method
  methodsWithUrl(methods: Method[], urlPrefix: string) {
    return methods.map((method) => this.simplifyMethodFactory(method, urlPrefix));
  }
}

// 导出公共的method
export const [Get, Post, Patch, Delete] = PrimaryRequest.ins.methodsWithUrl(
  ['get', 'post', 'patch', 'delete'],
  '',
);
```

### src/api/user.ts

user 模块

```ts
import { PrimaryRequest } from '@/http/primary';

// 复用url前缀
const urlPrefix = '/api/user';
const [Get, Post, Patch, Delete] = PrimaryRequest.ins.methodsWithUrl(
  ['get', 'post', 'patch', 'delete'],
  urlPrefix,
);

export interface User {
  id: number;
  nickname: string;
  avatar: string;
  username: string;
  loginAt: string;
  createAt: string;
  muted: boolean;
  deletedAt: string;
}
export function getSelf() {
  return Get<{ user: User }>('/self', {}, { silent: true });
}
export function deleteUser(id: string | number) {
  return Delete('/' + id);
}
export function restoreUser(id: string | number) {
  return Patch('/restore/' + id);
}
export function getUserAll() {
  return Get<{ list: User[]; count: number }>('');
}
export function getUserById(id: number | string) {
  return Get<User>('/' + id);
}
export function login(data: { username: string; password: string }) {
  return Post<{ token: string }>('/login', data);
}
export function register(data: {}) {
  return Post('/register', data);
}
export function updateUserInfo(userId: number | string, data: {}) {
  return Patch('/' + userId, data);
}
export function updatePassword(userId: number | string, data: {}) {
  return Patch('/password/' + userId, data);
}
export function muteUser(userId: number | string) {
  return Patch('/mute/' + userId);
}
export function cancelMuteUser(userId: number | string) {
  return Patch('/cancel-mute/' + userId);
}
```

### src/api/tag.ts

tag 模块

```ts
import { Get, Post } from '@/http/primary';

const url = '/api/tag';

export interface Tag {
  createAt: string;
  description: string;
  id: number | string;
  name: string;
}

export function createTag(data: {}) {
  return Post(url, data);
}

export function getTags() {
  return Get<Tag[]>(url);
}
```

## 在微信小程序中使用

在微信小程序中使用也很简单，只要以下几个步骤

1. 安装依赖（`npm install request-template`）
2. 使用开发者工具的`构建npm`功能
3. 修改`primary.ts`并重写部分方法

   ```ts
   export class PrimaryRequest<
     CC extends PrimaryCustomConfig = PrimaryCustomConfig,
   > extends AxiosRequestTemplate<CC> {

    ...

     // 覆盖原有的方法
     // use $fetch
     protected init() {
       this.cache = new Cache();
     }

     // 使用小程序的取消请求判断逻辑
     protected isCancel(value: any) {
       return value?.errMsg === 'request:fail abort';
     }

     // 使用小程序的请求方法
     protected fetch(ctx) {
       const baseConfig = this.globalConfigs.requestConfig;
       const config = ctx.requestConfig;

       // 转换成小程序的请求配置
       const method = config.method || baseConfig.method;
       return new Promise((resolve, reject) => {
         const task = wx.request({
           url: (config.baseURL || baseConfig.baseURL) + (config.url || baseConfig.url),
           method,
           data:
             method === 'get'
               ? { ...baseConfig.params, ...config.params }
               : { ...baseConfig.data, ...config.data },
           header: { ...baseConfig.headers, ...config.headers },
           success: resolve,
           fail: reject,
         });
         // 注册取消事件
         this.registerCanceler(ctx, task.abort.bind(task));
       }) as any;
     }

     // 覆盖原来的方法
     // eslint-disable-next-line
     protected handleCanceler(_ctx) {}

     ...

   }
   ```

4. `token.ts`重写`token` `get` `set`

   ```ts
   export class Token {
     private static KEY = 'token';

     static set key(key: string) {
       Token.KEY = key;
     }
     static get key(): string {
       return Token.KEY;
     }

     static get(): string {
       return wx.getStorageSync(Token.KEY) || '';
     }
     static set(token: string) {
       wx.setStorageSync(Token.KEY, token);
     }

     static clear() {
       wx.removeStorageSync(Token.KEY);
     }
     static exists(): boolean {
       return !!Token.get();
     }
   }
   ```

其他层面如`api`层是完全不需要改的，调用方式也一样不需要改动;

避免了环境一遍就需要到处查找更改。

## hooks

### useRequest

添加文件`hooks/useRequest.ts`

```plaintext
src
├── api
|  ├── user.ts // 具体的api
|  ├── tag.ts // 具体的api
|  └── ....
├── http
|  ├─── primary // 主请求模板
|  |   ├── index.ts // 请求模板
|  |   ├── token.ts // token操作工具类
|  |   └── statusHandlers.ts // 状态处理
|  └─── other  // 其他规则模板
|      ├── index.ts // 请求模板
|      └── statusHandlers.ts // 状态处理
└── hooks // 状态处理
    ├─── useRequset
```

`hooks/useRequest.ts`

```typescript
import { reactive, toRefs, isReactive, watch, isRef } from 'vue';
// import User from '@/api/User';

type FN = (...args: any[]) => Promise<any>;

interface State<T extends FN> {
  loading: boolean;
  data: Awaited<ReturnType<T>>['data'] | null;
  error: any | null;
}

type Options<A extends string, D extends object | void = void> = D extends void
  ? { requestAlias?: A; immediate?: boolean }
  : {
      immediate?: boolean;
      data?: D;
      dataDriver?: boolean;
    };

/**
 * 请求hooks
 *
 * @example
 *
 * // 手动请求 request不带参数
 * const res = useRequest(User.getSelf, { requestAlias: 'getSelf', immediate: true });
 * res.getSelf();
 * console.log(res.data.value?.user);
 *
 * const formModel = reactive({ username: '', password: '' });
 *
 * // 手动请求 request带参数
 * const res2 = useRequest(User.login);
 * res2.request(formModel);
 * console.log(res2.data.value?.token);
 *
 * formModel.username = '1';
 * formModel.password = '1';
 *
 * // 数据驱动
 * const res3 = useRequest(User.login, {
 *   data: formModel,
 *   immediate: true,
 *   dataDriver: true,
 * });
 * // res3.request(formModel); // error Property 'request' does not exist
 * // 修改formModel自动触发请求
 * formModel.username = '2';
 * formModel.password = '2';
 * console.log(res3.data.value?.token);
 *
 * @param  requestFn
 * @param  options
 * @param  defaultData
 */
export function useRequest<
  REQ extends FN,
  ALIAS extends string = 'request',
  DATA extends object | void = void,
>(
  requestFn: REQ,
  options: Options<ALIAS, DATA> = {} as any,
  defaultData: Awaited<ReturnType<REQ>>['data'] | null = null,
) {
  const state = reactive<State<REQ>>({
    loading: false,
    data: defaultData,
    error: null,
  });

  const refs = toRefs(state);

  const request = (...args: any[]) => {
    // computed变量不能JSON.stringfy
    args = args.map((item) => (isRef(item) ? item.value : item));
    state.loading = true;
    requestFn(...args)
      .then(
        (res) => {
          state.data = res.data;
        },
        (err) => (state.error = err),
      )
      .finally(() => {
        state.loading = false;
      });
  };

  const {
    requestAlias = 'request',
    immediate = false,
    data,
    dataDriver = false,
  } = options as Options<ALIAS, {}> & Options<ALIAS>;

  // 数据驱动
  if (dataDriver && data && (isReactive(data) || isRef(data))) {
    watch(
      data,
      (n) => {
        request(n);
      },
      { deep: true },
    );
  }

  if (immediate) {
    request(data);
  }

  return {
    ...refs,
    // 数据驱动时as any一下还是能用的
    [requestAlias]: request,
  } as typeof refs &
    (DATA extends void
      ? { [k in keyof Record<ALIAS, void>]: (...args: Parameters<REQ>) => void }
      : void);
}
```

`useRequest`分为`数据驱动`和`普通请求`两种方式。如果你的请求是每次数据改动就请求，那么可以使用`数据驱动`，否则可以`立即`或`手动`请求

### 使用useRequest
获取文章列表。

添加`api/article.ts`
```typescript
import type User from './User';
import { Get } from '@/http/primary';

export interface Article {
  author: User;
  categoryId: number;
  content: string;
  cover: string;
  createAt: string;
  description: string;
  id: number;
  status: number;
  title: string;
  updateAt: string;
  viewCount: number;
  commentLock: boolean;
  commentCount?: number;

  like: { count: number; checked: number };
}

export interface GetArticleListRes {
  list: Article[];
  count: number;
}
export function getArticleList(data: {}) {
  return Get<GetArticleListRes>('/api/article', data, { cache: true });
}
```

数据驱动：根据路由变化获取数据
```html
<script setup lang="ts">
import { useRequest } from '@/hooks/useRequest';
import { useRoute, useRouter } from 'vue-router';
import { getArticleList } from '@/api/article';
import { computed, watch } from 'vue';

const route = useRoute();
const router = useRouter();

// pagination handler
const onPageChange = (page: number) => {
  const query: any = { ...route.query };
  query.page = page;
  router.replace({ path: route.path, query });
};

// 只要路由变化就会更新params
const params = computed(() => {
  const q = route.query;
  return {
    keyword: q.query || '',
    sort: q.sort ? Number(q.sort) : 3,
    category: q.cate ? Number(q.cate) : '',
    tag: ((q.tag as string) || '').split(',').filter(Boolean).map(Number),
    page: q.page ? Number(q.page) : 1,
  };
});

// 会根据params变化自动请求列表数据，不需要再手动调用
const { data, loading } = useRequest(getArticleList, { data: params });
watch(loading, () => {
  console.log(data.value?.list, data.value?.count);
});
</script>
```

# 结尾

如果有错欢迎指出...
如果文章、库对你有帮助，那么请记得点赞或 star 哦 😬
