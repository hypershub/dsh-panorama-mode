/* Read Chat's published keyed records; never infer ToolResult turn ownership
   from its payload (that payload deliberately has no turn field). */
const MAX_STEPS = 6
const MAX_LOGS = 4
const MAX_STREAM = 5
const MAX_RECENT = 3

function toolLabel(name) { return name || 'tool' }
function timeOf(node) { return Number.isFinite(node?.time) ? node.time : 0 }
function locationTurn(node) {
  const loc = node.location
  return loc?.kind === 'step' || loc?.kind === 'turn' ? loc.turn.turn : undefined
}

function stageRecords(chat) {
  if (chat.nodes && chat.order) {
    return chat.order.map(key => chat.nodes.get(key)).filter(Boolean).map(node => ({
      key: node.key, kind: node.kind, data: node.data, turn: locationTurn(node), seq: node.anchorSeq,
    }))
  }
  // Unsupported or not-yet-loaded data cannot establish tool ownership.
  return []
}

function buildModel(input) {
  const chat = input.chat || {}
  const records = stageRecords(chat)
  const order = chat.timeline?.turnOrder || []
  const turn = order.at(-1) || 0
  const loc = chat.timeline?.turns?.get(turn)
  const now = input.now ?? Date.now()
  const running = input.running === true
  const reason = loc?.end?.data?.reason?.kind
  const current = records.filter(row => row.turn === turn)
  const assistants = current.filter(row => row.kind === 'assistant-step')
  const live = assistants.filter(row => row.data.status === 'running').at(-1)
  const settled = assistants.filter(row => row.data.status === 'settled').at(-1)
  const liveText = textOfBlocks(live?.data.blocks)
  const liveReasoning = reasoningOfBlocks(live?.data.blocks)
  const finalText = textOfBlocks(settled?.data.blocks)
  const calls = []
  function visit(root, owner, depth=0) {
    if (!root) return
    const done = root.kind === 'tool-result'
    calls.push({key:root.callId || owner.key,name:toolLabel(root.name),
      brief:briefOf(root.call?.argsRaw || root.argsRaw || ''), state:done ? root.isError ? 'error' : 'done' : running ? 'active' : 'stopped',
      duration:done && root.callTime != null ? Math.max(0,root.time-root.callTime) : !done ? Math.max(0,now-(root.time||now)) : 0,
      time:done ? root.callTime ?? root.time : root.time, endTime:done ? root.time : null,
      seq:owner.seq, root, depth})
    for (const child of root.subCalls || []) visit(child,owner,depth+1)
  }
  for (const row of current.filter(row => row.kind === 'tool-call')) visit(row.data.root,row)
  calls.sort((a,b)=>(a.time||0)-(b.time||0))
  const active = calls.filter(row => row.state === 'active')
  const complete = reason === 'completed'
  const terminalError = current.some(row=>row.kind==='turn-error') || (reason && !['completed','forked'].includes(reason))
  const waiting = Boolean(input.pendingInteraction)
  const display = waiting ? 'waiting' : running ? active.length ? 'working' : 'thinking' : terminalError ? 'error' : complete ? 'done' : 'idle'

  // Only use a plan whose write is observed in THIS turn. A prior turn's
  // completed list must not make a new prompt immediately show 100%.
  const planWrite = calls.filter(row => row.name === 'todo_write' && row.state === 'done').at(-1)
  const todos = planWrite && Array.isArray(input.todos) && input.todos.length ? input.todos : null
  const counts = todos ? {done:todos.filter(x=>x.status==='completed').length,total:todos.length} : null
  const progress = counts ? counts.done/counts.total : display === 'done' ? 1 : display === 'idle' && !turn ? 0 : null
  const planSteps = todos?.map((item,index)=>({key:'todo:'+item.content,name:item.content,brief:'',
    state:item.status==='completed'?'done':item.status==='in_progress'? running?'active':'stopped':'pending',duration:0}))
  const rows = planSteps || calls
  const activeIndex = rows.findIndex(row=>row.state==='active')
  const start = activeIndex >= 0 ? Math.max(0,Math.min(activeIndex-2,rows.length-MAX_STEPS)) : Math.max(0,rows.length-MAX_STEPS)
  const steps = rows.slice(start,start+MAX_STEPS)
  const speech = waiting ? '等待你的确认，执行已暂停' : active.length ? active[0].name+' · '+active[0].brief : (liveText || liveReasoning || finalText).slice(-160)
  const previewText = (liveText || liveReasoning || finalText).slice(-1800)
  const logs = calls.map(row=>({key:row.key,time:row.endTime || row.time || now,kind:row.state==='error'?'e':row.state==='done'?'o':'a',
    text:row.name+' · '+(row.state==='done'?'完成':row.state==='error'?'失败':row.state==='stopped'?'已停止':'执行中')+(row.brief?' · '+row.brief:'')}))
  if (live) logs.push({key:'live:'+live.key,time:live.data.time||now,kind:'a',text:(liveText?'生成回复 · ':'思考 · ')+(liveText||liveReasoning).slice(-90)})
  if (waiting) logs.push({key:'waiting',time:now,kind:'a',text:'等待用户操作；未继续执行'})
  logs.sort((a,b)=>a.time-b.time)
  const prompt = current.filter(row=>row.kind==='user').at(-1) || records.filter(row=>row.kind==='user').at(-1)
  const title = clip(contentText(prompt?.data.content),110) || input.summary?.displayTitle || (turn?'Turn '+turn:'')
  const byTurn = new Map()
  for (const row of records.filter(row=>row.kind==='assistant-step' && row.data.status==='settled' && textOfBlocks(row.data.blocks))) {
    if(chat.timeline?.turns?.get(row.turn)?.status==='closed')byTurn.set(row.turn,resultFor(row,chat.timeline?.turns?.get(row.turn)))
  }
  const recent = [...byTurn.values()].slice(-MAX_RECENT).reverse()
  const n = x=>Number.isFinite(x)?x:0
  const usage=input.usage
  const cache=n(usage?.cacheReadTokens), uncached=n(usage?.uncachedInputTokens)
  const tokens={total:cache+uncached+n(usage?.cacheWriteTokens)+n(usage?.outputTokens),output:n(usage?.outputTokens),input:uncached,
    cacheHit:usage && cache+uncached>0 ? Math.round(cache/(cache+uncached)*100):null}
  const elapsed=loc?.start ? Math.max(0,(loc.end?.time ?? now)-loc.start.time):null
  const modelName=settled?.data.finalNode?.providerMetadata?.model || input.modelName || ''
  return {sessionId:input.sessionId,turn,display,running,title,workspace:basename(input.summary?.cwd),modelName,
    steps,stepTotal:calls.length,activeStep:active[0]||null,logs:logs.slice(-MAX_LOGS),stream:logs.slice(-MAX_STREAM).reverse(),
    speech,previewText,progress,progressBasis:counts?'plan':display==='done'?'turn':'unknown',indeterminate:running && progress===null && !waiting,
    progressLabel:counts?'待办完成进度':input.chat?'执行活动（总量未知）':'会话数据尚未接入',phase:waiting?'等待确认':active.length?'工具执行':liveText?'生成回复':running?'思考中':display==='done'?'本轮完成':display==='error'?'已停止':'待命',
    elapsed,tokens,stats:{turns:n(input.stats?.turns),steps:n(input.stats?.steps),avgStepMs:0},todos:counts,recent,
    activityKey:turn+':'+(active[0]?.key || live?.key || display),
    deliverable:display==='done' && finalText ? {...resultFor(settled,loc),meta:calls.length+' 次工具调用 · '+fmtDuration(elapsed)}:null,
    tools:[...new Set(calls.map(row=>row.name))].slice(-6),at:now,trackingAvailable:Boolean(input.chat)}
}

const EMPTY_MODEL = {sessionId:null,display:'idle',running:false,turn:0,title:'',workspace:'',modelName:'',steps:[],stepTotal:0,activeStep:null,
  logs:[],stream:[],speech:'',previewText:'',progress:0,indeterminate:false,elapsed:null,tokens:{total:0,output:0,cacheHit:null,input:0},
  stats:{turns:0,steps:0,avgStepMs:0},todos:null,recent:[],deliverable:null,tools:[],at:0,phase:'待命',progressLabel:'',activityKey:'idle'}
