export default defineAppConfig({
  pages: [

    // 'pages/register/index',
    'pages/index/index',
    'pages/application-list/index',
    'pages/pending-approvals/index',
    'pages/hr-review-list/index',
    'pages/my-apply/index',
    'pages/apply/index',
    'pages/approval-detail/index',
    'pages/register/index',
    'pages/update-user/index',

  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '请假审批系统',
    navigationBarTextStyle: 'black'
  },
  // tabBar: {
  //   color: '#666666',
  //   selectedColor: '#1890ff',
  //   backgroundColor: '#ffffff',
  //   borderStyle: 'black',
  //   list: [
  //     {
  //       pagePath: 'pages/apply/index',
  //       text: '申请'
  //     },
  //     {
  //       pagePath: 'pages/approval-list/index',
  //       text: '审批'
  //     },
  //     {
  //       pagePath: 'pages/my-apply/index',
  //       text: '我的'
  //     }
  //   ]
  // }
})
