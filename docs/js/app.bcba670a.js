(function(t){function e(e){for(var a,s,i=e[0],u=e[1],l=e[2],c=0,h=[];c<i.length;c++)s=i[c],n[s]&&h.push(n[s][0]),n[s]=0;for(a in u)Object.prototype.hasOwnProperty.call(u,a)&&(t[a]=u[a]);f&&f(e);while(h.length)h.shift()();return o.push.apply(o,l||[]),r()}function r(){for(var t,e=0;e<o.length;e++){for(var r=o[e],a=!0,i=1;i<r.length;i++){var u=r[i];0!==n[u]&&(a=!1)}a&&(o.splice(e--,1),t=s(s.s=r[0]))}return t}var a={},n={app:0},o=[];function s(e){if(a[e])return a[e].exports;var r=a[e]={i:e,l:!1,exports:{}};return t[e].call(r.exports,r,r.exports,s),r.l=!0,r.exports}s.m=t,s.c=a,s.d=function(t,e,r){s.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:r})},s.r=function(t){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},s.t=function(t,e){if(1&e&&(t=s(t)),8&e)return t;if(4&e&&"object"===typeof t&&t&&t.__esModule)return t;var r=Object.create(null);if(s.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var a in t)s.d(r,a,function(e){return t[e]}.bind(null,a));return r},s.n=function(t){var e=t&&t.__esModule?function(){return t["default"]}:function(){return t};return s.d(e,"a",e),e},s.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},s.p="";var i=window["webpackJsonp"]=window["webpackJsonp"]||[],u=i.push.bind(i);i.push=e,i=i.slice();for(var l=0;l<i.length;l++)e(i[l]);var f=u;o.push([0,"chunk-vendors"]),r()})({0:function(t,e,r){t.exports=r("56d7")},"034f":function(t,e,r){"use strict";var a=r("64a9"),n=r.n(a);n.a},"0fe1":function(t,e,r){},"56d7":function(t,e,r){"use strict";r.r(e);r("cadf"),r("551c"),r("097d");var a=r("2b0e"),n=function(){var t=this,e=t.$createElement,r=t._self._c||e;return r("div",{attrs:{id:"app"}},[t.dataOk?r("ProcessData",{attrs:{sourceData:t.sourceData}}):r("DataEntry",{on:{data:t.dataReady}})],1)},o=[],s=function(){var t=this,e=t.$createElement,r=t._self._c||e;return r("div",{staticClass:"get-data"},[r("h1",{staticClass:"title"},[t._v("🦍 hyssing")]),r("textarea",{attrs:{placeholder:"Paste some data here!",autofocus:""},on:{paste:t.dataPasted}})])},i=[],u={name:"DataEntry",data:function(){return{}},methods:{dataPasted:function(t){this.$emit("data",t.clipboardData.getData("text"))}}},l=u,f=(r("a442"),r("2877")),c=Object(f["a"])(l,s,i,!1,null,"31ca27e6",null);c.options.__file="DataEntry.vue";var h=c.exports,p=function(){var t=this,e=t.$createElement,r=t._self._c||e;return r("div",{staticClass:"process-data"},[r("DataView",{staticClass:"data-view",attrs:{id:"previous-data",header:"Current",data:t.dataBox.beforeData}}),r("DataView",{staticClass:"data-view",attrs:{id:"preview-data",header:"Preview",data:t.dataBox.afterData}}),r("TransformEntry",{attrs:{id:"transform-entry",validationResult:t.validationResult},on:{update:t.transformUpdate,save:t.transformSave}}),r("div",{class:{ok:!t.validationResult||t.validationResult.ok},attrs:{id:"validation-result"}},[t._v(t._s(!t.validationResult||t.validationResult.ok?"Ok":t.validationResult.text))])],1)},v=[],m=function(){var t=this,e=t.$createElement,r=t._self._c||e;return r("div",[r("input",{directives:[{name:"model",rawName:"v-model",value:t.transform,expression:"transform"}],attrs:{type:"text",autofocus:"",placeholder:"Enter transform command"},domProps:{value:t.transform},on:{keyup:function(e){return"button"in e||!t._k(e.keyCode,"enter",13,e.key,"Enter")?t.saveTransform(e):null},input:function(e){e.target.composing||(t.transform=e.target.value)}}})])},d=[],g={name:"TransformEntry",props:["validationResult"],data:function(){return{transform:""}},methods:{saveTransform:function(){this.validationResult.ok&&(this.$emit("save",this.transform),this.transform="")}},watch:{transform:function(){this.$emit("update",this.transform)}}},w=g,b=(r("7e6c"),Object(f["a"])(w,m,d,!1,null,"8d18f870",null));b.options.__file="TransformEntry.vue";var D=b.exports,x=function(){var t=this,e=t.$createElement,r=t._self._c||e;return r("div",[r("table",{staticClass:"data-view"},[r("tr",{staticClass:"header"},[r("th"),r("th",{attrs:{colspan:"99999"}},[t._v(t._s(t.header))])]),r("tr",t._l(1+t.localData.columns,function(e){return r("th",{key:e},[t._v(t._s(e>1?e-1:""))])})),t._l(t.localData.rows,function(e,a){return r("tr",{key:a},[r("th",{staticClass:"vertical"},[t._v(t._s(a+1))]),t._l(e,function(e,a){return r("td",{key:a},[r("pre",[t._v(t._s(e))])])})],2)})],2)])},y=[],k={name:"DataView",props:["data","header"],data:function(){return{localData:this.data}}},O=k,_=(r("f681"),Object(f["a"])(O,x,y,!1,null,"181455ac",null));_.options.__file="DataView.vue";var j=_.exports,E=r("d4ec"),R=r("bee2"),C=(r("a481"),r("4917"),r("28a5"),r("3b2b"),r("f559"),function(){function t(){Object(E["a"])(this,t)}return Object(R["a"])(t,[{key:"matches",value:function(t){return t.startsWith("keep lines ")||t.startsWith("drop lines ")}},{key:"validate",value:function(t,e){if("text"!==t.beforeData.type)return{text:"Command only works on text.",ok:!1};try{var r=e.substring("keep lines".length,e.length).trim();if(0===r.length)return{text:"Regex is empty.",ok:!1};r=new RegExp(r,"i")}catch(a){return{text:"Error while parsing regex: '"+a.message+"'",ok:!1}}return{text:"",ok:!0}}},{key:"transform",value:function(t,e){var r=e.substring("keep lines".length,e.length).trim();if(0!==r.length){r=new RegExp(r,"i");for(var a=[],n=0;n<t.beforeData.rows.length;n++){for(var o=[],s=0;s<t.beforeData.rows[n].length;s++){for(var i=t.beforeData.rows[n][s].split("\n"),u=[],l=0;l<i.length;l++)e.startsWith("keep")?i[l].match(r)&&u.push(i[l].replace("\r","")):e.startsWith("drop")&&(i[l].match(r)||u.push(i[l].replace("\r","")));o.push(u.join("\n"))}a.push(o)}t.afterData.rows.splice(0,t.afterData.rows.length);for(var f=0;f<a.length;f++)t.afterData.rows.push(a[f])}}}]),t}()),P=function(){function t(){Object(E["a"])(this,t)}return Object(R["a"])(t,[{key:"matches",value:function(t){return t.startsWith("trim")}},{key:"validate",value:function(t,e){if("text"!==t.beforeData.type)return{text:"Command only works on text.",ok:!1};var r=e.substring("trim".length,e.length).trim();return r.length>0&&"left"!==r&&"right"!==r&&"both"!==r?{text:"Argument must be 'left', 'right' or 'both'.",ok:!1}:{text:"",ok:!0}}},{key:"transform",value:function(t,e){for(var r=e.substring("trim".length,e.length).trim(),a=[],n=0;n<t.beforeData.rows.length;n++){for(var o=[],s=0;s<t.beforeData.rows[n].length;s++){for(var i=t.beforeData.rows[n][s].split("\n"),u=[],l=0;l<i.length;l++)"both"===r||0===r.length?u.push(i[l].trim()):"left"===r?u.push(i[l].trimStart()):"right"===r&&u.push(i[l].trimEnd());o.push(u.join("\n"))}a.push(o)}t.afterData.rows.splice(0,t.afterData.rows.length);for(var f=0;f<a.length;f++)t.afterData.rows.push(a[f])}}]),t}(),T=function(){function t(){Object(E["a"])(this,t)}return Object(R["a"])(t,[{key:"matches",value:function(t){return t.startsWith("replace ")}},{key:"validate",value:function(t,e){if("text"!==t.beforeData.type)return{text:"Command only works on text.",ok:!1};try{var r=e.substring("replace".length,e.length).trim();if(r.indexOf(" ")>0){var a=r.split(" ",2);r=a[0]}if(0===r.length)return{text:"Regex is empty.",ok:!1};r=new RegExp(r,"i")}catch(n){return{text:"Error while parsing regex: '"+n.message+"'",ok:!1}}return{text:"",ok:!0}}},{key:"transform",value:function(t,e){var r=e.substring("replace".length,e.length).trim(),a="";if(r.indexOf(" ")>0){var n=r.split(" ",2);r=n[0],a=n[1]}r=new RegExp(r,"g");for(var o=[],s=0;s<t.beforeData.rows.length;s++){for(var i=[],u=0;u<t.beforeData.rows[s].length;u++)i.push(t.beforeData.rows[s][u].replace(r,a));o.push(i)}t.afterData.rows.splice(0,t.afterData.rows.length);for(var l=0;l<o.length;l++)t.afterData.rows.push(o[l])}}]),t}(),S=function(){function t(){Object(E["a"])(this,t)}return Object(R["a"])(t,[{key:"matches",value:function(t){return t.startsWith("parse json")}},{key:"validate",value:function(t){if("text"!==t.beforeData.type)return{text:"Command only works on text.",ok:!1};var e=0,r=0;try{for(e=0;e<t.beforeData.rows.length;e++)for(r=0;r<t.beforeData.rows[e].length;r++)t.beforeData.rows[e][r]&&t.beforeData.rows[e][r].length>0&&JSON.stringify(JSON.parse(t.beforeData.rows[e][r]))}catch(a){return{text:"Error on row "+(e+1)+" and column "+(r+1)+": "+a.message,ok:!1}}return{text:"",ok:!0}}},{key:"transform",value:function(t){for(var e=[],r=0;r<t.beforeData.rows.length;r++){for(var a=[],n=0;n<t.beforeData.rows[r].length;n++)t.beforeData.rows[r][n]&&t.beforeData.rows[r][n].length>0?a.push(JSON.stringify(JSON.parse(t.beforeData.rows[r][n]),null,2)):a.push('""');e.push(a)}t.afterData.type="json",t.afterData.rows.splice(0,t.afterData.rows.length);for(var o=0;o<e.length;o++)t.afterData.rows.push(e[o])}}]),t}(),I=function(){function t(){Object(E["a"])(this,t)}return Object(R["a"])(t,[{key:"matches",value:function(t){return t.startsWith("split column")}},{key:"validate",value:function(t,e){if("text"!==t.beforeData.type)return{text:"Command only works on text.",ok:!1};var r="1";try{var a=e.substring("split column".length,e.length).trim();if(a.indexOf(" ")>0){var n=a.split(" ",2);a=n[0],r=n[1].trim()}if(0===a.length)return{text:"Regex is empty.",ok:!1};a=new RegExp(a,"i")}catch(o){return{text:"Error while parsing regex: '"+o.message+"'",ok:!1}}try{if(r=parseInt(r),t.beforeData.columns<r)throw new Error("Index larger than number of columns")}catch(o){return{text:"Error while parsing column index: '"+o.message+"'",ok:!1}}return{text:"",ok:!0}}},{key:"transform",value:function(t,e){var r=e.substring("split column".length,e.length).trim(),a="1";if(r.indexOf(" ")>0){var n=r.split(" ",2);r=n[0],a=n[1].trim()}a=parseInt(a),r=new RegExp(r,"g");for(var o=[],s=0,i=0;i<t.beforeData.rows.length;i++){for(var u=[],l=0;l<t.beforeData.rows[i].length;l++)if(l===a-1)for(var f=t.beforeData.rows[i][l].split(r),c=0;c<f.length;c++)(0!==l&&l!==t.beforeData.rows[i].length-1||""!==f[c].trim())&&u.push(f[c]);else u.push(t.beforeData.rows[i][l]);s=Math.max(u.length,s),o.push(u)}t.afterData.rows.splice(0,t.afterData.rows.length);for(var h=0;h<o.length;h++){if(o[h].length<s)for(var p=o[h].length;p<s;p++)o[h].push("");t.afterData.rows.push(o[h])}t.afterData.columns=s}}]),t}(),W=function(){function t(){Object(E["a"])(this,t)}return Object(R["a"])(t,[{key:"matches",value:function(t){return t.startsWith("join column")}},{key:"validate",value:function(t,e){if("text"!==t.beforeData.type)return{text:"Command only works on text.",ok:!1};var r=[];try{var a=e.substring("join column".length,e.length).trim();if(a.indexOf(" ")>0){var n=a.split(" ");a=n[0].trim();for(var o=1;o<n.length;o++)r.push(n[o])}if(0===a.length)return{text:"Regex is empty.",ok:!1}}catch(u){return{text:"Error while parsing regex: '"+u.message+"'",ok:!1}}try{for(var s=0;s<r.length;s++){var i=parseInt(r[s])-1;if(t.beforeData.columns<=i)throw new Error("Index larger than number of columns")}}catch(u){return{text:"Error while parsing column index: '"+u.message+"'",ok:!1}}return{text:"",ok:!0}}},{key:"transform",value:function(t,e){var r=e.substring("join column".length,e.length).trim(),a=[],n={};if(r.indexOf(" ")>0){var o=r.split(" ");r=o[0].trim();for(var s=1;s<o.length;s++)n[parseInt(o[s])-1]=!0,a.push(parseInt(o[s])-1)}r=r.replace("\\n","\n").replace("\\r","\r").replace("\\t","\t");for(var i=[],u=0,l=0;l<t.beforeData.rows.length;l++){for(var f=[],c=[],h=-1,p=0;p<t.beforeData.rows[l].length;p++)0===a.length||n[p]?(c.push(t.beforeData.rows[l][p]),-1===h&&(h=p)):f.push(t.beforeData.rows[l][p]);h>=0&&f.splice(h,0,c.join(r)),u=Math.max(f.length,u),i.push(f)}t.afterData.rows.splice(0,t.afterData.rows.length);for(var v=0;v<i.length;v++){if(i[v].length<u)for(var m=i[v].length;m<u;m++)i[v].push("");t.afterData.rows.push(i[v])}t.afterData.columns=u}}]),t}(),$=function(){function t(){Object(E["a"])(this,t)}return Object(R["a"])(t,[{key:"createInitialData",value:function(t){return{sourceData:this.sourceData,beforeData:{type:"text",columns:1,rows:[[t]]},afterData:{type:"text",columns:1,rows:[[t]]},transforms:[""]}}},{key:"validateTransformOp",value:function(t,e){for(var r=this.transforms,a=0;a<r.length;a++)if(r[a].matches(e))return r[a].validate(t,e);return{text:"'"+e+"' does not match any known command.",ok:!1}}},{key:"transform",value:function(t,e){for(var r=this.transforms,a=0;a<r.length;a++)r[a].matches(e)&&r[a].validate(t,e).ok&&r[a].transform(t,e)}},{key:"preview",value:function(t,e){this.transform(t,e)}},{key:"append",value:function(t,e){this.transform(t,e),t.beforeData.rows.splice(0,t.beforeData.rows.length);for(var r=0;r<t.afterData.rows.length;r++)t.beforeData.rows.push(t.afterData.rows[r]);t.transforms.push(e),t.beforeData.columns=t.afterData.columns,t.beforeData.type=t.afterData.type,this.transform(t,"")}},{key:"transforms",get:function(){return[new C,new P,new T,new S,new I,new W]}}]),t}(),B=new $,J={name:"ProcessData",components:{TransformEntry:D,DataView:j},props:["sourceData"],data:function(){return{validationResult:null}},computed:{dataBox:function(){return B.createInitialData(this.sourceData)}},methods:{transformUpdate:function(t){this.validationResult=B.validateTransformOp(this.dataBox,t),B.validateTransformOp(this.dataBox,t).ok&&B.preview(this.dataBox,t)},transformSave:function(t){B.validateTransformOp(this.dataBox,t).ok&&B.append(this.dataBox,t)}}},M=J,N=(r("c7fb"),Object(f["a"])(M,p,v,!1,null,"24c3fb60",null));N.options.__file="ProcessData.vue";var V=N.exports,A={name:"app",components:{DataEntry:h,ProcessData:V},data:function(){return{sourceData:"",dataOk:!1}},methods:{dataReady:function(t){this.sourceData=t,this.dataOk=!0}}},U=A,q=(r("034f"),Object(f["a"])(U,n,o,!1,null,null,null));q.options.__file="App.vue";var z=q.exports;a["a"].config.productionTip=!1,new a["a"]({render:function(t){return t(z)}}).$mount("#app")},"64a9":function(t,e,r){},"7e6c":function(t,e,r){"use strict";var a=r("0fe1"),n=r.n(a);n.a},9386:function(t,e,r){},a442:function(t,e,r){"use strict";var a=r("daec"),n=r.n(a);n.a},c7fb:function(t,e,r){"use strict";var a=r("d485"),n=r.n(a);n.a},d485:function(t,e,r){},daec:function(t,e,r){},f681:function(t,e,r){"use strict";var a=r("9386"),n=r.n(a);n.a}});
//# sourceMappingURL=app.bcba670a.js.map