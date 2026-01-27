import { useState, useEffect } from 'react'
import { View, Text, Input, Button, Picker } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import './index.scss'
import { getDepartmentList, register } from '../../api/api'

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    level: 'employee',
    department: ''
  })
  
  const [departmentList, setDepartmentList] = useState([])
  const [showDepartment, setShowDepartment] = useState(false)

  // 职级枚举
  const levelOptions = [
    { label: '总经理', value: 'manager' },
    { label: '部门经理', value: 'department_manager' },
    { label: '副总经理', value: 'deputy_manager' },
    { label: '职员', value: 'employee' }
  ]

  // 处理输入变化
  const handleInputChange = (field, value) => {
    const newData = {
      ...formData,
      [field]: value
    }
    
    // 如果职级变更，更新部门显示状态
    if (field === 'level') {
      newData.department = '' // 重置部门选择
      setShowDepartment(value !== 'manager')
    }
    
    setFormData(newData)
  }

  // 获取部门列表
  const fetchDepartmentList = async () => {
    try {
      
      let i = 1;
      const data = await getDepartmentList()

      setDepartmentList(data)
      
    } catch (error) {
      console.error('获取部门列表失败:', error)
      // Mock数据（失败时使用）
      setDepartmentList([
        []
      ])
    }
  }

  // 初始化
  useLoad(() => {
    fetchDepartmentList()
    setShowDepartment(formData.level !== 'manager')
  })

  // 提交表单
  const handleSubmit = async () => {
    const { name, level, department } = formData
    
    if (!name.trim()) {
      Taro.showToast({
        title: '请输入姓名',
        icon: 'none'
      })
      return
    }
    
    if (showDepartment && !department) {
      Taro.showToast({
        title: '请选择部门',
        icon: 'none'
      })
      return
    }

    Taro.showLoading({
      title: '提交中...'
    })

    await register(formData);
    Taro.hideLoading()
    Taro.showToast({
      title: '提交成功',
      icon: 'success',
      success: () => {
        setTimeout(() => {
          Taro.navigateBack()
        }, 1500)
      }
    })
  }

  const getLevelLabel = (value) => {
    const option = levelOptions.find(item => item.value === value)
    return option ? option.label : '请选择职级'
  }

  return (
    <View className="register">
      {/* 标题 */}
      <View className="title">人员登记</View>

      {/* 表单 */}
      <View className="form">
        {/* 姓名 */}
        <View className="form-row">
          <Text className="label">姓名：</Text>
          <Input
            className="input"
            placeholder="请输入姓名"
            placeholderClass="placeholder"
            value={formData.name}
            onInput={(e) => handleInputChange('name', e.detail.value)}
          />
        </View>

        {/* 职级选择 */}
        <View className="form-row">
          <Text className="label">职级：</Text>
          <Picker
            mode="selector"
            range={levelOptions.map(item => item.label)}
            value={levelOptions.findIndex(item => item.value === formData.level)}
            onChange={(e) => {
              const index = e.detail.value
              handleInputChange('level', levelOptions[index].value)
            }}
          >
            <View className="picker">
              {getLevelLabel(formData.level)}
            </View>
          </Picker>
        </View>

        {/* 部门选择（总经理不显示） */}
        {showDepartment && (
          <View className="form-row">
            <Text className="label">部门：</Text>
            <Picker
              mode="selector"
              range={departmentList}
              value={departmentList.findIndex(item => item === formData.department)}
              onChange={(e) => {
                const index = e.detail.value
                const selectedDept = departmentList[index]
                if (selectedDept) {
                  handleInputChange('department', selectedDept)
                }
              }}
            >
              <View className="picker">
                {formData.department || '请选择部门'}
              </View>
            </Picker>
          </View>
        )}
      </View>

      {/* 提交按钮 */}
      <Button className="submit-btn" onClick={handleSubmit}>
        提交
      </Button>
    </View>
  )
}