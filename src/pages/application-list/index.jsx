import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { navigateTo } from '@tarojs/taro'
import './index.scss'
import { getApplicationList } from '../../api/api'

// 你的 Maps
const typeMap = {
  personal: "事假",
  annual: "年假",
  sick: "病假",
  marriage: "婚假",
  maternity: "产假",
  funeral: "丧假"
}

const statusMap = {
  pending: '审批中',
  approved: '已通过',
  rejected: '被驳回'
}

export default function ApplicationList() {
  const [applicationList, setApplicationList] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // 模拟第一次加载
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    // 你的数据逻辑
    try {
      let pa = await getApplicationList(); 
      setApplicationList(pa || [])
    } catch(e) {}
    setLoading(false)
    setRefreshing(false)
  }

  const onPullDown = () => {
    setRefreshing(true)
    fetchData()
  }

  const detailPage = (id) => navigateTo({ url: "/pages/approval-detail/index?id=" + id })

  return (
    <View className="application-list-root"> 
      <View className='stats-bar'>
        <Text className='stats-text'>APPLICATIONS</Text>
        <Text className='stats-num'>{loading ? '-' : applicationList.length}</Text>
      </View>

      <ScrollView 
        className='scroll-view-container' 
        scrollY
        refresherEnabled
        refresherTriggered={refreshing}
        onRefresherRefresh={onPullDown}
      >
        <View className='list-inner'>
          {loading && !refreshing ? (
             <View className='status-box'><Text>Loading List...</Text></View>
          ) : (
            applicationList.map(item => (
              <View key={item.id} className='card-item' onClick={() => detailPage(item.id)}>
                
                {/* 1. Left */}
                <View className='left-part'>
                  <Text className='big-stat'>{item.duration}</Text>
                  <Text className='small-label'>DAYS</Text>
                </View>

                {/* 2. Middle */}
                <View className='mid-part'>
                  <View className='row-one'>
                    <Text className='applicant-name'>{item.applicant}</Text>
                    {item.leaveDays !== undefined && (
                      <Text className='leave-badge'>今年已请{item.leaveDays}天</Text>
                    )}
                  </View>

                  <View className='row-two'>
                    <Text className='type-tag'>{typeMap[item.type]}</Text>
                    <Text className='date-val'>{item.startDate}→{item.endDate}</Text>
                  </View>
                  
                   <Text className='reason-text'>{item.reason}</Text>
                </View>
                
                {/* 3. Right Badge */}
                <View className={`right-tag tag-${item.status}`}>
                  <Text className="tag-text">{statusMap[item.status] || item.status}</Text>
                </View>

              </View>
            ))
          )}
          <View style={{ height: '80px' }}></View>
        </View>
      </ScrollView>
    </View>
  )
}