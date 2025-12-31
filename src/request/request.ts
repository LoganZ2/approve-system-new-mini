import Taro from '@tarojs/taro';

/**
 * 接口基础响应结构
 */
interface ApiResponse<T = any> {
  code: number;
  data: T;
  message: string;
}

// 自动切换环境（微信开发工具中可配置）
const BASE_URL = 'http://localhost:3000';

/**
 * 通用请求公共函数
 */
async function request<T = any>(
  url: string,
  method: keyof Taro.request.Method = 'GET',
  data?: any,
  options: Partial<Taro.request.Option> = {}
): Promise<T> {
  
  // 1. 从缓存获取 Token
  const token = Taro.getStorageSync('token');

  try {
    const res = await Taro.request<ApiResponse<T>>({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: {
        'content-type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
        ...options.header,
      },
      ...options,
    });

    const { statusCode, data: body } = res;

    // 2. HTTP 状态码拦截（逻辑层）
    if (statusCode === 401) {
      // 登录失效逻辑
      Taro.clearStorageSync();
      Taro.showToast({ title: '登录已过期', icon: 'none' });
      // 可以在这里做自动重新登录逻辑或跳转
      // Taro.reLaunch({ url: '/pages/login/index' });
      return Promise.reject(new Error('Unauthorized'));
    }

    if (statusCode >= 500) {
      Taro.showToast({ title: '服务器忙，请后重试', icon: 'none' });
      return Promise.reject(new Error('Server Error'));
    }

    // // 3. 业务状态码处理（约定 code: 0 为成功）
    // if (body.code !== 0) {
    //   Taro.showToast({
    //     title: body.message || '请求失败',
    //     icon: 'none',
    //   });
    //   return Promise.reject(body);
    // }

    // 返回纯数据，前端调用时少写一层 .data
    return body.data;

  } catch (error) {
    // 捕获请求超时、无网络等物理故障
    Taro.showToast({ title: '网络故障', icon: 'none' });
    return Promise.reject(error);
  }
}

// 简便方法封装
export const http = {
  get: <T>(url: string, data?: any) => request<T>(url, 'GET', data),
  post: <T>(url: string, data?: any) => request<T>(url, 'POST', data),
  put: <T>(url: string, data?: any) => request<T>(url, 'PUT', data),
  delete: <T>(url: string, data?: any) => request<T>(url, 'DELETE', data),
};