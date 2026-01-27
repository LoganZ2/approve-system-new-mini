/* src/pages/update-profile/index.jsx */
import { useState } from 'react'
import { View, Text, Input, Button, Picker } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import './index.scss'
// 引入 detail 接口，以及你需要自己补充的 update 接口
import { getDepartmentList, detail, /* , update */ 
updateUser} from '../../api/api'

export default function UpdateProfile() {
  const [formData, setFormData] = useState({
    id: undefined,
    name: '',
    level: 'employee',
    department: '',
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
      // 切换职级时，只有选了总经理才清空并将部门隐藏
      // 对于修改页面，用户体验上也可以选择保留原部门，这里逻辑模仿注册页，切到总经理清空部门
      if (value === 'manager') {
          newData.department = ''
      }
      setShowDepartment(value !== 'manager')
    }
    
    setFormData(newData)
  }

  // 获取部门列表
  const fetchDepartmentList = async () => {
    try {
      const data = await getDepartmentList()
      setDepartmentList(data)
    } catch (error) {
      console.error('获取部门列表失败:', error)
      setDepartmentList([])
    }
  }

  // 获取用户信息并回显
  const getUserDetail = async () => {
    Taro.showLoading({ title: '加载中' })
    try {
      // 调用详情接口
      const res = await detail() // 返回 { name, department, level, openid }
      
      if(res) {
        setFormData({
          id: res.id,
          name: res.name || '',
          level: res.level || 'employee',
          department: res.department || '',
          openid: res.openid || ''
        })

        // 根据回显的职级，判断是否显示部门选择框
        if (res.level && res.level !== 'manager') {
          setShowDepartment(true)
        } else {
          setShowDepartment(false)
        }
      }
    } catch (error) {
      console.error('获取用户信息失败', error);
      Taro.showToast({ title: '获信息失败', icon: 'error' })
    } finally {
      Taro.hideLoading()
    }
  }

  // 初始化
  useLoad(async () => {
    // 我们可以并行请求，或者先获取部门列表再获取详情
    // 建议先获取部门列表，这样回显部门时索引才对应得上（虽然这里用的字符串value匹配）
    await fetchDepartmentList() 
    await getUserDetail()
  })

  // 提交修改
  const handleUpdate = async () => {
    const { name, level, department } = formData
    
    if (!name.trim()) {
      Taro.showToast({ title: '请输入姓名', icon: 'none' })
      return
    }
    
    if (showDepartment && !department) {
      Taro.showToast({ title: '请选择部门', icon: 'none' })
      return
    }

    Taro.showLoading({ title: '保存中...' })

    try {
      await updateUser({
        id: formData.id,
        level: formData.level,
        department: formData.level !== "manager" ? formData.department : '',
        name: formData.name
      })

      Taro.hideLoading()
      Taro.showToast({
        title: '修改提交成功',
        icon: 'success',
        success: () => {
          setTimeout(() => {
            Taro.navigateBack()
          }, 1500)
        }
      })
    } catch (error) {
      Taro.hideLoading();
      Taro.showToast({ title: '修改失败', icon: 'none' });
    }
  }

  const getLevelLabel = (value) => {
    const option = levelOptions.find(item => item.value === value)
    return option ? option.label : '请选择职级'
  }

  return (
    <View className="update-profile">
      {/* 标题 */}
      <View className="title">修改信息</View>

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
              if(index >= 0) {
                 handleInputChange('level', levelOptions[index].value)
              }
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
              // 如果 departmentList 是简单字符串数组 ['A部', 'B部']
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
      <Button className="submit-btn" onClick={handleUpdate}>
        保存修改
      </Button>
    </View>
  )
}