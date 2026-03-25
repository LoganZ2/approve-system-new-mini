const CLOUD_ENV = 'prod-0gov9rdc5eed3c97';
const SERVICE = 'approval';

// 防止并发多弹窗的锁
let isModalShowing = false;

class Http {
  async _request(method, url, data = {}) {
    let targetPath = url;
    let requestData = data;

    if (method === 'GET' && Object.keys(data).length > 0) {
      const queryStr = Object.keys(data)
        .map(key => `${key}=${encodeURIComponent(data[key])}`)
        .join('&');
      targetPath += `?${queryStr}`;
      requestData = {};
    }

    console.log(targetPath);

    return new Promise((resolve, reject) => {
      wx.cloud.callContainer({
        config: { env: CLOUD_ENV },
        path: targetPath,
        method: method,
        header: {},
        data: requestData,
        service: SERVICE,
        success: (res) => this._handleSuccess(res, resolve, reject),
        fail: (err) => this._handleFail(err, reject)
      });
    });
  }

  _handleSuccess(res, resolve, reject) {
    const statusCode = res.statusCode; 
    const result = res.data; 

    if (statusCode === 401 || (result && result.code === 401)) {
      this._doLoginRedirect();
      return reject({ message: '未登录', code: 401 });
    }

    if (statusCode >= 200 && statusCode < 300) {
      if (result.code === 200) {
        resolve(result.data); 
      } else {
        wx.showToast({ title: result.message || '操作失败', icon: 'none' });
        reject(result);
      }
    } else {
      const errMsg = (result && result.message) ? result.message : '服务器错误';
      wx.showToast({ title: errMsg, icon: 'none' });
      reject(res);
    }
  }

  _handleFail(err, reject) {
    console.error('Network Error:', err);
    wx.showToast({ title: '网络请求超时', icon: 'none' });
    reject(err);
  }

  _doLoginRedirect() {
    if (isModalShowing) return;
    
    isModalShowing = true;
    wx.showModal({
      title: '提示',
      content: '请先完成注册',
      showCancel: true,
      success: (res) => {
        if (res.confirm) {
          wx.navigateTo({ url: '/pages/register/index' });
        }
      },
      complete: () => {
        // 延时释放，防止短时间内无法再次触发
        setTimeout(() => { isModalShowing = false; }, 200);
      }
    });
  }

  get(url, params = {}) { return this._request('GET', url, params); }
  post(url, data = {}) { return this._request('POST', url, data); }
  put(url, data = {}) { return this._request('PUT', url, data); }
  delete(url, data = {}) { return this._request('DELETE', url, data); }
}

export default new Http();
