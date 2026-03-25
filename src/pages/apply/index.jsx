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

const HALF_DAY_MS = 12 * 60 * 60 * 1000

const getDateHalfOrder = (dateStr, half) => {
  if (!dateStr) return NaN
  const baseDate = new Date(`${dateStr}T00:00:00`)
  if (Number.isNaN(baseDate.getTime())) return NaN
  return baseDate.getTime() + (half === 'PM' ? HALF_DAY_MS : 0)
}

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

  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      const startOrder = getDateHalfOrder(formData.startDate, formData.startHalf)
      const endOrder = getDateHalfOrder(formData.endDate, formData.endHalf)
      
      const diffTime = end - start
      const diffDays = diffTime / (1000 * 60 * 60 * 24)

      const startWeight = formData.startHalf === 'AM' ? 0 : 0.5
      const endWeight = formData.endHalf === 'AM' ? 0.5 : 1.0

      let total = diffDays - startWeight + endWeight

      if (endOrder < startOrder) total = 0

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

    const startOrder = getDateHalfOrder(formData.startDate, formData.startHalf)
    const endOrder = getDateHalfOrder(formData.endDate, formData.endHalf)
    if (Number.isNaN(startOrder) || Number.isNaN(endOrder) || endOrder < startOrder) {
      Taro.showToast({ title: '结束时间不能早于开始时间', icon: 'none' })
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
        
        <View className='input-box picker-row'>
           <View style={{flex: 1}}>
             <Text className='label'>类型 / TYPE</Text>
             <Picker 
                mode='selector' 
                range={leaveOptions}
                rangeKey='label'
                value={leaveOptions.findIndex(opt => opt.value === formData.type)} 
                onChange={(e) => handleInputChange('type', leaveOptions[e.detail.value].value)}
            >
                <View style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Text className='value-text'>
                    {leaveOptions.find(opt => opt.value === formData.type)?.label || '请选择'}
                    </Text>
                    <View className='arrow'></View>
                </View>
            </Picker>
           </View>
        </View>

        <View className='date-row'>
          
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
            
            <View 
              className={`toggle-btn ${formData.startHalf === 'PM' ? 'is-pm' : 'is-am'}`}
              onClick={() => togglePart('startHalf')}
            >
              <Text className='toggle-text'>{formData.startHalf}</Text>
              <Text className='toggle-hint'>{formData.startHalf === 'AM' ? '上午' : '下午'}</Text>
            </View>
          </View>

          <View className='date-gap'></View>

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

        <View className='duration-display'>
          <Text className='duration-num'>{formData.duration}</Text>
          <Text className='duration-label'>Total Days</Text>
        </View>

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
