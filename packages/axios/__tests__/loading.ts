import { Context, CustomConfig } from 'request-template';
import { AxiosRequestTemplate } from '../src';
// 用于检查ts类型是否正确
interface MyConfig extends CustomConfig {
  loading?: boolean;
}

class RequestWithLoading<CC extends MyConfig = MyConfig> extends AxiosRequestTemplate<CC> {
  // private loading?: ILoadingInstance;
  private loading?: { close(): void };

  protected beforeRequest(ctx: Context<CC>) {
    super.beforeRequest(ctx); // 复用基础模板逻辑
    if (ctx.customConfig.loading) {
      // this.loading = ElLoading.service({ fullscreen: true });
      this.loading = {
        close() {
          console.log('close');
        },
      };
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

new RequestWithLoading().cancelAll();
