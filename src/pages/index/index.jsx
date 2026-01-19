/* src/pages/index/index.jsx */
import { View, Text } from "@tarojs/components"
import { useLoad } from "@tarojs/taro"
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
      setIsEmployee(dt.level === "employee")
    }
    getDetail()
  })

  return (
      <View className="page-container">
        {/* 顶部 Header 区域 */}
        <View className="page-header">
          <View className={`header-tab ${active === "myApply" ? 'active' : ''}`} onClick={() => setActive("myApply")}>
            <Text className='title'>我的申请</Text>
          </View>
          {!isEmployee && 
            <View className={`header-tab ${active === "approvalList" ? 'active' : ''}`} onClick={() => setActive("approvalList")}>
              <Text className="title">审批列表</Text>
            </View>
          }
        </View>

        {/* 底部内容区域(占满余下空间) */}
        <View className="page-content">
          {active === "myApply" && <MyApply />}
          {active === "approvalList" && <ApprovalList/>}
        </View>
      </View>
  )
}