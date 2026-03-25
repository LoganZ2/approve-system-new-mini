import React, { useState } from 'react'
import { View, Text, Textarea, Button } from '@tarojs/components'
import { useLoad, showToast, showModal, navigateBack, usePullDownRefresh, stopPullDownRefresh } from '@tarojs/taro'
import { applicationDetails, approve, detail, withdraw } from '../../api/api'
import './index.scss'

const typeMap = {
  personal: "事假",
  annual: "年假",
  sick: "病假",
  marriage: "婚假",
  maternity: "产假",
  funeral: "丧假"
}

const statusMap = {
  pending: '审批中',
  approved: '已通过',
  rejected: '被驳回'
}

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
  const [comment, setComment] = useState('') 
  const [id, setId] = useState(0)
  
  const [canAudit, setCanAudit] = useState(false)
  const [canWithdraw, setCanWithdraw] = useState(false)
  const [spec, setSpec] = useState({});

  const statusColorMap = {
      approved: "status-approve", 
      pending: "status-pending",
      rejected: "status-reject"
  }

  const init = async (currentId) => {
    // 兼容取值
    const realId = currentId || id
    setId(realId)

    try {
        let usrDetails = await detail()
        let appDetails = await applicationDetails(realId)
        handleLogic(usrDetails, appDetails)
    } catch (e) {
        console.error(e)
        showToast({title: '刷新失败', icon:'none'})
    } finally {
        // 请求结束后必须手动停止下拉Loading
        stopPullDownRefresh()
    }
  }

  useLoad((options) => {
    if(options.id) init(options.id)
  })

  usePullDownRefresh(() => {
    init(id)
  })

  const isCurrentUserApplicant = (user, apply) => {
    if (!user || !apply) return false

    const normalize = (value) => String(value).trim()
    const userIdentity = [user.id, user.userId, user.openid, user.name]
      .filter(value => value !== undefined && value !== null && value !== '')
      .map(normalize)
    const applyIdentity = [apply.applicantId, apply.userId, apply.applicantOpenid, apply.openid, apply.name, apply.applicant]
      .filter(value => value !== undefined && value !== null && value !== '')
      .map(normalize)

    if (userIdentity.length === 0 || applyIdentity.length === 0) return false
    return applyIdentity.some(value => userIdentity.includes(value))
  }

  // 统一逻辑处理
  const handleLogic = (user, apply) => {
    setDetailData(apply)
    setCurrentUser(user)
    setCanWithdraw(!!(apply && apply.status === 'pending' && isCurrentUserApplicant(user, apply)))

    let _canAudit = false;
    if (apply && user && apply.status === 'pending') {
        const currentPhase = apply.approvalList?.find(node => node.step === apply.currentStep)
        if (currentPhase && currentPhase.approvalSpecList) {
          const myJob = currentPhase.approvalSpecList.find(p => p.approverId === user.id)
          setSpec(myJob || {})
          if (myJob && myJob.status === 'pending') {
              _canAudit = true;
          }
        }
    }
    setCanAudit(_canAudit)
  }

  const handleWithdraw = async () => {
    const applicationId = detailData?.id || id
    if (!applicationId) {
      showToast({ title: '申请ID无效', icon: 'none' })
      return
    }

    const modalRes = await showModal({
      title: '确认撤回',
      content: '撤回后该申请将不再进入审批流程，确定继续吗？'
    })

    if (!modalRes.confirm) return

    try {
      await withdraw(applicationId)
      showToast({ title: '撤回成功', icon: 'success' })
      setTimeout(() => {
        navigateBack()
      }, 300)
    } catch (e) {
      console.error(e)
      showToast({ title: '撤回失败', icon: 'none' })
    }
  }

  // 提交操作
  const handleAction = async (status) => {
      // status: 'approved' | 'rejected'
      if (!comment && status === 'rejected') {
          showToast({ title: '驳回必须填写理由', icon: 'none' })
          return
      }

      const payload = {
        approvalSpecId: spec.id,
        approved: status === 'approved',
        comment: comment
      }

      try {
        await approve(payload)
        showToast({ title: status === 'approved' ? '已通过' : '已驳回', icon: 'success' })
        setComment('')
        // 重新刷新数据
        init(id)
        setCanAudit(false)
      } catch (e) {
        showToast({title: '操作失败', icon:'none'})
      }
  }

  const renderTimeline = () => {
    if (!detailData || !detailData.approvalList) return null;

    const submitNode = (
        <View className="timeline-item is-done" key="sys-start">
             <View className="left-track">
                <View className="dot"><Text className="icon">✔</Text></View>
                 <View className="line" />
            </View>
            <View className="right-info">
                <Text className="step-tag">Start</Text>
                <View className="title-row"><Text className="step-title">发起申请</Text></View>
                <Text className="step-meta">
                    <Text className="auth">{detailData.name}</Text> 提交申请
                </Text>
            </View>
        </View>
    );

    const listNodes = detailData.approvalList.map((node) => { 
        const isCurrentStep = (node.step === detailData.currentStep && detailData.status === 'pending');
        const isDone = (node.step < detailData.currentStep) || (detailData.status !== 'pending' && node.status !== 'pending');
        const isRejectedNode = node.status === 'rejected';

        let relevantPeers = [];
        if (node.approvalSpecList) {
            node.approvalSpecList.forEach(p => {
                if (p.status === 'approved' || p.status === 'rejected') {
                    relevantPeers.push(p);
                } else if (isCurrentStep && p.status === 'pending') {
                    relevantPeers.push({ ...p, isWaiting: true });
                }
            });
        }

        return (
            <View 
                key={node.id} 
                className={`timeline-item ${isDone ? 'is-done' : ''} ${isCurrentStep ? 'is-active' : ''} ${isRejectedNode ? 'is-reject' : ''}`}
            >
                <View className="left-track">
                    <View className="dot">
                         {isDone && !isRejectedNode ? <Text className="icon">✔</Text> : (
                             isRejectedNode ? <Text className="icon">✕</Text> : <Text className="num">{node.step}</Text>
                         )}
                    </View>
                    <View className="line" />
                </View>

                <View className="right-info">
                    <Text className="step-tag">Step {node.step}</Text>
                    <View className="title-row">
                         <Text className="step-title">
                            {isRejectedNode ? '审批驳回' : (isDone ? '审批完成' : '审批进行中')}
                        </Text>
                        {node.type === 'or' && <Text className="badg">或签</Text>}
                    </View>

                    {relevantPeers.length > 0 && (
                        <View className="peer-list">
                            {relevantPeers.map(peer => (
                                <View key={peer.id} className="peer-item">
                                    <View>
                                        <Text className="p-name">{peer.approverName}</Text>
                                        {peer.isWaiting ? <Text className='waiting-tag'>待审批</Text> : null}
                                        {!peer.isWaiting && <Text style={{float:'right', fontSize:'12px', color: peer.status==='approved'?'#00b578':'red'}}>
                                            {peer.status==='approved'?'PASS':'REJECT'}
                                        </Text>}
                                    </View>
                                    {!!peer.comment && <View className="p-comt">{peer.comment}</View>}
                                </View>
                            ))}
                        </View>
                    )}
                    
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
  
  if (!detailData) {
      return (
        <View className="approval-detail" style={{padding:'50px', textAlign:'center'}}>
            <Text style={{color:'#999'}}>Loading...</Text>
        </View>
      )
  }

  // 计算状态样式名
  const bannerStatusClass = statusColorMap[detailData.status] || 'status-pending';
  const hasActionBar = canAudit || canWithdraw

  return (
    // 注意：顶层 View 对应 height: auto，允许滚动
    <View className="approval-detail">
        
        {/* 内容容器: 负责左右 Padding 和具体布局 */}
        <View className='content-section'>
            
            <View className='header'>
                <Text className='title'>请假详情</Text>
                <Text className='subtitle'>APPROVAL DETAILS</Text>
            </View>

            <View className={`status-banner ${bannerStatusClass}`}>
                <View className="status-text-row">
                    <Text className="status-en">{statusMap[detailData.status]}</Text>
                </View>
                <View className="decorative-circle" />
            </View>

            <View className="info-card">
                <View className="card-top"> 
                    <Text className="label">申请人: {detailData.name} 已请{detailData.leaveDays}天</Text>
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
                    <Text className="content-txt">{detailData.reason || '无理由'}</Text>
                </View>
            </View>
            
            <View className="process-area">
                {renderTimeline()}
            </View>
            <View style={{ width: '100%', height: canAudit ? '340px' : (hasActionBar ? '180px' : '80px'), background:'transparent' }} />
        
        </View>

        {/* 底部操作区 (Fixed Float) */}
        {hasActionBar && (
        <View className="action-bar-float">
            {canAudit && <View className="input-wrap">
                <Textarea 
                    value={comment} 
                    onInput={(e) => setComment(e.detail.value)}
                    placeholder="请输入审批意见..." 
                    className="audit-txt"
                    // 去除默认自带的小padding让布局更整齐
                    disableDefaultPadding={true}
                    // Taro 下 Textarea 若配合 scroll-view 容易穿透，现在是原生 View + Fixed，问题较小
                    autoHeight={true} 
                    cursorSpacing={60} // 键盘弹起距离
                />
            </View>}
            <View className="btn-row">
                {canWithdraw && <Button className="btn-opt btn-withdraw" onClick={handleWithdraw}>撤回</Button>}
                {canAudit && <Button className="btn-opt btn-reject" onClick={() => handleAction('rejected')}>驳回</Button>}
                {canAudit && <Button className="btn-opt btn-approve" onClick={() => handleAction('approved')}>通过</Button>}
            </View>
        </View>
        )}
    </View>
  )
}
