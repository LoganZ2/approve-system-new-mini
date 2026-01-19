import { useLaunch } from '@tarojs/taro'

import './app.scss'



function App({ children }) {
  useLaunch(async () => {
    await wx.cloud.init({
      env: 'prod-0gov9rdc5eed3c97'
    })
    console.log('App launched.')
  })

  // children 是将要会渲染的页面
  return children
}
  


export default App
