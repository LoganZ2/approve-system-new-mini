import { View, Text, Textarea, Button, Picker } from '@tarojs/components'
import { useDidShow, useLoad } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import './index.scss'
import { apply } from '../../api/api'


const leaveOptions = [
  { value: 'personal', label: '事假' },
  { value: 'sick', label: '病假' },
  { value: 'annual', label: '年假' },
  { value: 'marriage', label: '婚假' },
  { value: 'maternity', label: '产假' },
  { value: 'funeral', label: '丧假' }
]

export default function Apply() {
  const [formData, setFormData] = useState({
    type: 'annual',
    startDate: '', 
    startHalf: 'AM', 
    endDate: '',
    endHalf: 'PM',   
    reason: '',
    duration: '0' 
  })

  useLoad(() => { console.log('Apply page loaded.') })

  // 这里的计算逻辑保持不变
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      
      const diffTime = end - start
      const diffDays = diffTime / (1000 * 60 * 60 * 24)

      const startWeight = formData.startHalf === 'AM' ? 0 : 0.5
      const endWeight = formData.endHalf === 'AM' ? 0.5 : 1.0

      let total = diffDays - startWeight + endWeight

      if (total < 0) total = 0
      
      setFormData(prev => ({ 
        ...prev, 
        duration: total % 1 === 0 ? total.toString() : total.toFixed(1)
      }))

    }
  }, [formData.startDate, formData.endDate, formData.startHalf, formData.endHalf])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // --- 新增：点击一下就切换 AM/PM ---
  const togglePart = (field) => {
    const current = formData[field]
    const next = current === 'AM' ? 'PM' : 'AM'
    setFormData(prev => ({ ...prev, [field]: next }))
  }

  const handleSubmit = async () => {
    if(!formData.startDate || !formData.endDate) {
      Taro.showToast({ title: '请选择时间', icon: 'none' })
      return
    }
    let finalData = { ...formData }
    delete finalData.duration;
    finalData.startHalf = finalData.startHalf.toLowerCase();
    finalData.endHalf = finalData.endHalf.toLowerCase();
    await apply(finalData)
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
                range={leaveOptions} // 传入对象数组
                rangeKey='label'     // 指定显示对象中的 'label' 字段 (即中文)
                // 根据当前的 formData.type (英文) 找到它在数组中的下标
                value={leaveOptions.findIndex(opt => opt.value === formData.type)} 
                // 选中时，根据下标拿到对应的 value (英文) 并更新
                onChange={(e) => handleInputChange('type', leaveOptions[e.detail.value].value)}
            >
                <View style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    {/* 显示时，在数组里找到当前英文对应的中文 label */}
                    <Text className='value-text'>
                    {leaveOptions.find(opt => opt.value === formData.type)?.label || '请选择'}
                    </Text>
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
              className={`toggle-btn ${formData.startHalf === 'PM' ? 'is-pm' : 'is-am'}`}
              onClick={() => togglePart('startHalf')}
            >
              {/* 这里显示 AM 或 PM，点击就变 */}
              <Text className='toggle-text'>{formData.startHalf}</Text>
              <Text className='toggle-hint'>{formData.startHalf === 'AM' ? '上午' : '下午'}</Text>
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
              className={`toggle-btn ${formData.endHalf === 'PM' ? 'is-pm' : 'is-am'}`}
              onClick={() => togglePart('endHalf')}
            >
               <Text className='toggle-text'>{formData.endHalf}</Text>
               <Text className='toggle-hint'>{formData.endHalf === 'AM' ? '上午' : '下午'}</Text>
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

      <View className='submit-btn' onClick={handleSubmit}>
      <Text className='submit'>▲</Text>
      </View>
    </View>
  )
}