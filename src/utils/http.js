const CLOUD_ENV = 'prod-0gov9rdc5eed3c97'; // 你的微信云托管环境 ID
const SERVICE = 'approval';

class Http {
  async _request(method, url, data = {}) {

    const header = {};

    // 如果是 GET 请求，且有参数，手动拼接 query string
    // 这里是为了配合 NestJS 的 @Query() 读取参数，避免参数被放到 Body 里后端拿不到
    let targetPath = url;
    let requestData = data;

    if (method === 'GET' && Object.keys(data).length > 0) {
      const queryStr = Object.keys(data)
        .map(key => `${key}=${encodeURIComponent(data[key])}`)
        .join('&');
      targetPath += `?${queryStr}`;
      requestData = {}; // GET 请求清空 data，实际上 callContainer GET 不太推荐传 body
    }

    console.log(targetPath)

    return new Promise((resolve, reject) => {
      wx.cloud.callContainer({
        config: { env: CLOUD_ENV },
        path: targetPath,
        method: method,
        header: header,
        data: requestData,
        service: SERVICE,
        success: (res) => {
          this._handleSuccess(res, resolve, reject);
        },
        fail: (err) => {
          this._handleFail(err, reject);
        }
      });
    });
  }

  /**
   * 成功回调拦截器 ( 处理状态码、解包数据 )
   */
  _handleSuccess(res, resolve, reject) {
    const statusCode = res.statusCode; 
    const result = res.data; // 后端返回的 { code, data, message }

    // 1. 处理 HTTP 401 (未授权/未登录)
    if (statusCode === 401 || (result && result.code === 401)) {
      this._doLoginRedirect();
      return reject({ message: '未登录', code: 401 });
    }

    // 2. 处理 HTTP 200 到 299 之间算网络请求成功
    if (statusCode >= 200 && statusCode < 300) {
      // 进一步检查业务 code (我们约定的成功 Code 为 200)
      if (result.code === 200) {
        // --- 完美成功，由这行代码把外壳剥掉，直接返回 core data ---
        resolve(result.data); 
      } else {
        // --- 业务错误 (比如 code 409 重复创建, 500 报错) ---
        wx.showToast({ title: result.message || '操作失败', icon: 'none' });
        reject(result);
      }
    } else {
      // --- HTTP 非 200 错误 (比如 404, 500) ---
      const errMsg = (result && result.message) ? result.message : '服务器错误';
      wx.showToast({ title: errMsg, icon: 'none' });
      reject(res);
    }
  }

  /**
   * 网络层彻底失败 (断网等)
   */
  _handleFail(err, reject) {
    console.error('Network Error:', err);
    wx.showToast({ title: '网络请求超时', icon: 'none' });
    reject(err);
  }

  /**
   * 统一跳转登录逻辑
   */
  _doLoginRedirect() {
    wx.showModal({
      title: '提示',
      content: '请先完成注册',
      showCancel: true,
      success(res) {
        if (res.confirm) {
          wx.navigateTo({ url: '/pages/register/index' });
        }
      }
    });
  }

  // ================= 对外暴露的 4 个方法 =================

  /**
   * GET 请求
   * 对应 Nest: @Get() + @Query()
   */
  get(url, params = {}) {
    return this._request('GET', url, params);
  }

  /**
   * POST 请求
   * 对应 Nest: @Post() + @Body()
   */
  post(url, data = {}) {
    return this._request('POST', url, data);
  }

  /**
   * PUT 请求
   * 对应 Nest: @Put() + @Body()
   */
  put(url, data = {}) {
    return this._request('PUT', url, data);
  }

  /**
   * DELETE 请求
   * 对应 Nest: @Delete()
   */
  delete(url, data = {}) {
    return this._request('DELETE', url, data);
  }
}

export default new Http();