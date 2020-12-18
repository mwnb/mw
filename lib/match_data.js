function matchData(str, obj) {
  //匹配变量
  const reg = /\{\s*[A-z_]\w+\s*\}/mg
  const result = str.match(reg)
  console.log(result)
  if (!result) {
    return null
  } 
  //响应变量分割出来用对象保存
  let regStr = '('
  for (let i = 0; i < result.length; i++) {
    regStr += result[i]
    if (i !== result.length - 1) {
      regStr += '|'
    }
  }
  regStr += ')'
  let rtArr = str.split(new RegExp(regStr, 'mg'))
  //把需要响应的变量的花括号和前后空白处理掉
  rtArr = rtArr.map(item => {
    if (reg.test(item)) {
      return {
        key: item.slice(1, -1).trim()
      }
    }else {
      return item
    }
  })
  return rtArr
}

export default matchData