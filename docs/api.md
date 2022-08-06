## API Report File for "request-template"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

import { AxiosError } from 'axios';
import type { AxiosInstance } from 'axios';
import { AxiosInterceptorManager } from 'axios';
import type { AxiosPromise } from 'axios';
import type { AxiosRequestConfig } from 'axios';
import type { AxiosResponse } from 'axios';
import type { AxiosStatic } from 'axios';
import type { Canceler } from 'axios';
import type { Method } from 'axios';

// @public
export class AxiosRequestTemplate<CC extends CustomConfig = CustomConfig> {
    constructor(globalConfigs?: Partial<Configs<CC>>);
    protected afterRequest(ctx: Context<CC>): void;
    // (undocumented)
    protected static axios: AxiosStatic;
    protected axiosIns: AxiosInstance;
    protected beforeExecRequest(ctx: Context<CC>): void;
    protected beforeRequest(ctx: Context<CC>): void;
    protected cache: Cache_2<AxiosPromise>;
    cancelAll(msg?: string): void;
    cancelCurrentRequest?: Canceler;
    protected readonly cancelerSet: Set<Canceler>;
    cancelWithTag(tag: CustomConfig['tag'], msg?: string): void;
    protected execRequest(ctx: RetryContext<CC>): Promise<any>;
    protected fetch(ctx: RetryContext<CC>): AxiosPromise<any>;
    protected generateContext(customConfig: CC, requestConfig: AxiosRequestConfig): Context<CC>;
    protected generateRequestKey(ctx: Omit<Context<CC>, 'requestKey'>): string;
    protected globalConfigs: Configs<CC>;
    protected handleCanceler(ctx: Context<CC>): void;
    protected handleCustomConfig(customConfig: CC): CC;
    protected handleError(ctx: Context<CC>, e: AxiosError<ResType<any>>): ResType<any> | AxiosResponse<ResType<any>, any> | Promise<any>;
    protected handleRequestConfig(requestConfig: AxiosRequestConfig): AxiosRequestConfig;
    protected handleResponse<T>(ctx: Context<CC>, response: AxiosResponse): ResType<T>;
    protected handleRetry(ctx: Context<CC>): void;
    protected handleStatus(ctx: Context<CC>, response: AxiosResponse<ResType<any>>, data: ResType<any>): Promise<any> | AxiosResponse<ResType<any>> | ResType<any>;
    protected init(): void;
    protected get interceptors(): {
        request: AxiosInterceptorManager<AxiosRequestConfig<any>>;
        response: AxiosInterceptorManager<AxiosResponse<any, any>>;
    };
    protected isCancel(value: any): boolean;
    protected mergeCacheConfig(cacheConfig: CustomConfig['cache']): CustomCacheConfig;
    protected mergeRetryConfig(retryConfig: CustomConfig['retry']): RetryConfig;
    methodFactory(method: Method, handler?: (configs: Configs) => void): <T = never, RC extends boolean = false>(requestConfig: Omit<AxiosRequestConfig, 'cancelToken' | 'url' | 'method'> & {
        url: string;
    }, customConfig?: DynamicCustomConfig<CC, RC> | undefined) => Promise<RC extends true ? AxiosResponse<ResType<T>, any> : ResType<T>>;
    request<T = never, RC extends boolean = false>(requestConfig: Omit<AxiosRequestConfig, 'cancelToken' | 'url'> & {
        url: string;
    }, customConfig?: DynamicCustomConfig<CC, RC>): Promise<RC extends true ? AxiosResponse<ResType<T>> : ResType<T>>;
    protected setInterceptors(): void;
    simplifyMethodFactory(method: Method, urlPrefix?: string): <T = never, RC extends boolean = false>(url: string, data?: {}, customConfig?: DynamicCustomConfig<CC, RC>) => Promise<RC extends true ? AxiosResponse<ResType<T>, any> : ResType<T>>;
    protected readonly tagCancelMap: Map<string | symbol | undefined, Canceler[]>;
    use(configs: Partial<Configs<CC>>): <T = never, RC extends boolean = false>(requestConfig: Omit<AxiosRequestConfig, 'cancelToken' | 'url'> & {
        url: string;
    }, customConfig?: DynamicCustomConfig<CC, RC> | undefined) => Promise<ResType<T>>;
    // (undocumented)
    static useAxios(axios: AxiosStatic): void;
    protected useCache(ctx: Context<CC>, request: () => Promise<any>): Promise<any>;
}

// @public (undocumented)
class Cache_2<V> {
    constructor(cache?: Map<any, {
        value: V;
        expires: number;
    }>);
    // (undocumented)
    protected readonly cache: Map<any, {
        value: V;
        expires: number;
    }>;
    // (undocumented)
    clearDeadCache(): void;
    // (undocumented)
    delete(key: any): void;
    // (undocumented)
    get(key: any): V | null;
    // (undocumented)
    has(key: any): boolean;
    // (undocumented)
    set(key: any, value: V, { timeout }?: {
        timeout?: number;
    }): void;
}
export { Cache_2 as Cache }

// @public (undocumented)
export interface Configs<CC extends CustomConfig = CustomConfig> {
    // (undocumented)
    customConfig: CC;
    // (undocumented)
    requestConfig: AxiosRequestConfig;
}

// @public (undocumented)
export interface Context<CC> extends Configs<CC> {
    // (undocumented)
    clearSet: Set<Function>;
    // (undocumented)
    requestKey: string;
    // (undocumented)
    retry?: (e: AxiosError<ResType<any>>) => AxiosPromise;
}

// @public (undocumented)
export interface CustomCacheConfig {
    enable?: boolean;
    failedReq?: boolean;
    timeout?: number;
}

// @public
export interface CustomConfig {
    cache?: boolean | CustomCacheConfig;
    retry?: number | RetryConfig;
    returnRes?: boolean;
    silent?: boolean;
    statusHandlers?: StatusHandlers;
    tag?: string | symbol;
}

// @public (undocumented)
export type DynamicCustomConfig<CC extends CustomConfig, RC extends boolean> = Omit<CC, 'returnRes'> & (RC extends false ? {
    returnRes?: RC;
} : {
    returnRes: true;
});

// @public (undocumented)
export enum HttpStatus {
    // (undocumented)
    ACCEPTED = 202,
    // (undocumented)
    AMBIGUOUS = 300,
    // (undocumented)
    BAD_GATEWAY = 502,
    // (undocumented)
    BAD_REQUEST = 400,
    // (undocumented)
    CONFLICT = 409,
    // (undocumented)
    CONTINUE = 100,
    // (undocumented)
    CREATED = 201,
    // (undocumented)
    EARLYHINTS = 103,
    // (undocumented)
    EXPECTATION_FAILED = 417,
    // (undocumented)
    FAILED_DEPENDENCY = 424,
    // (undocumented)
    FORBIDDEN = 403,
    // (undocumented)
    FOUND = 302,
    // (undocumented)
    GATEWAY_TIMEOUT = 504,
    // (undocumented)
    GONE = 410,
    // (undocumented)
    HTTP_VERSION_NOT_SUPPORTED = 505,
    // (undocumented)
    I_AM_A_TEAPOT = 418,
    // (undocumented)
    INTERNAL_SERVER_ERROR = 500,
    // (undocumented)
    LENGTH_REQUIRED = 411,
    // (undocumented)
    METHOD_NOT_ALLOWED = 405,
    // (undocumented)
    MISDIRECTED = 421,
    // (undocumented)
    MOVED_PERMANENTLY = 301,
    // (undocumented)
    NO_CONTENT = 204,
    // (undocumented)
    NON_AUTHORITATIVE_INFORMATION = 203,
    // (undocumented)
    NOT_ACCEPTABLE = 406,
    // (undocumented)
    NOT_FOUND = 404,
    // (undocumented)
    NOT_IMPLEMENTED = 501,
    // (undocumented)
    NOT_MODIFIED = 304,
    // (undocumented)
    OK = 200,
    // (undocumented)
    PARTIAL_CONTENT = 206,
    // (undocumented)
    PAYLOAD_TOO_LARGE = 413,
    // (undocumented)
    PAYMENT_REQUIRED = 402,
    // (undocumented)
    PERMANENT_REDIRECT = 308,
    // (undocumented)
    PRECONDITION_FAILED = 412,
    // (undocumented)
    PROCESSING = 102,
    // (undocumented)
    PROXY_AUTHENTICATION_REQUIRED = 407,
    // (undocumented)
    REQUEST_TIMEOUT = 408,
    // (undocumented)
    REQUESTED_RANGE_NOT_SATISFIABLE = 416,
    // (undocumented)
    RESET_CONTENT = 205,
    // (undocumented)
    SEE_OTHER = 303,
    // (undocumented)
    SERVICE_UNAVAILABLE = 503,
    // (undocumented)
    SWITCHING_PROTOCOLS = 101,
    // (undocumented)
    TEMPORARY_REDIRECT = 307,
    // (undocumented)
    TOO_MANY_REQUESTS = 429,
    // (undocumented)
    UNAUTHORIZED = 401,
    // (undocumented)
    UNPROCESSABLE_ENTITY = 422,
    // (undocumented)
    UNSUPPORTED_MEDIA_TYPE = 415,
    // (undocumented)
    URI_TOO_LONG = 414
}

// @public (undocumented)
export interface ResType<T = never> {
    // (undocumented)
    code: number;
    // (undocumented)
    data: T;
    // (undocumented)
    msg: string;
}

// @public (undocumented)
export interface RetryConfig {
    immediate?: boolean;
    interval?: number;
    times?: number;
}

// @public (undocumented)
export interface RetryContext<CC> extends Context<CC> {
    // (undocumented)
    isRetry?: boolean;
}

// @public (undocumented)
export type StatusHandler<CC extends CustomConfig> = (ctx: Context<CC>, res: AxiosResponse<ResType<any>>, data: ResType<any>) => void | Promise<any>;

// @public (undocumented)
export type StatusHandlers<CC extends CustomConfig = CustomConfig> = Record<number, StatusHandler<CC>> & {
    default?: StatusHandler<CC>;
};

// (No @packageDocumentation comment for this package)

```