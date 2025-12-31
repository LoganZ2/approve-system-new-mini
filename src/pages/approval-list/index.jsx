import React, { useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import './index.scss'

export default function ApprovalList() {
  const [approvalList, setApprovalList] = useState([])
  const [loading, setLoading] = useState(true)

  useLoad(() => {
    loadApprovalList()
  })

  // 模拟接口
  const loadApprovalList = () => {
    setLoading(true)
    setTimeout(() => {
      const mockData = [
        {
          id: '1',
          applicant: '张三',
          type: '事假',
          startDate: '2024-01-15',
          endDate: '2024-01-17',
          duration: '3',
          reason: '家里有些急事需要回去处理。',
          applyTime: '09:30 AM'
        },
        {
          id: '2',
          applicant: '欧阳娜娜', // 带小数点的测试
          type: '调休',
          startDate: '2024-02-01',
          endDate: '2024-02-01',
          duration: '0.5', 
          reason: '上周加班调休，身体不适需要休息一下。',
          applyTime: '01-19'
        },
        {
          id: '3',
          applicant: '李四',
          type: '病假',
          startDate: '2024-01-16',
          endDate: '2024-01-16',
          duration: '1',
          reason: '发烧39度，去医院挂水。',
          applyTime: 'Yesterday'
        },
        {
          id: '4',
          applicant: '周杰伦',
          type: '婚假',
          startDate: '2024-05-20',
          endDate: '2024-05-25',
          duration: '5.0',
          reason: '我们要结婚了，请大家吃喜糖。',
          applyTime: '02-14'
        },
        {
            id: '5',
            applicant: '陈奕迅',
            type: '年假',
            startDate: '2024-07-01',
            endDate: '2024-07-15',
            duration: '150.5',
            reason: '世界巡回演唱会结束后休息。',
            applyTime: '06-20'
        }
      ]
      setApprovalList(mockData)
      setLoading(false)
    }, 600)
  }

  const handleApprove = (e, id) => {
    e.stopPropagation()
    Taro.showToast({ title: '已通过', icon: 'success' })
    setApprovalList(prev => prev.filter(item => item.id !== id))
  }

  const handleReject = (e, id) => {
    e.stopPropagation()
    Taro.showToast({ title: '已拒绝', icon: 'none' })
    setApprovalList(prev => prev.filter(item => item.id !== id))
  }

  const navigateToDetail = (item) => {
    console.log('Jump to detail', item.id)
  }

  return (
    <View className='approval-page'>
      {/* 1. 头部固定 */}
      <View className='header'>
        <Text className='title'>待我审批</Text>
        <Text className='subtitle'>
           {loading ? 'LOADING...' : `${approvalList.length} PENDING TASKS`}
        </Text>
      </View>

      {/* 2. 滚动区域：不可设置 padding */}
      <ScrollView className='scroll-view-container' scrollY>
        {/* 3. 内部容器：在这里设置 padding 左右留白 */}
        <View className='list-inner'>
          
          {loading ? (
             <View className='status-text'><Text>Loading...</Text></View>
          ) : approvalList.length === 0 ? (
             <View className='status-text'><Text>No Pending Tasks</Text></View>
          ) : (
            approvalList.map(item => (
              <View key={item.id} className='card-item' onClick={() => navigateToDetail(item)}>
                
                {/* ------ 上半部分：左数字 + 右信息 ------ */}
                <View className='card-body'>
                  
                  {/* 左侧：定宽 120px，哪怕 0.5 也很宽裕 */}
                  <View className='left-col'>
                    <Text className='big-num'>{item.duration}</Text>
                    <Text className='unit'>DAYS</Text>
                  </View>

                  {/* 右侧：信息流 */}
                  <View className='right-col'>
                    <View className='user-row'>
                      <Text className='name'>{item.applicant}</Text>
                      <Text className='tag'>{item.type}</Text>
                    </View>
                    <Text className='date'>
                      {item.startDate} - {item.endDate}
                    </Text>
                    <Text className='reason'>{item.reason}</Text>
                  </View>

                </View>

                {/* ------ 下半部分：按钮组 ------ */}
                <View className='card-actions'>
                  <View 
                    className='btn btn-reject' 
                    onClick={(e) => handleReject(e, item.id)}
                  >
                    <Text>拒绝</Text>
                  </View>
                  <View style={{width:'20px'}}></View> {/* 中间占位 */}
                  <View 
                    className='btn btn-approve' 
                    onClick={(e) => handleApprove(e, item.id)}
                  >
                    <Text>通过</Text>
                  </View>
                </View>

              </View>
            ))
          )}
          {/* 底部垫高 */}
          <View style={{ height: '60px' }}></View>
        </View>
      </ScrollView>
    </View>
  )
}