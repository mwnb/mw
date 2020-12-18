import matchData from './match_data.js'

//把dom对象转化为json对象
function DOMToJSON(node) {
  let elAttrs = {}
  //节点的名字  
  elAttrs.tagName = node.tagName.toLowerCase()
  //节点的所有属性
  const attrs = node.attributes
  //如果有属性节点
  if (attrs.length) {
    elAttrs.props = {}
  }
  //把属性添加到节点
  for (let i = 0; i < attrs.length; i++) {
    const nodeName = attrs[i].nodeName
    elAttrs.props[nodeName] = node.getAttribute(nodeName)    
  }
  //子元素节点
  const children = node.childNodes  
  //如果有子元素
  if (children.length) {
    elAttrs.children = []
    for (let i = 0; i < children.length; i++) {
      //子元素是节点元素 继续遍历     
      if (children[i].nodeType === 1) {        
        elAttrs.children.push(DOMToJSON (children[i]))
      } else {        
        const text = children[i].nodeValue 
        const responseData = matchData(text) 
        //如果文本节点有需要响应的数据       
        if (responseData) {
          elAttrs.children.push({
            tagName: 'responseData',
            responseData,
          })
        }else {
          elAttrs.children.push({
            tagName: 'text',
            text
          })
        }        
      }
    }
  }
  return elAttrs
}
function addMethods(dom, jsondom, methods) {
  if (jsondom.props) {
    for (const attr in jsondom.props) {
      if (attr.startsWith('x-')) {
        const eventName = attr.slice(2)
        const fnName = dom.getAttribute(attr)
        if (methods[fnName]) {
          dom.addEventListener(eventName, methods[fnName])
          //删除掉这个没用的属性
          dom.removeAttribute(attr)
        }else {
          throw new ReferenceError('no method')
        }        
      }
    }
  }
}
//把json还原成dom   {json, 保存要响应的数据的dom和jsondom, 代理对象, 方法}
function JSONToDOM(elAttrs, responseObj, dataProxy, methods) {
  const {tagName, props = {}, children = []} = elAttrs
  const node = document.createElement(tagName)
  for (const attr in props) {
    node.setAttribute(attr, props[attr])
  }
  //添加方法
  addMethods(node,elAttrs, methods)
  for (const v of children) {
    //文本节点
    if (v.text) {
      node.append(document.createTextNode(v.text))
    }else if (v.responseData){
      const tempKeys = []
      const txt = v.responseData.map(item=> {
        if (typeof item === 'string') {
          return item
        }else {
          tempKeys.push(item.key)
          return dataProxy[item.key]
        }
      }).join('')     
      const txtNode = document.createTextNode(txt)
      tempKeys.forEach(keyItem => {
        //dom和jsondom都要添加到responseObj
        responseObj[keyItem] = [txtNode, v]
      })      
      node.append(txtNode)
      //元素节点
    }else {
      node.append(JSONToDOM(v, responseObj, dataProxy, methods))
    }    
  }
  return node
}
// dom， 响应值， jsondom， 响应对象对应的key保存的数组
function updateDOM(dom, val, jsondom, responseObj, key, dataProxy) {
  //获取父元素
  const parentEl = dom.parentElement
  const txt = jsondom.responseData.map(item=> {
    if (typeof item === 'string') {
      return item
    }else if (item.key === key){
      return val
    }else {
      return dataProxy[item.key]
    }
  }).join('')     
  const newNode = document.createTextNode(txt)
  parentEl.replaceChild(newNode, dom)
  responseObj[key][0] = newNode
}
export {
  DOMToJSON,
  JSONToDOM,
  updateDOM
}

