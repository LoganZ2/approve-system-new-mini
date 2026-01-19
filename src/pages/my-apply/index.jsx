import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, Swiper, SwiperItem } from '@tarojs/components'
import './index.scss'
import { navigateTo, useDidShow, useLoad } from '@tarojs/taro';
import { getLeaveList } from '../../api/api';

const typeMap = {
  personal: "事假",
  annual: "年假",
  sick: "病假",
  marriage: "婚假",
  maternity: "产假",
  funeral: "丧假"
}

export default function MyApply() {

  const tabs = [
    { key: 'all', text: '全部' },
    { key: 'pending', text: '审批中' },
    { key: 'approved', text: '已通过' },
    { key: 'rejected', text: '被驳回' }
  ];

  const [currentSwiperIndex, setIndex] = useState(0);
  const [data, setData] = useState([]);

  const refresh = () => {
    // 在内部定义 async 函数并调用
    const init = async () => {
        const data = await getLeaveList();
        setData(data);
    };
    init();
  }

  useEffect(refresh, [])
  useDidShow(refresh);

  return (
    <View className="my-apply-root">
      {/* 内部 Tab 栏 */}
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

      {/* 核心轮播列表区域 */}
      <Swiper 
        className='content-swiper'
        current={currentSwiperIndex}
        onChange={(e) => setIndex(e.detail.current)}
        duration={300}
      >
        {tabs.map(tab => (
          <SwiperItem key={tab.key} className='swiper-item-box'>
            <ScrollView className='scroll-v' scrollY>
              <View className='list-padder'>
                {data.filter(item => item.status === tab.key || tab.key === "all").map(item => (
                   <View key={item.id} className='card-item' onClick={() => {}}>
                      {/* 左侧大数字 */}
                      <View className='left-part'>
                        <Text className='big-stat'>{item.duration}</Text>
                        <Text className='small-label'>DAYS</Text>
                      </View>

                      {/* 中间信息 */}
                      <View className='mid-part'>
                        <Text className='type-title' numberOfLines={1}>{typeMap[item.type]}</Text>
                        <View className="time-row">
                             <Text className='date-val'>{item.startDate} → {item.endDate}</Text>
                        </View>
                      </View>
                      
                      {/* 右侧状态标签 */}
                      <View className={`right-tag tag-${item.status}`}>
                        <Text>{tabs.find(i => i.key === item.status).text}</Text>
                      </View>
                   </View>
                ))}
                {/* 底部垫高，防止 Button 遮挡 */}
                <View style={{height: '100px'}}></View>
              </View>
            </ScrollView>
          </SwiperItem>
        ))}
      </Swiper>
      
      {/* 悬浮按钮 */}
      <View className="float-btn" onClick={() => navigateTo({
        url: '/pages/apply/index'
      })}> 
        <Text className='plus'>+</Text>
      </View>
    </View>
  )
}