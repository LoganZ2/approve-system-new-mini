/* src/views/approval-list/index.jsx */
import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { navigateTo, useLoad } from '@tarojs/taro'
import './index.scss'
import { pendingApprovals } from '../../api/api'

export default function ApprovalList() {
  const [approvalList, setApprovalList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadApprovalList()
  }, [])

  const detailPage = (id) => {
    console.log("aowjefioawjefojwa");
    if (id) {
      console.log("oawiejfiowajef")
      navigateTo({
        url: "/pages/approval-detail/index?id=" + id

      })
    }
  }

  // 模拟接口
  const loadApprovalList = () => {
    setLoading(true)
    const retrieval = async () => {
      let pa = await pendingApprovals();
      setApprovalList(pa);
      setLoading(false)
    }
    retrieval()
  }

  const handleApprove = (e, id) => {
    e.stopPropagation()
    Taro.showToast({ title: '已通过', icon: 'none' })
    // 前端模拟删除
    setApprovalList(prev => prev.filter(item => item.id !== id))
  }

  const handleReject = (e, id) => {
    e.stopPropagation()
    Taro.showToast({ title: '已拒绝', icon: 'none' })
    setApprovalList(prev => prev.filter(item => item.id !== id))
  }

  return (
    <View className="approval-list-root"> 
      
      {/* 1. 因为父组件已经有 Tab 标题了，这里如果不需要额外标题可以不写。
           如果你想要一个小的数据统计条，放在这里很合适 
      */}
      <View className='stats-bar'>
        <Text className='stats-text'>WAITING FOR REVIEW</Text>
        <Text className='stats-num'>{loading ? '-' : approvalList.length}</Text>
      </View>

      {/* 2. 核心滚动区：必须在 Flex 布局中占满 flex: 1 */}
      <ScrollView className='scroll-view-container' scrollY>
        <View className='list-inner'>
          
          {loading ? (
             <View className='status-box'><Text>Loading List...</Text></View>
          ) : approvalList.length === 0 ? (
             <View className='status-box'><Text>ALL CLEAR · NO TASKS</Text></View>
          ) : (
            approvalList.map(item => (
              <View key={item.id} className='card-item' onClick={() => detailPage(item.id)}>
                
                {/* A. 信息主体区域 */}
                <View className='card-body'>
                  
                  {/* 左：大数字 */}
                  <View className='left-col'>
                    <Text className='big-num'>{item.duration}</Text>
                    <Text className='unit'>DAYS</Text>
                  </View>

                  {/* 右：详情 */}
                  <View className='right-col'>
                    <View className='user-row'>
                      <Text className='name'>{item.applicant}</Text>
                      <Text className='tag'>{item.type}</Text>
                    </View>
                    <Text className='date'>{item.startDate} → {item.endDate}</Text>
                    <Text className='reason' numberOfLines={2}>{item.reason}</Text>
                  </View>
                </View>
              </View>
            ))
          )}
          {/* Prevent bottom cut-off */}
          <View style={{ height: '80px' }}></View>
        </View>
      </ScrollView>
    </View>
  )
}
