import React, { useState } from 'react'
import { View, Text, ScrollView, Textarea, Button } from '@tarojs/components'
import { useLoad, showToast } from '@tarojs/taro'
// import { detail as getUserDetail, approvalDetail, auditApply } from '../../api/api' 
import './index.scss'

const typeMap = {
  personal: "事假",
  annual: "年假",
  sick: "病假",
  marriage: "婚假",
  maternity: "产假",
  funeral: "丧假"
}

// 辅助：日期格式化
const formatDate = (isoString) => {
  if(!isoString) return ''
  try {
      const date = new Date(isoString)
      return `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`
  } catch (e) {
      return isoString
  }
}

export default function ApplyDetail() {
  const [detailData, setDetailData] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [comment, setComment] = useState('') // 审批意见
  
  // 核心判断：我是否能审批？
  const [canAudit, setCanAudit] = useState(false)

  const statusColorMap = {
      approved: "approve", 
      pending: "pending",
      rejected: "reject"
  }

  useLoad(async (options) => {
    const id = options.id || 18;
    
    // ----------- 模拟数据 Start -----------
    // 假设这是你调接口拿回来的：currentUser
    const mockUser = {
        id: 16, // ⚠️注意：当前我是 logan_dep (你可以改成 15 logan1测试其他视角)
        name: "logan_dep",
        department: "dep",
        level: "manager",
        openid: "test" 
    }

    // 假设这是你调 approvalDetail 拿回来的单据
    const mockApply = {
        id: 18,
        applicantId: 18,
        name: "logan_emp",
        startDate: "2022-12-31T16:00:00.000Z",
        startHalf: "am",
        endDate: "2023-01-31T16:00:00.000Z",
        endHalf: "am",
        reason: "因身体不适医生建议静养，需要请假一个月。",
        type: "sick",
        currentStep: 1, // 当前走到步骤 1
        totalSteps: 2,
        status: "pending", 
        createdAt: "2026-01-07T14:57:40.000Z",
        updatedAt: "2026-01-11T16:45:20.000Z",
        duration: 31.5,
        approvalList: [
            {
                id: 29,
                step: 1,
                type: "or", // 或签
                status: "pending", 
                approvalSpecList: [
                    // 此节点有两人，其中 approverId: 16 就是我自己 (mockUser.id)
                    { id: 41, approverId: 16, approverName: "logan_dep", status: "pending", comment: "" },
                    { id: 42, approverId: 17, approverName: "logan_dep2", status: "pending", comment: "" }
                ]
            },
            {
                id: 30,
                step: 2,
                type: "or",
                status: "pending",
                approvalSpecList: [
                    { id: 43, approverId: 15, approverName: "logan", status: "pending", comment: "" }
                ]
            }
        ]
    }
    // ----------- 模拟数据 End -----------

    handleLogic(mockUser, mockApply)
  })

  // 统一逻辑处理
  const handleLogic = (user, apply) => {
    // 1. 设置基础数据
    setDetailData(apply)
    setCurrentUser(user)

    // 2. 判断是否有审批权
    // 条件：整体 pending + 对应步骤是 currentStep + 我在列表里 + 我的状态是 pending
    let _canAudit = false;

    if (apply && user && apply.status === 'pending') {
        // 找到当前的节点大对象
        const currentPhase = apply.approvalList?.find(node => node.step === apply.currentStep)
        if (currentPhase && currentPhase.approvalSpecList) {
            // 在里面找"我"
            const myJob = currentPhase.approvalSpecList.find(p => p.approverId === user.id)
            // 如果找到了我，且我的任务还没做
            if (myJob && myJob.status === 'pending') {
                _canAudit = true;
            }
        }
    }
    _canAudit = false;
    setCanAudit(_canAudit)
  }

  // 提交操作
  const handleAction = (status) => {
      // status: 'approved' | 'rejected'
      if (!comment && status === 'rejected') {
          showToast({ title: '驳回必须填写理由', icon: 'none' })
          return
      }

      console.log('Call API:', {
          approvalId: detailData.id,
          step: detailData.currentStep,
          actionStatus: status,
          comment: comment,
          operatorId: currentUser.id
      })

      showToast({ title: status === 'approved' ? '已通过' : '已驳回', icon: 'success' })
      setCanAudit(false) // 只有刷新也能隐藏，演示用手动隐藏
  }
  
  // ----------------------------------------------------
  // 渲染 TimeLine (修复了之前的 JSX 语法错误)
  // ----------------------------------------------------
  const renderTimeline = () => {
    if (!detailData || !detailData.approvalList) return null;

    // 1. 顶部：发起人节点
    const submitNode = (
        <View className="timeline-item is-done" key="sys-start">
             <View className="left-track">
                <View className="dot"><Text className="icon">✔</Text></View>
                 <View className="line" />
            </View>
            <View className="right-info">
                <Text className="step-tag">Start</Text>
                <Text className="step-title">发起申请</Text>
                <Text className="step-meta">
                    <Text className="auth">{detailData.name}</Text> 提交申请
                </Text>
            </View>
        </View>
    );

    // 2. 循环审批节点
    const listNodes = detailData.approvalList.map((node) => { // 只有 map 没有 index
        // 状态判断
        const isCurrentStep = (node.step === detailData.currentStep && detailData.status === 'pending');
        // 如果步骤小于当前步骤，或者是当前步骤但大单子已经不是pending(说明整个流程结束了)，则视为Done
        const isDone = (node.step < detailData.currentStep) || (detailData.status !== 'pending' && node.status !== 'pending');
        const isRejectedNode = node.status === 'rejected';

        // 整理参与人显示逻辑
        let relevantPeers = [];
        node.approvalSpecList.forEach(p => {
            if (p.status === 'approved' || p.status === 'rejected') {
                 // 已经操作过的人
                relevantPeers.push(p);
            } else if (isCurrentStep && p.status === 'pending') {
                 // 当前这一步，还没操作，但是在等待的人
                relevantPeers.push({ ...p, isWaiting: true });
            }
        }); 

        return (
            <View 
                key={node.id} 
                className={`timeline-item ${isDone ? 'is-done' : ''} ${isCurrentStep ? 'is-active' : ''} ${isRejectedNode ? 'is-reject' : ''}`}
            >
                {/* 左列轨道 */}
                <View className="left-track">
                    <View className="dot">
                         {isDone || node.status === 'approved' ? <Text className="icon">✔</Text> : (
                             isRejectedNode ? <Text className="icon">✕</Text> : <Text className="num">{node.step}</Text>
                         )}
                    </View>
                     {/* 这里修复了之前的注释错误 */}
                    <View className="line" />
                </View>

                {/* 右列内容 */}
                <View className="right-info">
                    <Text className="step-tag">Step {node.step}</Text>
                    <View className="title-row">
                         <Text className="step-title">
                            {isRejectedNode ? '审批驳回' : (isDone ? '审批完成' : '审批进行中')}
                        </Text>
                        {node.type === 'or' && <Text className="badg">或签</Text>}
                    </View>

                    {/* 有具体的审批人列表才渲染，否则(还没走到这步)暂不渲染 */}
                    {relevantPeers.length > 0 && (
                        <View className="peer-list">
                            {relevantPeers.map(peer => (
                                <View key={peer.id} className="peer-item">
                                    <Text className="p-name">
                                        {peer.isWaiting ? `待 ${peer.approverName}` : `${peer.approverName} ${peer.status==='rejected'?'驳回':'通过'}`}
                                    </Text>
                                    {!!peer.comment && <View className="p-comt">{peer.comment}</View>}
                                </View>
                            ))}
                        </View>
                    )}
                    
                    {/* 还没走到这步的提示 */}
                    {relevantPeers.length === 0 && !isDone && !isRejectedNode && (
                        <Text className="mute-hint">等待后续流转...</Text>
                    )}
                </View>
            </View>
        )
    });

    return (
        <View className="timeline-box">
             <Text className="section-header">PROCESS LOG</Text>
             {submitNode}
             {listNodes}
        </View>
    )
  }
  
  // 防御性渲染
  if (!detailData) {
      return (
        <View className="approval-detail">
            {/* 这里的padding防止Loading贴边 */}
            <View style={{padding: '50px', textAlign:'center', color:'#999'}}>loading...</View>
        </View>
      )
  }

  // 计算用于 CSS class 的状态字符串
  const bannerStatusClass = statusColorMap[detailData.status] || 'pending';

  return (
    <View className="approval-detail">
        <ScrollView className="detail-scroll" scrollY>
            
            <View className='header'>
                <Text className='title'>单号 #{detailData.id}</Text>
                <Text className='subtitle'>APPROVAL DETAILS</Text>
            </View>

            {/* 顶栏卡片 */}
            <View className={`status-banner status-${bannerStatusClass}`}>
                <View className="status-text-row">
                    <Text className="status-en">{detailData.status?.toUpperCase()}</Text>
                </View>
                <View className="decorative-circle" />
            </View>

            {/* 自定义字段信息区 */}
            <View className="info-card">
                <View className="card-top"> 
                    <Text className="label">申请人: {detailData.name}</Text>
                    <Text className="date">{formatDate(detailData.createdAt)}</Text>
                </View>

                <View className="type-row">
                    <Text className="big-type">{typeMap[detailData.type] || "其他"}</Text>
                    <View className="days-tag">
                        <Text className="val">{detailData.duration}</Text>
                        <Text className="unit">DAYS</Text>
                    </View>
                </View>

                <View className="dash-line"></View>

                <View className="time-zone">
                    <View className="t-block">
                        <Text className="l">开始 START</Text>
                        <Text className="v">{formatDate(detailData.startDate)}</Text>
                        <Text className="pill">{detailData.startHalf?.toUpperCase()}</Text>
                    </View>
                    <View className="t-arrow">→</View>
                     <View className="t-block right">
                        <Text className="l">结束 END</Text>
                        <Text className="v">{formatDate(detailData.endDate)}</Text>
                        <Text className="pill">{detailData.endHalf?.toUpperCase()}</Text>
                    </View>
                </View>

                <View className="reason-wrap">
                    <Text className="sub-key">申请理由 / REASON</Text>
                    <Text className="content-txt">{detailData.reason || '未填写理由'}</Text>
                </View>
            </View>
            
            {/* 重新设计的审批流程区域 */}
            <View className="process-area">
                {renderTimeline()}
            </View>

            {/* 底部垫脚，防止输入框挡住最后得那点内容 */}
            <View style={{height: canAudit ? '180px' : '50px'}}></View>

        </ScrollView>

        {/* 只有我有权力审批时才显示 */}
        {canAudit && (
        <View className="action-bar-float">
            <View className="input-wrap">
                <Textarea 
                    value={comment} 
                    onInput={(e) => setComment(e.detail.value)}
                    placeholder="请输入审批意见..." 
                    className="audit-txt"
                    autoHeight={true}
                    fixed={true} 
                    cursorSpacing={20}
                    placeholderClass="ph_color" // 需 CSS 略修饰
                />
            </View>
            <View className="btn-row">
                <Button className="btn-opt btn-reject" onClick={() => handleAction('rejected')}>驳回</Button>
                <Button className="btn-opt btn-approve" onClick={() => handleAction('approved')}>通过</Button>
            </View>
        </View>
        )}
    </View>
  )
}