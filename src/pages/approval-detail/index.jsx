// 1. 必须引入组件
import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import { getLeaveList } from '../../api/api'
import Taro from '@tarojs/taro'
import './index.scss'

export default function ApplyDetail() {

  const [id, setId] = useState(0)
  const [res, setRes] = useState([])
  useLoad(async (options) => {
    setId(options.id)

    const fetchData = async () => {
        const data = await getLeaveList()
        setRes(data)
    }
  
    fetchData()
  })

  if (res.length === 0) {
    return <View></View>
  }

  return (
    <View className="approval-detail">
      <View className='header'>
        <Text className='title'>审批详情</Text>
        <Text className='subtitle'>
           APPROVAL DETAIL
        </Text>
      </View>
      <View className="detail-body">
        <Text  style={{ fontWeight: 'bold' }}>{res[0].createdAt}</Text>
        {/* <Text style={{ fontWeight: 'bold' }}>{res[0].status}</Text>
        <Text style={{ fontWeight: 'bold' }}>{res[0].approvalComment}</Text> */}
      </View>

    </View>
  )
}