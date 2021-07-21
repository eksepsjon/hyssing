import{r as t,o as e,c as n,a as r,t as a,w as o,v as s,F as l,b as i,d as c,e as m,f as d,g as p,h as u,i as h,j as x,k as g,l as f}from"./vendor.7263128d.js";const w={name:"app",components:{},data:function(){return{}},methods:{}},y={class:"bg-gray-800"};w.render=function(a,o,s,l,i,c){const m=t("router-view");return e(),n("div",y,[r(m)])};const b={name:"nextinput",components:{},props:["title","commands","description"],data:function(){return{initial:""}},watch:{initial(t){this.$emit("text-ready",{text:t,commands:this.commands})}},computed:{}},v={class:"bg-gray-800 p-4 rounded-2xl border-2 border-green-300"},k={class:"text-white text-2xl border-b-2 text-center border-green-700 pb-3"};b.render=function(t,l,i,c,m,d){return e(),n("div",v,[r("label",null,[r("h3",k,a(i.title),1),o(r("textarea",{"onUpdate:modelValue":l[1]||(l[1]=e=>t.initial=e),placeholder:i.description+"\n"+i.commands,class:"\n          font-mono\n          bg-transparent\n          w-full\n          mt-3\n          h-20\n          text-white\n          focus:outline-none\n        "},null,8,["placeholder"]),[[s,t.initial]])])])};const C={name:"NextDataView",props:["data"]},R={class:"bg-black"},E={key:0,class:"\n            bg-indigo-900\n            rounded-full\n            text-center\n            w-7\n            h-7\n            flex\n            items-center\n            justify-center\n          "},I={class:"p-2 w-7 bg-gray-900 border-2 border-gray-800 text-right"},M={class:"\n            bg-indigo-900\n            rounded-full\n            w-7\n            h-7\n            flex\n            items-center\n            justify-center\n          "};C.render=function(t,o,s,m,d,p){return e(),n("table",R,[r("tr",null,[(e(!0),n(l,null,i(1+s.data.cols,(t=>(e(),n("th",{class:"border-gray-800 bg-gray-900 p-2 border-2",key:t},[t>1?(e(),n("span",E,a(t>1?t-1:""),1)):c("",!0)])))),128))]),(e(!0),n(l,null,i(s.data.rows,(t=>(e(),n("tr",{key:"r"+t},[r("th",I,[r("span",M,a(t),1)]),(e(!0),n(l,null,i(s.data.cols,(o=>(e(),n("td",{class:"p-2 border-2 border-gray-800",key:"r"+t+"c"+o},[r("pre",null,a(s.data.data[t-1][o-1]),1)])))),128))])))),128))])};class j{info(){return[{prefix:"keep",arguments:"<Regex>",applicable:["text"],text:"Keep rows that match the regex."},{prefix:"drop",arguments:"<Regex>",applicable:["text"],text:"Drop rows that match the regex."}]}validate(t,e){if("text"!==t.type)return{text:"Command only works on text.",ok:!1};try{var n=e&&e.length>1?e[1]:"";if(0===n.length)return{text:"Regex is empty.",ok:!1};n=new RegExp(n,"i")}catch(r){return{text:"Error while parsing regex: '"+r.message+"'",ok:!1}}return{text:"",ok:!0}}transform(t,e){var n=e&&e.length>1?e[1]:"";if(0===n.length)return;n=new RegExp(n,"i");var r=[];let a=0;for(var o=0;o<t.data.length;o++){var s=t.data[o].join("");"keep"===e[0]?s.match(n)&&(r.push(t.data[o]),a=Math.max(t.data[o].length,a)):"drop"===e[0]&&(s.match(n)||(r.push(t.data[o]),a=Math.max(t.data[o].length,a)))}return{rows:r.length,cols:a,type:t.type,data:r}}}class A{info(){return{prefix:"trim",arguments:"<optional left | right | both>",applicable:["text"],text:"Removes whitespace from the left, right or both sides. Both is default."}}validate(t,e){if("text"!==t.type)return{text:"Command only works on text.",ok:!1};var n=e&&e.length>1?e[1]:"both";return n.length>0&&"left"!==n&&"right"!==n&&"both"!==n?{text:"Argument must be 'left', 'right' or 'both'.",ok:!1}:{text:"",ok:!0}}transform(t,e){var n=e&&e.length>1?e[1]:"both",r=[];for(let i=0;i<t.data.length;i++){var a=[];for(let e=0;e<t.data[i].length;e++){for(var o=t.data[i][e].split("\n"),s=[],l=0;l<o.length;l++)"both"===n||0===n.length?s.push(o[l].trim()):"left"===n?s.push(o[l].trimStart()):"right"===n&&s.push(o[l].trimEnd());a.push(s.join("\n"))}r.push(a)}return{rows:t.rows,cols:t.cols,type:t.type,data:r}}}class H{info(){return{prefix:"replace",arguments:"<Regex> <optional Replacement>",applicable:["text"],text:"Replace all characters matching regex with replacement."}}validate(t,e){if("text"!==t.type)return{text:"Command only works on text.",ok:!1};try{var n=e&&e.length>1?e[1]:"";if(0===n.length)return{text:"Regex is empty.",ok:!1};n=new RegExp(n,"i")}catch(r){return{text:"Error while parsing regex: '"+r.message+"'",ok:!1}}return{text:"",ok:!0}}transform(t,e){var n=e&&e.length>1?e[1]:"",r=e&&e.length>2?e[2]:"";n=new RegExp(n,"g");for(var a=[],o=0;o<t.data.length;o++){for(var s=[],l=0;l<t.data[o].length;l++)s.push(t.data[o][l].replace(n,r));a.push(s)}return{rows:a.length,cols:t.cols,type:t.type,data:a}}}class V{info(){return{prefix:"split",arguments:"<Regex> <optional Column #>",applicable:["text"],text:"Split each column into columns where the regex matches. If <Column #> is set only that column is split."}}validate(t,e){if("text"!==t.type)return{text:"Command only works on text.",ok:!1};var n=e&&e.length>2?e[2]:"1";try{var r=e&&e.length>1?e[1]:"";if(0===r.length)return{text:"Regex is empty.",ok:!1};r=new RegExp(r,"i")}catch(a){return{text:"Error while parsing regex: '"+a.message+"'",ok:!1}}try{if(n=parseInt(n),t.cols<n)throw new Error("Index larger than number of columns")}catch(a){return{text:"Error while parsing column index: '"+a.message+"'",ok:!1}}return{text:"",ok:!0}}transform(t,e){var n=e&&e.length>1?e[1]:"",r=e&&e.length>2?parseInt(e[2]):1;n=new RegExp(n,"g");for(var a=[],o=0,s=0;s<t.data.length;s++){for(var l=[],i=0;i<t.data[s].length;i++)if(i===r-1)for(var c=t.data[s][i].split(n),m=0;m<c.length;m++)(0!==i&&i!==t.data[s].length-1||""!==c[m].trim())&&l.push(c[m]);else l.push(t.data[s][i]);o=Math.max(l.length,o),a.push(l)}return{rows:a.length,cols:o,type:t.type,data:a}}}class N{info(){return{prefix:"slice",arguments:"<Regex> <optional Column #>",applicable:["text"],text:"Slice each row into new rows where the regex matches. If <Column #> is not set the first column is used to slice the row."}}validate(t,e){if("text"!==t.type)return{text:"Command only works on text.",ok:!1};var n=e&&e.length>2?e[2]:"1";try{var r=e&&e.length>1?e[1]:"";if(0===r.length)return{text:"Regex is empty.",ok:!1};r=new RegExp(r,"i")}catch(a){return{text:"Error while parsing regex: '"+a.message+"'",ok:!1}}try{if(n=parseInt(n),t.cols<n)throw new Error("Index larger than number of columns")}catch(a){return{text:"Error while parsing column index: '"+a.message+"'",ok:!1}}return{text:"",ok:!0}}transform(t,e){var n=e&&e.length>1?e[1]:"",r=e&&e.length>2?parseInt(e[2]):1;n=new RegExp(n,"g");var a=[];let o=0;for(var s=0;s<t.data.length;s++)for(var l=0;l<t.data[s].length;l++)if(l===r-1)for(var i=t.data[s][l].split(n),c=0;c<i.length;c++)if(""!==i[c].trim()){var m=JSON.parse(JSON.stringify(t.data[s]));m[l]=i[c],a.push(m),o=Math.max(m.length,o)}return{rows:a.length,cols:o,type:t.type,data:a}}}class S{info(){return{prefix:"join",arguments:"<Join String> <optional Column #> .. <optional Column #>",applicable:["text"],text:"Merge columns with <Join String>. Optionally select which columns to merge, otherwise all columns are merged."}}validate(t,e){if("text"!==t.type)return{text:"Command only works on text.",ok:!1};if(0===(e&&e.length>1?e[1]:"").length)return{text:"Join string is empty.",ok:!1};for(let a=2;a<e.length;a++)try{var n=parseInt(e[a])-1;if(t.cols<=n)throw new Error("Index larger than number of columns")}catch(r){return{text:"Error while parsing column index: '"+a+"': '"+r.message+"'",ok:!1}}return{text:"",ok:!0}}transform(t,e){var n=e&&e.length>1?e[1]:"",r=[],a={};for(let p=2;p<e.length;p++)a[parseInt(e[p])-1]=!0,r.push(parseInt(e[p])-1);n=n.replace("\\n","\n").replace("\\r","\r").replace("\\t","\t");for(var o=[],s=0,l=0;l<t.data.length;l++){for(var i=[],c=[],m=-1,d=0;d<t.data[l].length;d++)0===r.length||a[d]?(c.push(t.data[l][d]),-1===m&&(m=d)):i.push(t.data[l][d]);m>=0&&i.splice(m,0,c.join(n)),s=Math.max(i.length,s),o.push(i)}return{rows:o.length,cols:s,type:t.type,data:o}}}class L{info(){return{prefix:"merge",arguments:"<Merge String>",applicable:["text"],text:"Merge rows with <Merge String>."}}validate(t,e){return"text"!==t.type?{text:"Command only works on text.",ok:!1}:0===(e&&e.length>1?e[1]:"").length?{text:"Merge string is empty.",ok:!1}:{text:"",ok:!0}}transform(t,e){var n=e&&e.length>1?e[1]:"",r=[];for(let l=0;l<t.cols;l++)r.push([]);for(var a=0;a<t.data.length;a++)for(var o=0;o<t.data[a].length;o++)r[o].push(t.data[a][o]);n=n.replace("\\n","\n").replace("\\r","\r").replace("\\t","\t");var s=[[]];for(let l=0;l<t.cols;l++)s[0].push(r[l].join(n));return{rows:s.length,cols:r.length,type:t.type,data:s}}}class ${info(){return{prefix:"substring",arguments:"<Num chars left> <optional Num chars right>",applicable:["text"],text:"Remove N characters starting from the left, and M number of characters from the right."}}validate(t,e){if("text"!==t.type)return{text:"Command only works on text.",ok:!1};try{var n=e&&e.length>1?parseInt(e[1]):0,r=e&&e.length>2?parseInt(e[2]):0;if(n<0||r<0)return{text:"Argument cannot be less than 0.",ok:!1}}catch(a){return{text:"Error while parsing arguments: '"+a.message+"'",ok:!1}}return{text:"",ok:!0}}transform(t,e){for(var n=e&&e.length>1?parseInt(e[1]):0,r=e&&e.length>2?parseInt(e[2]):0,a=[],o=0;o<t.data.length;o++){for(var s=[],l=0;l<t.data[o].length;l++){var i=t.data[o][l];n>0&&(i=i.substring(n,i.length)),r>0&&(i=i.substring(0,i.length-r)),s.push(i)}a.push(s)}return{rows:a.length,cols:t.cols,type:t.type,data:a}}}class B{info(){return{prefix:"copy",arguments:"",applicable:["text","json"],text:"Copy to clipboard."}}validate(){return navigator.clipboard?{text:"",ok:!0}:{text:"Browser does not support Clipboard API",ok:!1}}transform(t){for(var e=[],n=0;n<t.rows.length;n++)e.push(t.data[n].join("\t"));return navigator.clipboard.writeText(e.join("\n")).then((function(){console.log("Async: Copying to clipboard was successful!")}),(function(t){console.error("Async: Could not copy text: ",t)})),t}}class D{info(){return{prefix:"insert",arguments:"<String to surround existing text, text inserted by replacing {}>",applicable:["text"],text:"Insert existing text into a string."}}validate(t,e){return"text"!==t.type?{text:"Command only works on text.",ok:!1}:(e&&e.length>1?e[1]:"").indexOf("{}")<0?{text:"Error while parsing argument: Must have {} to insert text into.",ok:!1}:{text:"",ok:!0}}transform(t,e){for(var n=e&&e.length>1?e[1]:"",r=new RegExp("\\{\\}","g"),a=[],o=0;o<t.data.length;o++){for(var s=[],l=0;l<t.data[o].length;l++)s.push(n.replace(r,t.data[o][l]));a.push(s)}return{rows:a.length,cols:t.cols,type:t.type,data:a}}}class O{info(){return[{prefix:"base64",arguments:"",applicable:["text"],text:"Replace all characters with a Base64 encoding."},{prefix:"unbase64",arguments:"",applicable:["text"],text:"Decode a Base64 string."}]}validate(t,e){return"text"!==t.type?{text:"Command only works on text.",ok:!1}:{text:"",ok:!0}}transform(t,e){for(var n=[],r=0;r<t.data.length;r++){for(var a=[],o=0;o<t.data[r].length;o++)"base64"===e[0]?a.push(btoa(t.data[r][o])):a.push(atob(t.data[r][o]));n.push(a)}return{rows:n.length,cols:t.cols,type:t.type,data:n}}}class J{info(){return{prefix:"transpose",arguments:"<Number of rows>",applicable:["text"],text:"Move row 1 2 .. # to separate columns, repeating until row max is reached."}}validate(t,e){return"text"!==t.type?{text:"Command only works on text.",ok:!1}:t.cols>1?{text:"Number of columns must be 1",ok:!1}:(e&&e.length>1?parseInt(e[1]):1)<2?{text:"Number of rows should be more than 1",ok:!1}:{text:"",ok:!0}}transform(t,e){for(var n=e&&e.length>1?parseInt(e[1]):1,r=[],a=0,o=[],s=0,l=0;l<t.data.length;l++)s++,o.push(t.data[l][0]),a=Math.max(o.length,a),s>=n&&(r.push(o),o=[],s=0);return a=Math.max(o.length,a),r.push(o),{rows:r.length,cols:a,type:t.type,data:r}}}class P{get transforms(){return[new B,new j,new A,new H,new $,new N,new V,new S,new L,new D,new O,new J]}arrify(t){let e=[];if(!t)return e;let n="",r=!1,a=!1;for(let o=0;o<t.length;o++)a||r||" "!==t[o]?a||"\\"!==t[o]?a||r||'"'!==t[o]?!a&&r&&'"'===t[o]?r=!1:(n+=t[o],a=!1):r=!0:a=!0:(e.push(n.trim()),n="");return n.length&&e.push(n),e}get commands(){var t=[];let e=this.transforms;for(var n=0;n<e.length;n++)if(e[n].info)for(var r=Array.isArray(e[n].info())?e[n].info():[e[n].info()],a=0;a<r.length;a++)t.push({command:r[a],transform:e[n]});return t}findCommand(t){for(var e=0;e<this.commands.length;e++)if(t[0]===this.commands[e].command.prefix)return this.commands[e];return null}validateTransformOp(t,e){const n=this.findCommand(e);return n?n.transform.validate(t,e):{text:"'"+e[0]+"' does not match any known command.",ok:!1,unknownCommand:!0}}transform(t,e){const n=this.findCommand(e);if(n&&n.transform.validate(t,e).ok){const r=n.transform.transform(t,e);return r.appliedCommands=(t.appliedCommands?t.appliedCommands:[]).concat([e]),r}return null}}const T=new P,Z={name:"nextapp",components:{NextInput:b,NextDataView:C},data:function(){return{initial:"",current:window.currentData?window.currentData:null,next:null,command:"",validationResult:{ok:!1,unknownCommand:!0,text:""},commands:T.commands}},computed:{routeCmds(){return this.$route.params.cmd?JSON.parse(atob(this.$route.params.cmd)):null},cmd(){return T.arrify(this.command)}},watch:{command(){this.preview()}},methods:{storeCommandsInParams(){const t=[];for(let e=0;e<this.current.appliedCommands.length;e++)t.push(this.current.appliedCommands[e].join(" "));this.$router.replace({name:"processb64",params:{cmd:btoa(JSON.stringify(t))}})},init({text:t,commands:e}){let n={rows:1,cols:1,type:"text",data:[[t]]};for(let r=0;r<e.length;r++){const t=T.transform(n,T.arrify(e[r]));console.log("Apply command",e[r],n,t),t?n=t:this.command=e[r]}this.current=n,this.next=null,this.command="",this.storeCommandsInParams()},preview(){this.validationResult=T.validateTransformOp(this.current,this.cmd),this.next=T.transform(this.current,this.cmd)},process(){const t=T.transform(this.current,this.cmd);t&&(this.current=t,this.next=null,this.command="",this.storeCommandsInParams())}}},U={key:0,class:"h-screen w-screen flex items-center justify-center"},_={key:1,class:"h-screen bg-gray-900 flex flex-row justify-items-stretch"},G={class:"\n            flex-grow flex-shrink-0\n            w-1/3\n            max-w-sm\n            flex flex-col\n            items-stretch\n            justify-self-stretch\n          "},K=r("div",{class:"\n              flex-grow-0 flex-shrink-0\n              bg-indigo-800\n              text-center text-xl\n              p-4\n            "}," Hyssing ",-1),z={class:"flex-grow bg-gray-900 flex flex-col overflow-auto"},F=r("div",{class:"text-gray-500 p-4"},"Applied commands",-1),q={class:"flex-grow-0 flex-shrink-0 flex items-stretch"},Q={key:0,class:"\n                absolute\n                left-2\n                bottom-16\n                z-20\n                bg-red-800\n                text-white text-xl\n                rounded-full\n                pl-8\n                pr-8\n                border-2 border-red-500\n              "},W={class:"max-h-screen overflow-auto bg-black w-full p-2"};Z.render=function(d,p,u,h,x,g){const f=t("next-input"),w=t("next-data-view");return e(),n("div",null,[d.current?(e(),n("div",_,[r("div",G,[K,r("div",z,[F,(e(!0),n(l,null,i(d.current.appliedCommands,((t,r)=>(e(),n("div",{class:"bg-indigo-900 p-4 m-2 rounded-2xl rounded-bl-none",key:r},[(e(!0),n(l,null,i(t,((t,r)=>(e(),n("span",{key:r+"s",class:"\n                  inline-block\n                  bg-black\n                  rounded\n                  mr-2\n                  p-1\n                  pr-2\n                  pl-2\n                  font-mono\n                "},a(t),1)))),128))])))),128))]),r("div",q,[g.cmd&&g.cmd.length&&!d.validationResult.ok?(e(),n("div",Q,a(d.validationResult.text),1)):c("",!0),o(r("input",{placeholder:"Enter transform command here...",spellcheck:"false",class:["\n                bg-gray-900\n                text-white\n                border-b-2 border-gray-700\n                focus:outline-none\n                font-mono\n                p-2\n                pl-4\n                pr-4\n                m-2\n                flex-grow\n                focus:bg-black\n              ",d.validationResult.ok||g.cmd&&0===g.cmd.length?"":"border-red-500"],"onUpdate:modelValue":p[2]||(p[2]=t=>d.command=t),onKeyup:p[3]||(p[3]=m(((...t)=>g.process&&g.process(...t)),["enter"]))},null,34),[[s,d.command]])])]),r("div",W,[d.next?(e(),n(w,{key:0,data:d.next},null,8,["data"])):(e(),n(w,{key:1,data:d.current},null,8,["data"]))])])):(e(),n("div",U,[g.routeCmds?(e(),n(f,{key:0,class:"max-w-4xl flex-grow mr-4 mb-4",title:"URL Recipe",description:"",commands:g.routeCmds,onTextReady:p[1]||(p[1]=t=>g.init(t))},null,8,["commands"])):c("",!0)]))])};const X={name:"nextinput",components:{NextInput:b},data:function(){return{initial:""}},computed:{inputs:()=>[{title:"No Recipe",description:"No commands are applied.",commands:[]},{title:"Line-by-line",description:"Split text by line breaks.",commands:["slice \\\\n"]},{title:"Encode to base64",description:"Encode text with base64.",commands:["base64"]},{title:"Decode from base64",description:"Decode base64 text.",commands:["unbase64"]}]},methods:{init(t){this.$emit("text-ready",{text:t,commands:["slice \\\\n"]})}}},Y={class:"flex flex-row flex-wrap"};X.render=function(r,a,o,s,c,m){const d=t("next-input");return e(),n("div",Y,[(e(!0),n(l,null,i(m.inputs,(t=>(e(),n(d,{class:"max-w-4xl flex-grow mr-4 mb-4",title:t.title,description:t.description,commands:t.commands,key:t.title,onTextReady:a[1]||(a[1]=t=>r.$emit("text-ready",t))},null,8,["title","description","commands"])))),128))])};const tt={name:"Step"},et={class:"border border-gray-900 p-2 flex flex-row items-stretch justify-start"},nt={class:"flex flex-col items-center justify-start p-2"},rt={class:"flex flex-col items-start h-full p-2"},at={class:"text-lg font-bold uppercase tracking-widest"},ot={class:"text-gray-300"};tt.render=function(t,a,o,s,l,i){return e(),n("div",et,[r("div",nt,[d(t.$slots,"icon")]),r("div",rt,[r("span",at,[d(t.$slots,"default")]),r("span",ot,[d(t.$slots,"description")])])])};const st=new P,lt={name:"home",components:{NextInputArea:X,Step:tt},data:function(){return{commands:st.commands}},methods:{init({text:t,commands:e}){let n={rows:1,cols:1,type:"text",data:[[t]]};for(let r=0;r<e.length;r++){const t=st.transform(n,st.arrify(e[r]));console.log("Apply command",e[r],n,t),t&&(n=t)}window.currentData=n,this.$router.push({name:"process"})}}},it={class:"flex flex-col items-center justify-between min-h-screen"},ct={class:"flex flex-col items-center w-full"},mt={class:"\n          w-full\n          max-w-4xl\n          flex flex-col\n          md:flex-row\n          rounded-xl\n          mt-16\n          mb-16\n          p-8\n          sm:p-0\n        "},dt=r("div",{class:"text-center md:w-1/2 flex flex-col items-start justify-center"},[r("h1",{class:"text-7xl p-4"},"hyssing"),r("p",{class:"text-xl text-gray-300 m-3 p-4 pb-8 sm:pb-0"}," A tool to transform text. ")],-1),pt={class:"\n            bg-gray-900\n            flex flex-col\n            items-stretch\n            rounded-xl\n            justify-between\n            md:w-1/2\n          "},ut=u(" Paste "),ht=u("Paste your text in a recipe box"),xt=r("svg",{class:"w-8 h-8 m-4 rounded-full text-green-300 flex-none",viewBox:"0 0 24 24"},[r("path",{fill:"currentColor",d:"M19,20H5V4H7V7H17V4H19M12,2A1,1 0 0,1 13,3A1,1 0 0,1 12,4A1,1 0 0,1 11,3A1,1 0 0,1 12,2M19,2H14.82C14.4,0.84 13.3,0 12,0C10.7,0 9.6,0.84 9.18,2H5A2,2 0 0,0 3,4V20A2,2 0 0,0 5,22H19A2,2 0 0,0 21,20V4A2,2 0 0,0 19,2Z"})],-1),gt=u(" Transform "),ft=u("Enter commands to transform the text"),wt=r("svg",{class:"w-8 h-8 m-4 rounded-full text-blue-300 flex-none",viewBox:"0 0 24 24"},[r("path",{fill:"currentColor",d:"M13,19V16H21V19H13M8.5,13L2.47,7H6.71L11.67,11.95C12.25,12.54 12.25,13.5 11.67,14.07L6.74,19H2.5L8.5,13Z"})],-1),yt=u(" Repeat "),bt=u("Bookmark the commands and repeat the transformation again and again."),vt=r("svg",{class:"w-8 h-8 m-4 rounded-full text-yellow-300 flex-none",viewBox:"0 0 24 24"},[r("path",{fill:"currentColor",d:"M17,17H7V14L3,18L7,22V19H19V13H17M7,7H17V10L21,6L17,2V5H5V11H7V7Z"})],-1),kt={class:"w-full bg-black flex flex-col items-center p-8"},Ct=r("div",{class:"w-full max-w-4xl"},[r("h2",{class:"text-2xl mt-12 mb-6"},'"Paste & Go" Recipes')],-1),Rt={class:"rounded-xl mb-16 w-full max-w-4xl"},Et=r("div",{class:"p-8 w-full bg-gray-900 text-gray-400 flex flex-col items-center"},[r("div",{class:"w-full max-w-4xl"},[r("a",{href:"https://github.com/eksepsjon/hyssing",class:"flex flex-row hover:underline items-center"},[r("svg",{class:"w-8 h-8 m-2",viewBox:"0 0 24 24"},[r("path",{fill:"currentColor",d:"M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z"})]),u(" Check out on GitHub ")])])],-1);lt.render=function(a,o,s,l,i,c){const m=t("step"),d=t("next-input-area");return e(),n("div",it,[r("div",ct,[r("div",mt,[dt,r("div",pt,[r(m,null,{description:p((()=>[ht])),icon:p((()=>[xt])),default:p((()=>[ut])),_:1}),r(m,null,{description:p((()=>[ft])),icon:p((()=>[wt])),default:p((()=>[gt])),_:1}),r(m,null,{description:p((()=>[bt])),icon:p((()=>[vt])),default:p((()=>[yt])),_:1})])]),r("div",kt,[Ct,r("div",Rt,[r(d,{onTextReady:o[1]||(o[1]=t=>c.init(t))})])])]),Et])};const It=[{path:"/",component:lt},{path:"/process",name:"process",component:Z},{path:"/process/:cmd",name:"processb64",component:Z}],Mt=h({history:x(),routes:It}),jt=g({render:()=>f(w)});jt.use(Mt),jt.mount("#app");
