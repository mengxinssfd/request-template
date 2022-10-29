import { Context, CustomConfig, RequestTemplate } from 'request-template';

export interface WechatCustomConfig extends CustomConfig {
  loading?: boolean;
  showSuccessMsg?: boolean;
  successMsg?: string;
}

export class WechatRequestTemplate<
  CC extends WechatCustomConfig = WechatCustomConfig,
> extends RequestTemplate<CC> {
  protected isCancel(value: any) {
    return value?.errMsg === 'request:fail abort';
  }

  protected fetch(ctx) {
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
  protected handleCanceler(_ctx) {}

  protected beforeRequest(ctx: Context<CC>) {
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
  protected afterRequest(ctx) {
    super.afterRequest(ctx); // 复用基础模板逻辑
    // 加个定时器避免请求太快，loading一闪而过
    setTimeout(() => {
      wx.hideLoading();
    }, 200);
  }
}
