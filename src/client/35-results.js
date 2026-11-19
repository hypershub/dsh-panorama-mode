/* Result text is tokenized locally and rendered as React nodes: raw HTML is
   never injected, file references are never converted into guessed URLs. */
const fileOpeners = new Map()
function safeTarget(value) {
  if (typeof value !== 'string' || /[\u0000-\u001f]/.test(value)) return null
  value=value.trim()
  if (/^https?:\/\//i.test(value)) {
    try { const url = new URL(value); return url.username || url.password ? null : {kind:'url',href:url.href} } catch { return null }
  }
  if (/^[a-z][a-z0-9+.-]*:/i.test(value) && !/^[a-z]:[\\/]/i.test(value)) return null
  if (/^(#|\/\/)/.test(value) || !value.trim()) return null
  return {kind:'file',href:value}
}
function mdTokens(text) { return marked.lexer(text || '') }
function plainMarkdown(text) {
  function plain(tokens) {
    return tokens.map(token => token.type==='html' ? '' : token.tokens ? plain(token.tokens) : token.items ? token.items.map(x=>plain(x.tokens||[])).join(' ') : token.text || '').join(' ')
  }
  return plain(mdTokens(text)).replace(/\s+/g,' ').trim()
}
function resultResources(text) {
  const out=[],seen=new Set()
  function walk(tokens) {
    for(const token of tokens) {
      if (token.type==='link' || token.type==='image') {
        const target=safeTarget(token.href)
        if(target && !seen.has(target.href)) {
          seen.add(target.href)
          const ext=target.href.split(/[?#]/)[0].toLowerCase()
          const kind=token.type==='image'||/\.(png|jpg|jpeg|webp|gif)$/.test(ext)?'image':/\.(mp4|webm|mov)$/.test(ext)?'video':target.kind==='file'?'document':'link'
          out.push({...target,resourceKind:kind,title:token.text||target.href})
        }
      }
      if(token.tokens)walk(token.tokens)
      if(token.items)for(const item of token.items)walk(item.tokens||[])
      if(token.header)for(const cell of token.header)walk(cell.tokens||[])
      if(token.rows)for(const row of token.rows)for(const cell of row)walk(cell.tokens||[])
    }
  }
  walk(mdTokens(text));return out
}
function resultFor(row, turnLocation) {
  const markdown=textOfBlocks(row.data.blocks)
  const resources=resultResources(markdown)
  // These are DSH's published deliverables facts, not tool arguments or prose.
  const declared=turnLocation?.data?.get?.('deliverables')?.presented || []
  const presented=[]
  for(const file of declared) {
    const target=safeTarget(file.path)
    if(!target || target.kind!=='file')continue
    const ext=file.path.split('.').at(-1).toLowerCase()
    const item={...target,title:basename(file.path),description:file.description||'',extension:ext,
      resourceKind:['png','jpg','jpeg','webp','gif'].includes(ext)?'image':['mp4','webm','mov'].includes(ext)?'video':'document',
      source:'presented',seq:file.seq,index:file.index}
    const existing=resources.findIndex(x=>x.href===target.href)
    if(existing>=0)resources.splice(existing,1)
    if(!presented.some(x=>x.href===item.href))presented.push(item)
  }
  return {key:'turn:'+row.turn,turn:row.turn,time:row.data.time,markdown,
    text:clip(plainMarkdown(markdown),96),resources:[...presented,...resources],presented}
}
function ResultMarkdown({text,onOpen}) {
  function render(tokens) { return tokens.map((token,index)=>{
    const key=index,children=()=>render(token.tokens||[])
    switch(token.type) {
      case 'heading':return h('h'+token.depth,{key},children())
      case 'paragraph':return h('p',{key},children())
      case 'text':return token.tokens?h(React.Fragment,{key},children()):token.text
      case 'strong':return h('strong',{key},children())
      case 'em':return h('em',{key},children())
      case 'del':return h('del',{key},children())
      case 'codespan':return h('code',{key},token.text)
      case 'code':return h('pre',{key},h('code',null,token.text))
      case 'blockquote':return h('blockquote',{key},children())
      case 'list':return h(token.ordered?'ol':'ul',{key,start:token.ordered?token.start:undefined},token.items.map((item,i)=>h('li',{key:i},render(item.tokens||[]))))
      case 'link': {
        const target=safeTarget(token.href)
        const ext=target?.href.split(/[?#]/)[0].toLowerCase() || ''
        const resourceKind=/\.(mp4|webm|mov)$/.test(ext)?'video':/\.(png|jpg|jpeg|webp|gif)$/.test(ext)?'image':target?.kind==='file'?'document':'link'
        return target?h('button',{key,type:'button',className:'dvs-md-link',onClick:()=>onOpen({...target,title:token.text,resourceKind})},children()):h('span',{key},children())
      }
      case 'image':return h('span',{key,className:'dvs-media-placeholder'},'▧ '+token.text)
      case 'table':return h('div',{key,className:'dvs-table-wrap'},h('table',null,
        h('thead',null,h('tr',null,token.header.map((cell,i)=>h('th',{key:i},render(cell.tokens||[]))))),
        h('tbody',null,token.rows.map((row,i)=>h('tr',{key:i},row.map((cell,j)=>h('td',{key:j},render(cell.tokens||[]))))))))
      case 'hr':return h('hr',{key})
      case 'br':return h('br',{key})
      case 'html':return h('code',{key},token.text)
      default:return token.text || null
    }
  }) }
  return h('div',{className:'dvs-markdown'},render(mdTokens(text)))
}
function ResultReader({result,sessionId,onClose,t}) {
  const [media,setMedia]=useState(null),[error,setError]=useState(''),[copied,setCopied]=useState(false)
  const open=resource=>{
    setError('')
    if(resource.kind==='file') {
      const action=fileOpeners.get(sessionId+':'+result.turn)
      if(!action){setError(t('fileUnavailable'));return}
      try { action(resource.href) ; store.set({open:false}) } catch(e){setError(String(e.message||e))}
    } else if(['image','video'].includes(resource.resourceKind))setMedia(resource)
    else window.open(resource.href,'_blank','noopener,noreferrer')
  }
  return h('section',{className:'dvs-reader',role:'region','aria-label':t('resultReader')},
    h('div',{className:'dvs-reader-head'},h('span',null,t('resultReader')+' · TURN '+result.turn),h('button',{type:'button',className:'dvs-ctl',onClick:onClose,'aria-label':t('closeResult')},IconClose())),
    h('div',{className:'dvs-reader-scroll'},
      h('h2',{className:'dvs-result-title'},result.text),
      h(ResultMarkdown,{text:result.markdown,onOpen:open}),
      result.resources.length?h('div',{className:'dvs-result-assets'},result.resources.map(resource=>h('button',{key:resource.href,type:'button',className:'dvs-asset',onClick:()=>open(resource)},h('span',null,(resource.extension || resource.resourceKind).toUpperCase()+' · '+(resource.source==='presented'?t('presentedFile'):t('fileReference'))),h('b',null,resource.title),h('small',null,resource.description || (resource.kind==='file'?resource.href:new URL(resource.href).hostname))))):null,
      media?h('div',{className:'dvs-result-media'},media.resourceKind==='video'?h('video',{src:media.href,controls:true,preload:'none',onError:()=>setError(t('mediaError'))}):h('img',{src:media.href,alt:media.title,onError:()=>setError(t('mediaError'))})):null,
      error?h('p',{role:'alert',className:'dvs-reader-error'},error):null),
    h('div',{className:'dvs-reader-foot'},h('span',null,t('resultReferenceHint')),h('button',{type:'button',className:'dvs-opt',onClick:async()=>{try{await navigator.clipboard.writeText(result.markdown);setCopied(true)}catch{setError(t('copyError'))}}},copied?t('copied'):t('copyResult'))))
}
function ResultFileBridge({sessionId,turn,openFile}) {
  useEffect(()=>{const key=sessionId+':'+turn.turn;fileOpeners.set(key,openFile);return()=>{if(fileOpeners.get(key)===openFile)fileOpeners.delete(key)}},[sessionId,turn.turn,openFile])
  return null
}
