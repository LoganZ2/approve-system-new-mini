import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { navigateTo } from '@tarojs/taro'
import './index.scss'
import { pendingApprovals } from '../../api/api'

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

export default function ApprovalList() {
  const [approvalList, setApprovalList] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchData(true)
  }, [])

  const fetchData = async (isFirst = false) => {
    if(isFirst) setLoading(true);
    
    try {
      let pa = await pendingApprovals();
      setApprovalList(pa || []);
    } catch(e) { console.log(e) }
    
    setLoading(false)
    setRefreshing(false)
  }

  const onPullDown = () => {
    setRefreshing(true)
    fetchData(false)
  }

  const detailPage = (id) => {
    if (id) {
      navigateTo({
        url: "/pages/approval-detail/index?id=" + id
      })
    }
  }

  return (
    <View className="approval-list-root"> 
      
      <View className='stats-bar'>
        <Text className='stats-text'>WAITING FOR REVIEW</Text>
        <Text className='stats-num'>{loading ? '-' : approvalList.length}</Text>
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
          ) : approvalList.length === 0 ? (
             <View className='status-box'><Text>ALL CLEAR · NO TASKS</Text></View>
          ) : (
            approvalList.map(item => (
              <View key={item.id} className='card-item' onClick={() => detailPage(item.applicationId)}>
                
                <View className='left-part'>
                  <Text className='big-stat'>{item.duration}</Text>
                  <Text className='small-label'>DAYS</Text>
                </View>

                <View className='mid-part'>
                  <View className='row-one'>
                    <Text className='applicant-name'>{item.applicant}</Text>
                    {item.leaveDays !== undefined && (
                      <Text className='leave-badge'>今年已请{item.leaveDays}天</Text>
                    )}
                  </View>

                  <View className='row-two'>
                    <Text className='type-tag'>{typeMap[item.type]}</Text>
                    <Text className='date-val'>{item.startDate} → {item.endDate}</Text>
                  </View>
                  
                  <Text className='reason-text' numberOfLines={1}>{item.reason}</Text>
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
