import { Context, CustomConfig, RequestTemplate } from 'request-template';

/**
 * 微信小程序请求自定义配置，继承自CustomConfig
 */
export interface WechatCustomConfig extends CustomConfig {
  /**
   * 是否显示loading
   */
  loading?: boolean;
  /**
   * 是否显示成功提示
   */
  showSuccessMsg?: boolean;
  /**
   * 成功提示信息
   */
  successMsg?: string;
}

/**
 * 微信小程序请求封装类，继承自RequestTemplate
 */
export class WechatRequestTemplate<
  CC extends WechatCustomConfig = WechatCustomConfig,
> extends RequestTemplate<CC> {
  /**
   * 使用小程序的取消判断逻辑
   */
  protected override isCancel(value: any) {
    return value?.errMsg === 'request:fail abort';
  }

  /**
   * 使用小程序内部的请求重写fetch方法
   */
  protected override fetch(ctx) {
    const baseConfig = this.globalConfigs.requestConfig;
    const config = ctx.requestConfig;

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

  // eslint-disable-next-line
  protected override handleCanceler(_ctx) {}

  /**
   * 请求前配置loading和配置处理
   */
  protected override beforeRequest(ctx: Context<CC>) {
    // 复用基础模板逻辑
    super.beforeRequest(ctx);

    // 未设置showSuccessMsg时，且非get请求则全部显示请求成功信息
    if (ctx.requestConfig.method !== 'get' && ctx.customConfig.showSuccessMsg === undefined) {
      ctx.customConfig.showSuccessMsg = true;
    }

    // 全局开启loading
    if (ctx.customConfig.loading) {
      wx.showLoading({ title: 'LOADING...' });
    }
  }

  // 关闭loading
  protected override afterRequest(ctx) {
    super.afterRequest(ctx); // 复用基础模板逻辑
    // 加个定时器避免请求太快，loading一闪而过
    setTimeout(() => {
      wx.hideLoading();
    }, 200);
  }
}
