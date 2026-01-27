/* src/pages/index/index.jsx */
import { View, Text } from "@tarojs/components"
import Taro, { useDidShow, useLoad, usePullDownRefresh, useShareAppMessage } from "@tarojs/taro"
import { useState } from "react"
import { detail } from "../../api/api"
import MyApply from "../my-apply/index" 
import ApplicationList from "../application-list/index"
import PendingApprovals from "../pending-approvals/index"
import "./index.scss"

export default function Index() {
  const [active, setActive] = useState("myApply")
  const [userDetail, setUserDetail] = useState({})

  const init = () => {
    const getDetail = async () => {
      let dt = await detail()
      if (dt) {
        setUserDetail(dt)
      }
    }
    getDetail()
  }

  useLoad(init)
  useDidShow(init)
  usePullDownRefresh(init)

  // useDidShow(() => {
  //   const getDetail = async () => {
  //     let dt = await detail()
  //     if (dt) {
  //       setIsHr(dt.department === "人力部")
  //       setIsEmployee(dt.level === "employee")
  //     }
  //   }
  //   getDetail()
  // })

  // 跳转到修改信息页面
  const handleEditProfile = () => {
    Taro.navigateTo({
      url: '/pages/update-user/index'
    })
  }

  // 【新增】跳转到人员/注册审核页面
  const handleHrReview = () => {
    Taro.navigateTo({
      url: '/pages/hr-review-list/index' 
    })
  }

  return (
      <View className="page-container">
        {/* 顶部 Header 区域 - 保持原样 */}
        <View className="page-header" style={{ position: 'relative' }}>
          
          <View className={`header-tab ${active === "myApply" ? 'active' : ''}`} onClick={() => setActive("myApply")}>
            <Text className='title'>我的申请</Text>
          </View>
          
          {(userDetail.level === "deputy_manager" || userDetail.level === "department_manager" || userDetail.level === "manager") && (
            <View className={`header-tab ${active === "pendingApprovals" ? 'active' : ''}`} onClick={() => setActive("pendingApprovals")}>
              <Text className="title">待我审批</Text>
            </View>
          )}

          {(userDetail.level === "deputy_manager" || userDetail.level === "department_manager" || userDetail.level === "manager" || userDetail.department === "人力部") && (
            <View className={`header-tab ${active === "applicationList" ? 'active' : ''}`} onClick={() => setActive("applicationList")}>
              <Text className="title">审批列表</Text>
            </View>
          )}

          {/* 原右侧修改信息按钮 - 保持原样 */}
          <View 
            onClick={handleEditProfile}
            style={{
              position: 'absolute',
              right: '24rpx',    
              top: '50%',        
              transform: 'translateY(-50%)',
              padding: '8rpx 16rpx',
              fontSize: '22rpx',
              color: '#409eff',  
              backgroundColor: '#f6faff', 
              borderRadius: '24rpx',
              zIndex: 10,
              border: '1px solid #e1f0ff'
            }}
          >
            修改信息
          </View>
        </View>

        {/* 底部内容区域 */}
        <View className="page-content">
          {active === "myApply" && <MyApply />}
          {active === "pendingApprovals" && <PendingApprovals />}
          {active === "applicationList" && <ApplicationList/>}
        </View>

        {/* 【新增】HR 专属悬浮按钮 - 只在右下角悬浮显示 */}
        {(userDetail.level === "manager" || userDetail.department === "人力部") && (
          <View 
            className="hr-float-btn"
            onClick={handleHrReview}
          >
            <Text className="yt-text">注册</Text>
            <Text className="yt-text">审核</Text>
          </View>
        )}
        
      </View>
  )
}