import {DOMToJSON, JSONToDOM, updateDOM} from './dom_json.js'

class X {
  //根据data里面的key需要响应的话保存一个数组[dom, jsondom]
  responseObj = {}
  constructor({el, data, methods}) {
    this.el = el
    this.methods = {}
    this.dataProxy = new Proxy(data, {
      get() {
        return Reflect.get(...arguments)
      },
      set :(target, prop, val) => {
        const [dom, jsondom] = this.responseObj[prop]
        //更新dom
        updateDOM(dom, val, jsondom, this.responseObj, prop, this.dataProxy)
        return Reflect.set(target, prop, val)
      }
    })
    for (const fn in methods) {
      //方法this指向代理对象
      this.methods[fn] = methods[fn].bind(this.dataProxy)
    }
    this.jsondom = this.DOMToJSON(el)
    this.dom = this.JSONToDOM(this.jsondom, this.responseObj, this.dataProxy, this.methods)
    el.parentElement.replaceChild(this.dom ,el)
  }
  DOMToJSON(el) {
    return DOMToJSON(el)
  }
  JSONToDOM(json, responseObj, proxyObj, methods) {
    return JSONToDOM(json, responseObj, proxyObj, methods)
  }  
}

export default X



