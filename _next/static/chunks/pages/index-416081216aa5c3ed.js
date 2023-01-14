(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[405],{8312:function(e,t,n){(window.__NEXT_P=window.__NEXT_P||[]).push(["/",function(){return n(4186)}])},4186:function(e,t,n){"use strict";n.r(t);var a=n(5893),c=n(7294),o=n(3680),i=n(2914),s=n(4051),l=n(1555),r=n(682),d=n(545),p=n(5660),h=n.n(p);n(1535),n(902),n(366);let u=[{name:"model_selection",type:"str",description:"",default:"best",choices:["best","accuracy","score"]},{name:"binary_operators",type:"list[str]",description:"",default:["+","-","*","/"],choices:["+","-","*","/","^"],multiple:!0},{name:"unary_operators",type:"list[str]",description:"",default:[],choices:["sin","cos","exp","log","square","cube","sqrt","abs","tan","tanh"],multiple:!0},{name:"niterations",type:"int",description:"",default:40,range:[1,1e4],log:!0},{name:"ncyclesperiteration",type:"int",description:"",default:550,range:[1,1e4],log:!0},{name:"populations",type:"int",description:"",default:15,range:[2,1e3],log:!0},{name:"population_size",type:"int",description:"",default:33,range:[5,1e3],log:!0},{name:"maxsize",type:"int",description:"",default:20,range:[10,100],log:!1},{name:"timeout_in_seconds",type:"int",description:"",default:1,range:[1,1e4],log:!0,selectable:!0},{name:"loss",type:"str",description:"",default:"L2DistLoss()",choices:["L2DistLoss()","L1DistLoss()"]},{name:"denoise",type:"bool",description:"",default:!1,boolean:!0},{name:"select_k_features",type:"int",description:"",default:0,range:[0,10],log:!1,selectable:!0},{name:"precision",type:"int",description:"",default:32,choices:[16,32,64]},{name:"turbo",type:"bool",description:"",default:!1,boolean:!0},{name:"parsimony",type:"float",description:"",default:.0032,range:[1e-5,1e3],log:!0}].map(e=>{let t=e.name.replace(/_/g," ").replace(/(^|\s)[a-z]/g,e=>e.toUpperCase());return{...e,full_name:t}});function m(e){return 1e3*Math.log10(e)}function f(e){return Math.pow(10,e/1e3).toPrecision(3)}let g=()=>{let e={};u.forEach(t=>{let n=t.default;void 0!==t.range&&t.log&&(n=m(n));let[a,o]=(0,c.useState)(n);e[t.name]=[a,o]});let t={};u.forEach(n=>{let[a,c]=e[n.name];if(void 0!==n.choices&&n.type.startsWith("list")){let o=e=>{let t=e.target.value;e.target.checked?c([...a,t]):c(a.filter(e=>e!==t))};t[n.name]=o}else if(void 0!==n.choices){let i=e=>{c(e.target.value)};t[n.name]=i}else if("float"===n.type||!0==n.log){let s=e=>{c(parseFloat(e.target.value))};t[n.name]=s}else if("int"===n.type){let l=e=>{c(parseInt(e.target.value))};t[n.name]=l}else if("str"===n.type){let r=e=>{c(e.target.value)};t[n.name]=r}else if("bool"===n.type){let d=e=>{c(e.target.checked)};t[n.name]=d}});let[n,p]=(0,c.useState)("");(0,c.useEffect)(()=>{h().highlightElement(document.querySelector("#code-block"))},[n]),(0,c.useEffect)(()=>{let t="model = PySRRegressor(";for(let n of u){let[a,c]=e[n.name];void 0!==n.range&&n.log&&(a=f(a)),"int"===n.type&&(a=Math.round(a)),(n.default!=a||n.name.includes("operators"))&&(void 0!==n.choices&&n.type.startsWith("list")?t+="\n    ".concat(n.name,"=").concat(JSON.stringify(a).replace(/,/g,", ")+", "):void 0!==n.choices&&"str"===n.type?t+="\n    ".concat(n.name,'="').concat(a,'",'):void 0!==n.choices?t+="\n    ".concat(n.name,"=").concat(a,","):"int"===n.type?t+="\n    ".concat(n.name,"=").concat(a,","):"float"===n.type?t+="\n    ".concat(n.name,"=").concat(a,","):"str"===n.type?t+="\n    ".concat(n.name,'="').concat(a,'",'):"bool"===n.type&&(t+="\n    ".concat(n.name,"=").concat(a?"True":"False",",")))}p(t+="\n)")},[e]);let g=[];for(let y of u){let x=[];if(x.push((0,a.jsx)(i.Z.Label,{children:(0,a.jsx)("u",{children:y.full_name})})),void 0!==y.choices&&y.type.startsWith("list"))x.push((0,a.jsx)("div",{children:(0,a.jsx)(r.Z,{children:(0,a.jsx)(s.Z,{children:y.choices.map(n=>(0,a.jsx)(l.Z,{xs:3,children:(0,a.jsxs)(i.Z.Check,{type:"checkbox",id:"id-operator-".concat(n),children:[(0,a.jsx)(i.Z.Check.Label,{style:{fontFamily:"monospace"},children:n}),(0,a.jsx)(i.Z.Check.Input,{type:"checkbox",value:n,onChange:t[y.name],checked:e[y.name][0].includes(n)})]})},"col-".concat(y.name,"-").concat(n)))},"row-".concat(y.name))})}));else if(void 0!==y.choices)x.push((0,a.jsx)("div",{children:(0,a.jsx)(r.Z,{children:(0,a.jsx)(s.Z,{children:y.choices.map(n=>(0,a.jsx)(l.Z,{xs:3,children:(0,a.jsxs)(i.Z.Check,{type:"radio",id:"id-operator-".concat(n),children:[(0,a.jsx)(i.Z.Check.Label,{children:n}),(0,a.jsx)(i.Z.Check.Input,{type:"radio",value:n,onChange:t[y.name],checked:e[y.name][0]==n})]})},"col-".concat(y.name,"-").concat(n)))},"row-".concat(y.name))})}));else if(void 0!==y.range){let j=y.log?f(e[y.name][0]):e[y.name][0];"int"===y.type&&(j=Math.round(j)),!0===y.selectable&&(!0===y.log&&1===j||!1===y.log&&0===j)&&(j="Off"),x.push((0,a.jsxs)("div",{children:[(0,a.jsx)(i.Z.Range,{min:y.log?m(y.range[0]):y.range[0],max:y.log?m(y.range[1]):y.range[1],step:1,value:e[y.name][0],onChange:t[y.name]}),(0,a.jsx)("output",{className:"d-flex justify-content-center",children:j})]}))}else"bool"===y.type&&x.push((0,a.jsx)("div",{children:(0,a.jsx)(i.Z.Check,{type:"switch",id:"id-operator-".concat(y.name),children:(0,a.jsx)(i.Z.Check.Input,{type:"checkbox",onChange:t[y.name],checked:e[y.name][0]})})}));g.push((0,a.jsx)("div",{children:x})),g.push((0,a.jsx)("br",{}))}let v=(0,a.jsx)(i.Z,{children:g.map(e=>(0,a.jsx)(i.Z.Group,{children:e}))}),b=(0,a.jsx)(d.Z,{children:(0,a.jsxs)(d.Z.Body,{children:[(0,a.jsx)("pre",{children:(0,a.jsx)("code",{className:"language-python",id:"code-block",children:n})}),(0,a.jsx)("hr",{}),(0,a.jsx)(o.Z,{onClick:e=>{e.preventDefault(),navigator.clipboard.writeText(n)},children:"Copy Definition"})]})});return(0,a.jsxs)("div",{children:[(0,a.jsx)("div",{className:"d-flex justify-content-center align-items-center",children:v}),(0,a.jsx)("div",{className:"d-flex justify-content-center align-items-center",children:b})]})};t.default=g}},function(e){e.O(0,[774,501,591,888,179],function(){return e(e.s=8312)}),_N_E=e.O()}]);