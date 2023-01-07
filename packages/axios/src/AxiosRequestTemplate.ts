import type { AxiosInstance, AxiosStatic } from 'axios';
import { RequestTemplate, CustomConfig, Context, RetryContext } from 'request-template';

/**
 * axios请求封装类，继承自RequestTemplate
 *
 * 使用模板方法模式处理axios请求, 具体类可实现protected的方法替换掉原有方法
 * 自定义配置可继承CustomConfig实现
 */
export class AxiosRequestTemplate<
  CC extends CustomConfig = CustomConfig,
> extends RequestTemplate<CC> {
  protected static axios: AxiosStatic;

  /**
   * 用axios作为请求工具时必须调用该方法
   */
  static useAxios(axios: AxiosStatic) {
    this.axios = axios;
  }

  /**
   * 获取axios，并判断是否已设置了axios
   * @returns {AxiosStatic}
   */
  protected get axios(): AxiosStatic {
    const proto = Object.getPrototypeOf(this).constructor;
    const axios = proto.axios;
    if (!axios || typeof axios.create !== 'function') {
      throw new Error('使用前必须先传入axios，调用useAxios(axios)');
    }
    return axios;
  }

  /**
   * axios实例
   */
  protected axiosIns!: AxiosInstance;

  /**
   * 重写初始化函数
   */
  protected override init() {
    // 1、保存基础配置
    this.axiosIns = this.axios.create(this.globalConfigs.requestConfig);
    super.init();
    this.setInterceptors();
  }

  /**
   * 获取拦截器
   */
  protected get interceptors() {
    return this.axiosIns.interceptors;
  }

  /**
   * 设置拦截器
   */
  protected setInterceptors() {
    // 重写此函数会在Request中调用
    // example
    // this.interceptors.request.use(() => {
    //   /* do something */
    // });
  }

  /**
   * 请求
   */
  protected fetch(ctx: RetryContext<CC>) {
    return this.axiosIns(ctx.requestConfig);
  }

  /**
   * 使isCancel支持子类覆盖
   */
  protected isCancel(value: unknown) {
    return this.axios.isCancel(value);
  }

  /**
   * 设置取消handler
   */
  protected handleCanceler(ctx: Context<CC>) {
    // 专属axios的取消功能
    const { requestConfig } = ctx;
    const { cancel, token } = this.axios.CancelToken.source();
    requestConfig.cancelToken = token;
    this.registerCanceler(ctx, cancel);
  }
}
