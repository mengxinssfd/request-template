# request-template

## 前言

关于 axios 的封装不胜枚举。

但看上去大部分都是单独的函数：如单独的取消请求，缓存，自动带上 token 等等。

结构过于松散，不够封装，需要用户手动复制过来，过于麻烦，且一旦业务改了又得重写一堆；又或封装了但扩展性太低，无法根据业务调整而调整。

缺乏关于一整套完整的方案。

针对以上问题，我实现了该库[`request-template`](https://github.com/mengxinssfd/request-template)。

基于 `axios` 的请求封装，该库使用模板方法模式实现，每一个步骤都可以被子类覆盖方便扩展。

你也可以使用`fetch`来请求，只需要重写使用到`axios`的关键步骤。

这不是一个最终方案，不是说用了这个库就能什么都不用写了，但它能极大减少你的代码复杂度，提高代码的复用性，为你的最终方案提供支持。

面向继承开放，面向使用关闭。

封装但不封闭

## 流程

```mermaid
classDiagram
      direction LR
      class AxiosRequestTemplate{
          #cache : Cache
          +cancelAll()
          +cancelCurrentRequest()
          +cancelWithTag(tag)
          +methodFactory(method)
          +request(url,data,customConfig,requestConfig)
      }
      AxiosRequestTemplate "1" --o "1" Cache: cache
      class Cache{
          -keyHandler:Function
          -cache: Map
          +clearDeadCache()
          +get(key)
          +set(key, value)
      }

```

```mermaid
flowchart
MergeConfig[fa:fa-spinner 合并配置]
CreateTemplate[fa:fa-spinner 创建模板new AxiosRequestTemplate]
GlobalRequestConfig[全局请求配置]
GlobalCustomConfig[全局自定义配置]


CreateTemplate --> GlobalRequestConfig --> template实例
CreateTemplate --> GlobalCustomConfig --> template实例


template实例 --> request


request --> MergeConfig --> 请求开始 --> 生成Canceler --> 使用缓存?

生成Canceler --> 这一步后才可以执行取消handler

使用缓存? --> |是| retry中?
retry中? --> |否| 命中缓存?
retry中? --> |是| 请求


命中缓存?  --> |是| 使用缓存 --> 请求成功?
命中缓存?  --> |否| 请求

使用缓存? --> |否| 请求 --> 缓存请求  --> 请求成功?

请求成功? --> |是| 处理请求结果
请求成功? --> |否| retry?


retry? --> |否| 处理请求结果
retry? --> |是| 请求开始


处理请求结果 --> 处理状态 --> 请求完成 --> 清理钩子





```

## 主要实现

- [X]  非侵入开放式封装
  - [X]  对于继承扩展开放
  - [X]  对于使用时修改关闭
- [X]  模板方法模式实现
  - [X]  可实现自定义模板
  - [X]  可继承复用基础模板
- [X]  多实例
- [X]  ts 类型支持
  - [X]  范型支持
  - [X]  原 axios 类型支持
- [X]  多状态处理
- [X]  接口缓存
  - [X]  自定义缓存命中规则
- [X]  配置
  - [X]  全局配置(保持统一，复用配置)
  - [X]  局部配置(支持个性化配置{某些不按规范实现的接口})
- [X]  取消请求
  - [X]  取消单个请求
  - [X]  根据 tag 取消请求
  - [X]  取消所有请求
- [X]  请求失败重试
  - [X]  重试次数
  - [X]  延时重试
  - [X]  第一次重试立即启动（可选）
  - [X]  中断重试

## 安装

可以使用`npm` `cnpm` `yarn` `pnpm`等方式安装，推荐使用`pnpm`安装减少`node_module`体积

```shell
pnpm add request-template
```

## 基础用法（使用默认模板）

### 零配置直接使用

这时约等于`axios({url})`

```ts
// new一个实例
const template = new AxiosRequestTemplate();
// request(url: string, data?: {}, customConfig?: DynamicCustomConfig<CC, RC>, requestConfig?: AxiosRequestConfig)
// `request`支持4个参数分别是必填的`url`，和选填的请求数据`data`，自定义设置的`customConfig`,以及`axios`的请求设置`requestConfig`
// `requestConfig`为`axios`原设置；data,param已提取出来,cancelToken已内部实现，所以该配置不再接收这三个属性
// `request`默认为`get`请求
template.request('/test', { param1: 1, param2: 2 }).then((res) => {
  console.log(res);
});
// `post`请求，`delete` `patch`也是以此类推
template.request('/test', { param1: 1, param2: 2 }, {}, { method: 'post' }).then((res) => {
  console.log(res);
});
```

### 使用`methodFactory`函数生成一个`method`函数

上面使用每次都要设置`method`有些麻烦了，可以用`methodFactory`函数生成一个`method`函数简化一下

```ts
// 'post','get','patch'...
const post = template.methodFactory('post');
post('/test', { param1: 1, param2: 2 }).then((res) => {
  console.log(res);
});
post('/test', { param1: 1, param2: 2 }).then((res) => {
  console.log(res);
});
```

注意：`methodFactory`生成的 `method`函数与 `request`参数返回值一致，且 `requestConfig`里的 `method`属性不再起作用

### 使用缓存

命中缓存时，该次请求结果会直接从缓存中拿，不会发起新的请求

#### 默认 5 秒内使用缓存

```ts
export function login(data: { username: string; password: string }) {
  // 5秒内都会是同样的数据
  return post<{ token: string }>('/user/login', data, { cache: true });
}
```

#### 自定义过期时间

```ts
export function login(data: { username: string; password: string }) {
  // timeout单位为毫秒
  return post<{ token: string }>('/user/login', data, { cache: { timeout: 30 * 60 * 1000 } });
}
```

### 取消请求

很多人不知道取消请求的作用，说什么后端还是会收到请求，请求还是发出去了什么的。

其实那些我们完全不需要关心，

我们只需要关心：不要再处理接口后续，也就是说那些接口不管成不成功那些结果我都不要了，这就是取消请求的意义

#### 取消当前请求

取消函数的时机很重要，必须在 request、get、post 等请求方法执行后获取的取消函数才是有效的，而且必须使用对应的实例来取消请求

```ts
const req = login({ username: 'test', password: 'test' });
// 必须使用对应的实例来取消请求
template.cancelCurrentRequest('test');
try {
  await req;
} catch (e: { message: string }) {
  // 会捕获该报错
  // message: "test"
}
```

#### 取消所有请求

```ts
const req = login({ username: 'test', password: 'test' });
// 或者
template.cancelAll('test');
try {
  await req;
} catch (e: { message: string }) {
  // 会捕获该报错
  // message: "test"
}
```

#### 根据`tag`取消请求

```ts
export function login(data: { username: string; password: string }) {
  // timeout单位为毫秒
  return post<{ token: string }>('/user/login', data, { tag: 'cancelable' });
}
```

```ts
const req = login({ username: 'test', password: 'test' });
template.cancelWithTag('cancelable', 'test');
try {
  await req;
} catch (e: { message: string }) {
  // 会捕获该报错
  // message: "test"
}
```

### 失败重试

#### 重试

重试 3 次，`http`状态码非`200`时会重试 3 次

```ts
try {
  await post('/retry', {}, { retry: 3 });
} catch (e: any) {
  // 会捕获最后一次请求的错误
}
```

#### 重试间隔

每次重试间隔 3 秒, `interval`缺省时为 0 秒，也就是说每次都是`setTimeout(request, undefined))`请求

```ts
try {
  await post('/retry', {}, { retry: { times: 3, interval: 3000 } });
} catch (e: any) {
  // 会捕获最后一次请求的错误
}
```

#### 第一次重试零间隔

每次重试间隔 3 秒, 第一次重试零间隔，也就是说第一次重试是`setTimeout(request, undefined))`请求

```ts
try {
  await post('/retry', {}, { retry: { times: 3, interval: 3000, immediate: true } });
} catch (e: any) {
  // 会捕获最后一次请求的错误
}
```

#### 取消重试

错误的方式

```ts
const req = post('/retry', {}, { retry: 3 });
const cancel = template.cancelCurrentRequest;
cancel(); // 错误，由于`cancelCurrentRequest`会记住当前请求，此时无法确定当前是哪个请求
try {
  await req;
  // do something
} catch (e) {
  // do something
}
```

由于`cancelCurrentRequest`会记住此时无法确定当前是哪个请求，虽然可以直接调用`template.cancelCurrentRequest()`，但是如果请求多的话，可能会误伤其他请求。

所以最好的办法是使用`tag`方式取消请求：

正确的方式

```ts
const symbol = Symbol('cancel'); // 可以使用字符串，但是用Symbol可以让tag不会与任何tag重复
const req = post('/retry', {}, { retry: 3, tag: symbol });
template.cancelWithTag(symbol, 'msg');
try {
  await req;
  // do something
} catch (e) {
  // do something
}
```

### 多状态处理

使用默认模板时需要后台数据结构为`{data:any; code: number; msg: string;}`

请求级状态处理更多时候是作为一种补充，常用状态处理推荐写到`自定义模板`+`全局配置`上

```ts
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

### 全局配置

```ts
import { AxiosRequestTemplate } from './AxiosRequestTemplate';

const template = new AxiosRequestTemplate(
  // AxiosRequestConfig axios配置
  { data: { a: 1 }, params: { a: 1 } },
  // 自定义配置
  {
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
);
```

```ts
const post = template.methodFactory('post');
post('/test').then((res) => {
  // do something
});
```

此时的每次请求都会使用缓存，带上`tag`，使用状态处理，失败重试， `data`或`params`会带上`{a:1}`，

`cache`有一个小技巧，可以先设置`{ timeout: 30 * 60 * 1000, enable: false }`，把`enable`设置为`false`，只设置`timeout`

然后请求时，把`cache`设置为`true`，那么就可以全局不使用缓存，只使用缓存时间，请求时再开启请求缓存功能

```ts
post('/test', {}, { cache: true }).then((res) => {
  // do something
});
```

## 进阶用法

请求

#### 创建自定义模板

该库使用模板方法模式实现，所以每个处理模块都可以用子类实现

首先定义一个封装模板

```ts
import { StatusHandlers, CustomConfig, HttpStatus, AxiosRequestTemplate } from 'request-template';

// 通用错误Handler
const errorHandler: StatusHandler<CustomConfig> = (res, data, customConfig) => {
  if (!customConfig.silent) {
    // ElMessage({ type: 'error', message: data.msg })
    console.log('非静音模式，显示错误信息');
  }
  // throw data.data || new Error( `data: ${JSON.stringify(data)}`);
  return Promise.reject(customConfig.returnRes ? res : data);
};

const statusHandlers: StatusHandlers = {
  // 登录过期
  [HttpStatus.UNAUTHORIZED]: (res, data, customConfig) => {
    if (res.status === HttpStatus.UNAUTHORIZED) {
      // Store.clearUser();
      console.log('清理掉保存的用户信息');
      Token.clear();
    }
    return errorHandler(res, data, customConfig);
  },
  // token更新了
  207: (res, data, customConfig) => {
    data.data.token && Token.set(data.data.token);
    return customConfig.returnRes ? res : data;
  },
  // 成功
  [HttpStatus.OK]: (res, data, customConfig) => {
    return customConfig.returnRes ? res : data;
  },
  // 其余所有都提示失败
  default: errorHandler,
};
```

直接使用 AxiosRequestTemplate

```ts
const req = new AxiosRequestTemplate<CustomConfig>({ baseURL: '/' }, { statusHandlers });
// 使用methodFactory生成请求方法
const get = req.methodFactory('get');
const post = req.methodFactory('post');
```

或者继承 AxiosRequestTemplate 作为一个固定模板(推荐)

```ts
/**
 * 主域名请求类
 * 单例模式
 */
export default class PrimaryRequest extends AxiosRequestTemplate {
  static readonly ins = new PrimaryRequest();
  // 把get，post挂到static上
  static readonly get = PrimaryRequest.ins.methodFactory('get');
  static readonly post = PrimaryRequest.ins.methodFactory('post');

  private constructor() {
    super({ baseURL: import.meta.env.VITE_BASE_URL }, { statusHandlers });
  }

  protected setInterceptors() {
    this.interceptors.request.use((config) => {
      if (!config.headers) config.headers = {};
      const headers = config.headers as AxiosRequestHeaders;
      Token.exists() && (headers.authorization = `Bearer ${Token.get()}`);
      // headers.uuid = getUUID();
      return config;
    });
  }
}
```

最好再封装成 API

```ts
const { post, get } = PrimaryRequest;
export class User {
  username!: string;
  id!: number;
  static login(data: { username: string; password: string }) {
    return post<{ token: string }>('/user/login', data);
  }
  static getSelf() {
    const req = get<{ user: User }>('/user/self', {}, { silent: true });
    const cancel = PrimaryRequest.ins.cancelCurrentRequest;
    setTimeout(() => cancel('cancel test'));
    return req;
  }
}
```

### 全局配置与局部配置

new 一个模板时构造器接收的配置的为全局配置，get、post 时传过去的为局部配置，请求时局部配置优先于全局配置，且不会污染全局配置

### 转换响应数据结构

如果你接口返回的数据结构不是 `{code:number;msg:string;data:any}`这种格式的话就需要继承基础模板然后重写 `transformRes`方法

## 场景

### 全局请求`loading`

以`elementPlus`为例，具体可以使用自己喜欢的 ui 库实现

```ts
import { ElLoading, ILoadingInstance } from 'element-plus';
import { AxiosRequestTemplate, Context, CustomConfig } from 'request-template';

interface MyConfig extends CustomConfig {
  loading?: boolean;
}

class RequestWithLoading<CC extends MyConfig = MyConfig> extends AxiosRequestTemplate<CC> {
  private loading?: ILoadingInstance;

  protected beforeRequest(ctx: Context<CC>) {
    super.beforeRequest(ctx); // 复用基础模板逻辑
    if (ctx.customConfig.loading) {
      this.loading = ElLoading.service({ fullscreen: true });
    }
  }

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

const get = req.methodFactory('get');

// 此时所有的请求都可以带上loading
get('/test');
get('/test');

// 单独某个请求不使用`loading`
get('/test', {}, { loading: false });
```

注意：`elementPlus`例子多次调用`loading`并不会打开多个`loading`

> 需要注意的是，以服务的方式调用的全屏 Loading 是单例的。 若在前一个全屏 Loading 关闭前再次调用全屏 Loading，并不会创建一个新的 Loading 实例，而是返回现有全屏 Loading 的实例

如果你的`loading`不是单例的，那么你需要自己处理一下多个`loading`存在可能导致的问题

### 全局请求带上`token`

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

状态码为`401`时清除`token`, 状态码为`207`时保存`token`,

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

如果`token`是放置在`data`，那么在设置`axios`配置时顺带配置好`data`

```ts
export class PrimaryRequest extends AxiosRequestTemplate {
  protected handleRequestData(ctx, data) {
    if (Token.exists()) {
      data.token = Token.get();
    }
    super.handleRequestData(ctx, data);
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

### 自定义缓存命中策略

默认缓存命中策略为 `{url,headers,data,method}`4 个合成的对象转为的字符串是一样的则会命中缓存

现在在原有基础上添加一条：根据`tag`命中缓存

```ts
export default class MyTemplate extends AxiosRequestTemplate {
  private readonly cacheKeys = ['cache', 'login'];
  private constructor() {
    super({ baseURL: 'http://test.test' });
  }

  // 转换缓存所用的key，默认根据配置生成key
  protected generateRequestKey(ctx): string {
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

### post 请求参数序列化

有时候后端要求`Content-Type`必须以`application/x-www-form-urlencoded`形式，这时候我们需要处理一下`headers`和`data`,

```ts
import Qs from 'qs';
export default class MyTemplate extends AxiosRequestTemplate {
  protected handleRequestConfig(url, requestConfig) {
    if (!requestConfig.headers) requestConfig.headers = {};
    requestConfig.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    return super.handleRequestConfig(url, requestConfig);
  }

  protected handleRequestData(ctx, data) {
    if (String(ctx.requestConfig.method).toLowerCase() === 'post' && !(data instanceof FormData)) {
      data = Qs.stringify(data);
    }
    super.handleRequestData(ctx, data);
  }
}
```

或者使用`axios`全局配置

```ts
import Qs from 'qs';
export default class MyTemplate extends AxiosRequestTemplate {
  constructor() {
    super({ headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
  }

  protected handleRequestData(ctx, data) {
    if (String(ctx.requestConfig.method).toLowerCase() === 'post' && !(data instanceof FormData)) {
      data = Qs.stringify(data);
    }
    super.handleRequestData(ctx, data);
  }
}
```
