import type { Canceler as AxiosCanceler } from 'axios';
import { Context, CustomConfig } from './types';

/**
 * Canceler管理类
 */
export class Canceler<CC extends CustomConfig = CustomConfig> {
  /**
   * cancel函数缓存
   */
  protected readonly cancelerSet = new Set<AxiosCanceler>();
  /**
   * tag cancel函数缓存
   */
  protected readonly tagCancelMap = new Map<CustomConfig['tag'], AxiosCanceler[]>();

  /**
   * 注册canceler
   */
  register(ctx: Context<CC>, canceler: AxiosCanceler) {
    const { customConfig, clearSet } = ctx;
    const tag = customConfig.tag;

    // 设置 通过tag取消
    if (tag) {
      // 初始化tag Map
      if (!this.tagCancelMap.has(tag)) {
        this.tagCancelMap.set(tag, []);
      }
      (this.tagCancelMap.get(tag) as AxiosCanceler[]).push(canceler);

      // 添加 取消时顺便取消掉tag Map
      clearSet.add(() => {
        const cancelers = this.tagCancelMap.get(tag);
        if (!cancelers || !cancelers.length) return;
        const index = cancelers.indexOf(canceler);
        cancelers.splice(index, 1);
      });
    }

    // 设置取消
    this.cancelerSet.add(canceler);
    // 清理取消
    const clearCanceler = () => {
      this.cancelerSet.delete(canceler);
    };
    clearSet.add(clearCanceler);

    // 取消当前请求
    // 注意：请求多的时候无法判断取消的就是你要取消的请求
    this.cancelCurrentRequest = (msg) => {
      canceler(msg);
      clearCanceler();
    };
  }

  cancelCurrentRequest?: AxiosCanceler;

  /**
   * 取消所有请求
   */
  cancelAll(msg?: string) {
    this.cancelerSet.forEach((canceler) => {
      canceler(msg);
    });
    this.cancelerSet.clear();
    this.tagCancelMap.clear();
  }

  /**
   * 根据tag标签取消请求
   */
  cancelWithTag(tag: CustomConfig['tag'], msg?: string) {
    const cancelers = this.tagCancelMap.get(tag);
    if (!cancelers) return;
    cancelers.forEach((canceler) => {
      canceler(msg);
      this.cancelerSet.delete(canceler);
    });

    this.tagCancelMap.delete(tag);
  }
}
