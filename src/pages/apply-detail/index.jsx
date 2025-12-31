// 1. 必须引入组件
import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import { useState } from 'react'

export default function ApplyDetail() {

  const [id, setId] = useState(0)
  useLoad((options) => {
    setId(options.id)
  })

  return (
    <View>
      <Text style={{ fontWeight: 'bold' }}>{id}</Text>
    </View>
  )
}