
import { View, Text } from "@tarojs/components"
import Taro, { stopPullDownRefresh, useLoad, usePullDownRefresh } from "@tarojs/taro"
import { useState } from "react"
import { approveUpdateInfoRequest, updateInfoRequests } from "../../api/api"
import "./index.scss"

const levelMap = {
  employee: "职员",
  department_manager: "部门经理",
  deputy_manager: "副总经理",
  manager: "总经理"
}

export default function HrReviewList() {
  const [list, setList] = useState([])

  useLoad(() => {
    fetchList()
  })

  usePullDownRefresh(() => {
    fetchList()
  })

  const fetchList = async () => {
    const infoList = await updateInfoRequests()
    setList(infoList)
    stopPullDownRefresh()
  }

  // 通用操作处理
  const handleAction = async (item, actionType, e) => {
    e.stopPropagation()
    const isPass = actionType === 'pass'
    
    const content = isPass 
      ? `确认通过「${item.name}」的${item.type === 'register' ? '注册' : '变更'}申请？`
      : '确认驳回该申请吗？'

    Taro.showModal({
      title: isPass ? '审核通过' : '审核驳回',
      content: content,
      success: async (res) => {
        if (res.confirm) {
          console.log(`ID: ${item.id}, Type: ${item.type}, Action: ${actionType}`)
          await approveUpdateInfoRequest({
            id: item.id,
            pass: isPass
          })
          
          setList(prev => prev.filter(i => i.id !== item.id))
          Taro.showToast({ title: '处理完成', icon: isPass ? 'success' : 'none' })
        }
      }
    })
  }
  
  const renderFieldRow = (label, value, oldValue, isUpdate) => {
    return (
      <View className="info-row">
        <Text className="label">{label}</Text>
        <View className="value-area">
          {isUpdate ? (
            <View className="diff-wrap">
              <Text className="old-val">{oldValue || '空'}</Text>
              <Text className="arr">➞</Text>
              <Text className="new-val highlight">{value}</Text>
            </View>
          ) : (
            <Text className="s-val">{value}</Text>
          )}
        </View>
      </View>
    )
  }

  return (
    <View className="review-page">
      <View className="page-header">
        <Text className="title">注册审核</Text>
        <Text className="subtitle">待处理事项: {list.length}</Text>
      </View>

      <View className="list-container">
        {list.length > 0 ? (
          list.map(item => {
            const isUpdate = item.type === 'update'
            
            return (
              <View className="review-card" key={item.id}>
                {/* 顶部标签区分类型 */}
                <View className="card-top-bar">
                  <View className={`status-tag ${isUpdate ? 'is-update' : 'is-register'}`}>
                    {isUpdate ? '变更申请' : '新用户申请'}
                  </View>
                </View>

                <View className="card-content">
                  {/* 使用辅助函数渲染三行核心数据 */}
                  {renderFieldRow('姓名', item.name, item.oldName, isUpdate)}
                  {renderFieldRow('部门', item.department, item.oldDepartment, isUpdate)}
                  {renderFieldRow('职级', levelMap[item.level], levelMap[item.oldLevel], isUpdate)}
                </View>

                <View className="card-actions">
                  <View className="btn cancel" onClick={(e) => handleAction(item, 'reject', e)}>驳回</View>
                  <View className="btn confirm" onClick={(e) => handleAction(item, 'pass', e)}>通过</View>
                </View>
              </View>
            )
          })
        ) : (
          <View className="empty-tips">暂无数据</View>
        )}
      </View>
    </View>
  )
}