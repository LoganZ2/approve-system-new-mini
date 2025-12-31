import { View, Text, Textarea, Button, Picker } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import './index.scss'

export default function Apply() {
  const [formData, setFormData] = useState({
    type: '年假',
    startDate: '', 
    startPart: 'AM', 
    endDate: '',
    endPart: 'PM',   
    reason: '',
    duration: '0' 
  })

  const leaveTypes = ['事假', '病假', '年假', '调休', '婚假', '产假', '丧假']

  useLoad(() => { console.log('Apply page loaded.') })

  // 这里的计算逻辑保持不变
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      
      const diffTime = end - start
      const diffDays = diffTime / (1000 * 60 * 60 * 24)

      const startWeight = formData.startPart === 'AM' ? 0 : 0.5
      const endWeight = formData.endPart === 'AM' ? 0.5 : 1.0

      let total = diffDays - startWeight + endWeight

      if (total < 0) total = 0
      
      setFormData(prev => ({ 
        ...prev, 
        duration: total % 1 === 0 ? total.toString() : total.toFixed(1)
      }))

    }
  }, [formData.startDate, formData.endDate, formData.startPart, formData.endPart])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // --- 新增：点击一下就切换 AM/PM ---
  const togglePart = (field) => {
    const current = formData[field]
    const next = current === 'AM' ? 'PM' : 'AM'
    setFormData(prev => ({ ...prev, [field]: next }))
  }

  const handleSubmit = () => {
    if(!formData.startDate || !formData.endDate) {
      Taro.showToast({ title: '请选择时间', icon: 'none' })
      return
    }
    console.log('Final Data:', formData) 
    Taro.showToast({ title: '提交成功', icon: 'success', duration: 2000 })
    setTimeout(() => Taro.navigateBack(), 1500)
  }

  return (
    <View className='apply-page'>
      <View className='header'>
        <Text className='title'>新建申请</Text>
        <Text className='subtitle'>Create Application</Text>
      </View>

      <View className='form-body'>
        
        {/* 类型选择 */}
        <View className='input-box picker-row'>
           <View style={{flex: 1}}>
             <Text className='label'>类型 / TYPE</Text>
             <Picker 
              mode='selector' 
              range={leaveTypes}
              value={leaveTypes.indexOf(formData.type)}
              onChange={(e) => handleInputChange('type', leaveTypes[e.detail.value])}
            >
              <View style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                 <Text className='value-text'>{formData.type}</Text>
                 <View className='arrow'></View>
              </View>
            </Picker>
           </View>
        </View>

        {/* 日期 + Toggle */}
        <View className='date-row'>
          
          {/* 左侧：开始 */}
          <View className='date-col'>
            <Text className='label'>开始 / START</Text>
            
            <Picker 
              mode='date'
              value={formData.startDate}
              onChange={(e) => handleInputChange('startDate', e.detail.value)}
            >
              <View className='date-display'>
                <Text className={`value-text ${formData.startDate ? '' : 'placeholder'}`}>
                  {formData.startDate || 'YYYY-MM-DD'}
                </Text>
              </View>
            </Picker>
            
            {/* 这里的按钮：根据状态变颜色/文字 */}
            <View 
              className={`toggle-btn ${formData.startPart === 'PM' ? 'is-pm' : 'is-am'}`}
              onClick={() => togglePart('startPart')}
            >
              {/* 这里显示 AM 或 PM，点击就变 */}
              <Text className='toggle-text'>{formData.startPart}</Text>
              <Text className='toggle-hint'>{formData.startPart === 'AM' ? '上午' : '下午'}</Text>
            </View>
          </View>

          <View className='date-gap'></View>

          {/* 右侧：结束 */}
          <View className='date-col'>
            <Text className='label'>结束 / END</Text>
            
            <Picker 
              mode='date'
              value={formData.endDate}
              onChange={(e) => handleInputChange('endDate', e.detail.value)}
            >
              <View className='date-display'>
                <Text className={`value-text ${formData.endDate ? '' : 'placeholder'}`}>
                  {formData.endDate || 'YYYY-MM-DD'}
                </Text>
              </View>
            </Picker>

            <View 
              className={`toggle-btn ${formData.endPart === 'PM' ? 'is-pm' : 'is-am'}`}
              onClick={() => togglePart('endPart')}
            >
               <Text className='toggle-text'>{formData.endPart}</Text>
               <Text className='toggle-hint'>{formData.endPart === 'AM' ? '上午' : '下午'}</Text>
            </View>
          </View>
        </View>

        {/* 巨型数字 */}
        <View className='duration-display'>
          <Text className='duration-num'>{formData.duration}</Text>
          <Text className='duration-label'>Total Days</Text>
        </View>

        {/* 事由 */}
        <View className='input-box textarea-box'>
          <Text className='label'>事由 / REASON</Text>
          <Textarea 
            className='clean-textarea'
            value={formData.reason}
            placeholder='请输入详细事由...'
            placeholderClass='ph-color'
            onInput={(e) => handleInputChange('reason', e.detail.value)}
            maxlength={200}
            autoHeight 
          />
          <Text className='char-count'>{formData.reason.length}/200</Text>
        </View>

      </View>

      <View className='footer'>
        <Button className='submit-btn' onClick={handleSubmit}>
          提交申请
        </Button>
      </View>
    </View>
  )
}