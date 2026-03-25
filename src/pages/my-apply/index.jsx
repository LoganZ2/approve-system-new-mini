import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, Swiper, SwiperItem } from '@tarojs/components'
import './index.scss'
import { navigateTo } from '@tarojs/taro';
import { getLeaveList } from '../../api/api'; 

const typeMap = {
  personal: "事假",
  annual: "年假",
  sick: "病假",
  marriage: "婚假",
  maternity: "产假",
  funeral: "丧假"
}

// 标签映射
const tabs = [
  { key: 'all', text: '全部' },
  { key: 'pending', text: '审批中' },
  { key: 'approved', text: '已通过' },
  { key: 'rejected', text: '被驳回' }
];

export default function MyApply() {
  const [currentSwiperIndex, setIndex] = useState(0);
  const [data, setData] = useState([]);
  
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const resp = await getLeaveList();
      setData(resp || []);
    } catch(e) { }
    setRefreshing(false);
  }

  const onPullDown = () => {
    setRefreshing(true);
    fetchData();
  }

  const detailPage = (id) => {
    if (id) navigateTo({ url: "/pages/approval-detail/index?id=" + id })
  }

  return (
    <View className="my-apply-root">
      
      <View className="inner-tabs">
        {tabs.map((t, idx) => (
          <View 
            key={t.key} 
            className={`tab-item ${currentSwiperIndex === idx ? 'active' : ''}`}
            onClick={() => setIndex(idx)}
          >
            {t.text}
            {currentSwiperIndex === idx && <View className="check-dot" />}
          </View>
        ))}
      </View>

      <Swiper 
        className='content-swiper'
        current={currentSwiperIndex}
        onChange={(e) => setIndex(e.detail.current)}
        duration={300}
      >
        {tabs.map(tab => (
          <SwiperItem key={tab.key} className='swiper-item-box'>
            <ScrollView 
               className='scroll-v' 
               scrollY
               refresherEnabled
               refresherTriggered={refreshing}
               onRefresherRefresh={onPullDown}
            >
              <View className='list-padder'>
                {data.filter(item => item.status === tab.key || tab.key === "all").map(item => (
                   <View key={item.id} className='card-item' onClick={() => detailPage(item.id)}>
                      
                      <View className='left-part'>
                        <Text className='big-stat'>{item.duration}</Text>
                        <Text className='small-label'>DAYS</Text>
                      </View>

                       <View className='mid-part'>
                         <View className='row-one'>
                            <Text className='text-title'>
                              {typeMap[item.type]}
                            </Text>
                         </View>
                        <View className="row-two">
                             <Text className='date-val'>{item.startDate} → {item.endDate}</Text>
                        </View>
                      </View>
                      
                      <View className={`right-tag tag-${item.status}`}>
                        <Text className='tag-text'>
                          {tabs.find(i => i.key === item.status)?.text || item.status}
                        </Text>
                      </View>
                   </View>
                ))}
                {data.length === 0 && !refreshing && (
                  <View className='empty-box'><Text>EMPTY LIST</Text></View>
                )}
                <View style={{height: '100px'}}></View>
              </View>
            </ScrollView>
          </SwiperItem>
        ))}
      </Swiper>
      
      {/* 3. 悬浮按钮 (样式不改，只做对齐) */}
      <View className="float-btn" onClick={() => navigateTo({ url: '/pages/apply/index' })}> 
        <Text className='plus'>+</Text>
      </View>
    </View>
  )
}
