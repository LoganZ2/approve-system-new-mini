import React, { useState } from 'react'
import Taro from '@tarojs/taro'; 
import { View, Text, ScrollView, Swiper, SwiperItem } from '@tarojs/components'
import './index.scss'

// Mock Data
const mockData = [
  {
    id: 1,
    type: '调休',
    duration: '0.5',
    status: 'approved',
    startDate: '2023-09-15',
    endDate: '2023-09-15',
    createDate: '2023-09-15',
  },
  {
    id: 2,
    type: '调休',
    duration: '0.5',
    status: 'rejected',
    startDate: '2023-09-15',
    endDate: '2023-09-15',
    createDate: '2023-09-15',
  },
  {
    id: 3,
    type: '调休',
    duration: '0.5',
    status: 'pending',
    startDate: '2023-09-15',
    endDate: '2023-09-15',
    createDate: '2023-09-15',
  },
]

const tabs = [
  { key: 'all', text: '全部' },
  { key: 'pending', text: '审批中' },
  { key: 'approved', text: '已通过' },
  { key: 'rejected', text: '被驳回' }
]

export default function MyApply() {
  const [activeTab, setActiveTab] = useState('all')
  const currentSwiperIndex = tabs.findIndex(t => t.key === activeTab)

  const handleSwiperChange = (e) => {
    const index = e.detail.current
    setActiveTab(tabs[index].key)
  }

  const getListByKey = (key) => {
    if (key === 'all') return mockData
    return mockData.filter(item => item.status === key)
  }

  const getStatusInfo = (status) => {
    switch (status) {
      case 'approved': return { text: '已通过', colorClass: 'status-approved' }
      case 'pending': return { text: '审批中', colorClass: 'status-pending' }
      case 'rejected': return { text: '已驳回', colorClass: 'status-rejected' }
      default: return { text: '', colorClass: '' }
    }
  }

  const getDetail = (id) => {
    Taro.navigateTo({
      url: `/pages/approval-detail/index?id=${id}`
    })
  }

  return (
    <View className='my-apply'>
      {/* HEADER: 增加英语小字 */ }
      <View className='header'>
        <Text className='title'>我的申请</Text>
        {/* 这里！和审批页保持一致的风格 */}
        <Text className='subtitle'>
          {mockData.length} HISTORY RECORDS
        </Text>
      </View>

      {/* TABS */}
      <View className='tabs'>
        {tabs.map(tab => (
          <View 
            key={tab.key}
            className={`tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <Text>{tab.text}</Text>
          </View>
        ))}
      </View>

      {/* SWIPER LIST */}
      <Swiper 
        className='swiper-box'
        current={currentSwiperIndex}
        onChange={handleSwiperChange}
        duration={300}
        indicatorDots={false}
      >
        {tabs.map(tab => {
          const listData = getListByKey(tab.key)
          return (
            <SwiperItem key={tab.key} className='swiper-item-wrap'>
              <ScrollView className='list-scroll' scrollY>
                <View className='list-inner'>
                  {listData.length === 0 ? (
                    <View className='empty'>
                      <Text>暂无{tab.text}记录</Text>
                    </View>
                  ) : (
                    listData.map(item => {
                      const statusInfo = getStatusInfo(item.status)
                      return (
                        <View key={item.id} className='apply-item' onClick={() => getDetail(item.id)}>
                          {/* 左侧：左对齐大数字 */}
                          <View className='left-col'>
                            <Text className='big-num'>{item.duration}</Text>
                            <Text className='unit'>DAYS</Text>
                          </View>

                          {/* 右侧：内容 */}
                          <View className='right-content'>
                            <View className='top-row'>
                              <Text className='type'>{item.type}</Text>
                              <View className={`status-badge ${statusInfo.colorClass}`}>
                                <Text>{statusInfo.text}</Text>
                              </View>
                            </View>

                            <View className='date-range'>
                              <Text>{item.startDate} ~ {item.endDate}</Text>
                            </View>

                            {item.createDate && (
                              <Text className='create-date'>创建时间：{item.createDate}</Text>
                            )}
                          </View>
                        </View>
                      )
                    })
                  )}
                  <View style={{ height: '50px' }}></View>
                </View>
              </ScrollView>
            </SwiperItem>
          )
        })}
      </Swiper>
    </View>
  )
}