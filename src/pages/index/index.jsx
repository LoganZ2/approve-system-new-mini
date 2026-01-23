/* src/pages/index/index.jsx */
import { View, Text } from "@tarojs/components"
import Taro, { useDidShow, useLoad } from "@tarojs/taro"
import { useState } from "react"
import { detail } from "../../api/api"
import ApprovalList from "../approval-list"
import MyApply from "../my-apply/index" 
import "./index.scss"

export default function Index() {
  const [active, setActive] = useState("myApply")
  const [isEmployee, setIsEmployee] = useState(true)

  useLoad(() => {
    const getDetail = async () => {
      let dt = await detail()
      if (dt) setIsEmployee(dt.level === "employee")
    }
    getDetail()
  })

  useDidShow(() => {
    const getDetail = async () => {
      let dt = await detail()
      if (dt) setIsEmployee(dt.level === "employee")
    }
    getDetail()
  })

  // 跳转到修改信息页面
  const handleEditProfile = () => {
    Taro.navigateTo({
      url: '/pages/update-user/index'
    })
  }

  return (
      <View className="page-container">
        {/* 顶部 Header 区域 */}
        {/* 增加 position: relative 确保内部的绝对定位按钮正常显示 */}
        <View className="page-header" style={{ position: 'relative' }}>
          
          <View className={`header-tab ${active === "myApply" ? 'active' : ''}`} onClick={() => setActive("myApply")}>
            <Text className='title'>我的申请</Text>
          </View>
          
          {!isEmployee && 
            <View className={`header-tab ${active === "approvalList" ? 'active' : ''}`} onClick={() => setActive("approvalList")}>
              <Text className="title">审批列表</Text>
            </View>
          }

          {/* 新增：修改信息按钮 (内联样式) */}
          <View 
            onClick={handleEditProfile}
            style={{
              position: 'absolute',
              right: '30rpx',    // 靠右距离
              top: '50%',        // 垂直居中
              transform: 'translateY(-50%)',
              padding: '10rpx 20rpx',
              fontSize: '26rpx',
              color: '#409eff',  // 使用了主题色类似的蓝色
              backgroundColor: '#f6faff', // 淡淡的背景色区分
              borderRadius: '24rpx',
              zIndex: 10
            }}
          >
            修改信息
          </View>
        </View>

        {/* 底部内容区域(占满余下空间) */}
        <View className="page-content">
          {active === "myApply" && <MyApply />}
          {active === "approvalList" && <ApprovalList/>}
        </View>
      </View>
  )
}