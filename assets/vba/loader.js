class NengeController{constructor(t){let e=this,a=t.T,n=a.I;n.defines(this,{T:a,I:n,M:t},1),t.canvas&&(t.canvas.hidden=!1),this.runaction=a.runaction,this.runaction("BulidButton"),["keydown","keyup"].forEach((n=>{a.on(document,n,(n=>{let o=n.type;if(e.keymap.includes(n.code)){let t=e.keymap.indexOf(n.code);return"keydown"==o?e.VKDATA[e.keyList[t]]=1:delete e.VKDATA[e.keyList[t]],a.stopProp(n)}if("keyup"==o&&"Escape"==n.code&&null!=t.isRunning)return t.$(".gbaemu-startinfo").hidden=!0,t.Nttr(".g-menu").click(),a.stopProp(n)}),!1)})),["gamepadconnected","gamepaddisconnected"].forEach((t=>a.on(window,t,(t=>{this.loadgamepad(t)}))));let o=localStorage.getItem("vba-setting");o&&(o=JSON.parse(o),e.keymap=o.keymap,e.gamePadKeyMap=o.gamePadKeyMap)}button={a:{key:1,name:"A",pos:"xyab"},b:{key:0,name:"B",pos:"xyab"},up:{key:12,name:"↑",pos:"dp",class:"up"},down:{key:13,name:"↓",pos:"dp",class:"down"},left:{key:14,name:"←",pos:"dp",class:"left"},right:{key:15,name:"→",pos:"dp",class:"right"},select:{key:8,name:"SELETC",pos:"left",class:"select"},start:{key:9,name:"START",pos:"right",class:"start"},l:{key:4,name:"L",pos:"left",class:"l"},r:{key:5,name:"R",pos:"right",class:"r"}};keyList=["a","b","select","start","right","left","up","down","r","l"];keymap=["KeyZ","KeyX","ShiftRight","Enter","ArrowRight","ArrowLeft","ArrowUp","ArrowDown","KeyW","KeyQ"];get VKSTATUS(){let t=this,e=0;for(var a=0;a<10;a++)e|=t.GETKEY(a)<<a;return e}GETKEY(t){let e=this,a=e.VKDATA,n=e.gamepadStatus;return n&&(a=Object.assign({},a,n)),a[e.keyList[t]]||0}VKDATA={};MenuList={fps60:"set fps 60",exportSrm:"Export SRM",importSrm:"Import SRM",opencheat:"use cheat",Filemanager:"File Manager",keysetting:"Key setting",reload:"Refresh Page"};action={BulidButton(){let t=this,e=t.T,a=t.I,n=t.M,o=n.Nttr(".user-controller");o.html('<div class="g-left"></div><div class="g-right"></div><div class="g-menulist" hidden></div>');let r=o.$(".g-left"),i=o.$(".g-right"),s="",l="";a.toArr(t.button,(e=>{let[a,n]=e;"left"==n.pos&&(s+=t.runaction("getButton",["left",a])),"right"==n.pos&&(l+=t.runaction("getButton",["right",a]))})),s+='<button type="button" class="g-menu">Menu</button>',s+='<div class="g-dp">'+t.runaction("getArrow")+"</div>",l+='<div class="g-dp">'+t.runaction("getXYAB")+"</div>",r.innerHTML=s,i.innerHTML=l;let d=[];e.stopGesture(o.obj),e.stopGesture(n.canvas),o.on("contextmenu",(t=>e.stopProp(t))),["touchstart","touchmove","touchend","touchcancel"].forEach((a=>{o.on(a,(a=>{let o=[];n.runaction("tryInitSound"),"touchstart"==a.type?o=d.concat(t.runaction("getButtonKey",[a.target])):a.touches&&a.touches.length&&(o=Array.from(a.touches).map((e=>t.runaction("getButtonKey",[document.elementFromPoint(e.pageX,e.pageY)])))),o.length>0&&(o=o.join(",").split(",")),o.join()!=d&&(t.runaction("sendInputKey",[d,o]),d=o),e.stopEvent(a)}),{passive:!1})})),e.I.mobile||["pointerup","pointerdown"].forEach((e=>{o.on(e,(e=>{let a=[];n.runaction("tryInitSound"),"pointerdown"==e.type?a=[t.runaction("getButtonKey",[e.target])]:d=[t.runaction("getButtonKey",[e.target])],a.join()!=d&&(t.runaction("sendInputKey",[d,a]),d=a)}))}));let u=n.Nttr(".user-controller .g-menulist"),g=n.Nttr(".user-controller .g-menu");g.click((t=>{let e=u.hidden;if(g.active=e,u.hidden=!e,t.stopPropagation)return t.stopPropagation()}),"pointerup",{passive:!1}),t.runaction("BulidMenu",[u])},CallMenu(t){},BulidMenu(t){let e=this,a=e.T,n=e.I,o=e.M,r=`<h3>FPS:<span class="g-status">${o.fps}</span></h3><label><input class="gba-fps-input" type="range" min="29" max="180" value="${o.fps}"></label><ul>`;n.toArr(e.MenuList,(t=>{r+=`<li><button type="button" class="g-btn g-blue" data-act="${t[0]}">${a.getLang(t[1])}</button>`})),r+="</li></ul>",r+=`<h3>${a.getLang("shader mode")}</h3><ul>`,["Pixelated","Smooth","XBRZ"].forEach(((t,e)=>{r+=`<li><button type="button" class="g-btn g-blue" data-act="setShader" data-value="${e}">${a.getLang(t)}</button>`})),r+="</ul>",t.html(r),o.Nttr(".gba-fps-input").on("change",(e=>{let a=e.target.value;t.$(".g-status").innerHTML=a,o.fps=parseInt(a)})),["touchstart","touchmove","touchend","touchcancel"].forEach((t=>o.Nttr(".gba-fps-input").on(t,(t=>{t.stopPropagation()}),{passive:!0}))),t.click((n=>{let r=n.target;if(r instanceof Element){let i=r.getAttribute("data-act");if(i)return e.runaction(i,[r,t]),o.Nttr(".user-controller .g-menu").click(),a.stopProp(n)}}))},reload(){location.reload()},fps60(t,e){e.$(".gba-fps-input").value=60,e.$(".g-status").innerHTML=60,this.M.fps=60},async replaceCanvas(t){let e=this.M,a=e.T.$ce("canvas");a.id=e.canvas.id,a.width=240,a.height=160;let n=e.canvas.parentNode.replaceChild(a,e.canvas);return e.drawContext=null,e.gl=null,e.canvas=a,"2d"==t?e.drawContext=e.canvas.getContext("2d"):await e.runaction("gpuInit"),n.remove(),e.canvas},async setShader(t){let e=this,a=e.M,n=a.canvas,o=t instanceof Element?parseInt(t.getAttribute("data-value")):t;a.optScaleMode!==o?o>=2&&a.optScaleMode<2?n=await e.runaction("replaceCanvas",["3d"]):o<2&&a.optScaleMode>=2&&(n=await e.runaction("replaceCanvas",["2d"])):o>=2?await await a.runaction("gpuInit"):a.drawContext=a.canvas.getContext("2d"),a.optScaleMode=o,n.style.removeProperty("image-rendering"),0==a.optScaleMode&&(n.style.imageRendering="pixelated")},exportSrm(){return this.M.runaction("exportSrm")},importSrm(){let t=this,e=(t.T,t.I,t.M);t.upload((t=>{Array.from(t).forEach((async t=>{e.runaction("loadSRM",new Uint8Array(await t.arrayBuffer())),t=null}))}),1)},async opencheat(){let t=this,e=t.M,a=e.T,n="";if(e.$(".gbaemu-startinfo").hidden=!1,null==t.cheatTxt){let a=await e.runaction("loadCheat");a&&(t.cheatTxt=(new TextDecoder).decode(a))}n+=`<p><textarea class="cheat_txt">${t.cheatTxt||""}</textarea></p><p>${a.getLang("Cheat code:\nGameshark: XXXXXXXXYYYYYYYY\nAction Replay: XXXXXXXX YYYY")}</p><p><button data-act="applycheat">${a.getLang("apply cheat")}</button> <button data-act="loadcheat">${a.getLang("load cheat")}</button> <button data-act="close">${a.getLang("close")}</button></p><div class="cheat-result"></div>`,e.$(".g-lastInfo").innerHTML=n},async keysetting(){let t=this,e=t.M,a=e.T,n="";e.$(".gbaemu-startinfo").hidden=!1,n+=`<table class="g-keysetting"><tr><td>${a.getLang("keyname")}</td><td>${a.getLang("Keyboard")}</td><td>${a.getLang("gamepad")}</td></tr>`,t.keyList.forEach(((e,a)=>{n+=`<tr><th>${e}</th><td><input type="text" data-act="Keyboard" value="${t.keymap[a]}"></td><td><input type="text" data-act="gamepad" data-padid="${e}" value="${t.gamePadKeyMap[e]}"></td></tr>`})),n+=`</table><p><button data-act="applykey">${a.getLang("apply setting")}</button><button data-act="clearkey">${a.getLang("clear setting")}</button><button data-act="close">${a.getLang("close")}</button></p>`,e.$(".g-lastInfo").innerHTML=n},sendInputKey(t,e){let a=this,n=(a.T,a.I,a.M);t=t.filter((t=>{if(t)return n.Nttr('button[data-key="'+t+'"]').active=!1,!e.includes(t)})),e=e.filter((t=>(t&&(n.Nttr('button[data-key="'+t+'"]').active=!0),t))),a.runaction("EnterKey",[t,!1]),a.runaction("EnterKey",[e,!0])},EnterKey(t,e){let a=this;a.T,a.I,a.M;return void t.forEach((t=>{e?a.VKDATA[t]=1:delete a.VKDATA[t]}));t.forEach((t=>a.runaction("keyEvent",[e||!1,{code:a.Reflect[t],key:t}])))},keyEvent(t,e){document.dispatchEvent(new KeyboardEvent(t?"keydown":"keyup",e))},getButtonKey(t){this.T;if(this.I.elment(t)){let e=t.getAttribute("data-key");if(e)return e}return""},getArrow(){let t=this,e="";return["up,left","up","up,right","left","","right","down,left","down","down,right"].forEach(((a,n)=>{e+=t.runaction("getButton",["left",a])})),e},getXYAB(){let t=this,e="";return["x","y","a","b"].forEach(((a,n)=>{t.button[a]&&(e+=t.runaction("getButton",["right",a]))})),e},getButton(t,e){let a=this.button[e],n=e;if(!a){if("right"==t)return;n="",a={}}return`<button type="button" data-key="${e}" class="key-${t}-${n||"null"} ${a.class?"key-"+a.class:""}" style="${a.style?a.style:""}">${a.name||""}</button>`},ReSizeCtrl(t,e){this.AspectRatio},ReSizeCanvas(t){let e=this,a=(e.T,e.I),n=e.M;t&&([e.width,e.height]=t.map((t=>parseInt(t))),e.AspectRatio=e.width/e.height);let o=n.Nttr(".g-game-ui").getBoundingClientRect(),r=e.Quality||720,i=o.width/o.height;if(a.mobile){if(e.AspectRatio){if(void 0!==window.orientation&&0!=window.orientation)n.Nttr(".user-controller").css="";else{i=e.AspectRatio;let t=0,a=o.height-o.width/i-20,r=Math.min(a,400);a-50>r&&(t=a-50-r),n.Nttr(".user-controller").css="height:"+r+"px;margin-top:"+t+"px"}n.setCanvasSize(r*i,r),e.runaction("ReSizeCtrl",[o,n.canvas.getBoundingClientRect().height])}}else{let t=o.height>r?o.height:r;n.setCanvasSize(t*i,t)}},async StartInfo(){let t=this.M,e=t.T,a=localStorage.getItem("last-game"),n=t.Nttr(".g-lastInfo"),o="";if(a){let n=await t.db.userdata.data("/userdata/screenshots/"+a.replace(/\.gba/,".png"));n&&(t.imgList[a]=e.F.URL(n,{type:"image/png"})),o+=`<h3>${e.getLang("last play")}</h3><div><p>${a}</p><p><button data-game="${a}">${e.getLang("Run this Game")}</button></p>${t.imgList[a]?`<p><img src="${t.imgList[a]}" width="240"></p>`:""}</div>`}this.runaction("StartFromFile",[n,o])},async ShowSRM(){let t=this.M,e=t.T,a="",n=await t.db.userdata.keys();n.forEach((async o=>{let[r,i]=o;if(/\.srm$/.test(r)){let o=e.F.getname(r),i="/userdata/screenshots/"+o.replace(".srm",".png");n.includes(i)&&(t.imgList[r]&&e.F.removeURL(t.imgList[r]),t.imgList[r]=e.F.URL(await t.db.userdata.data(i),{type:"image/png"})),a+=`<li><span>${o}</span><p><button data-act="loadSrm" data-path="${r}">${e.getLang("load saves")}</button><button data-act="removeSRM" data-path="${r}">${e.getLang("remove saves")}</button></p>${t.imgList[r]?`<p><img src="${t.imgList[r]}"  width="240"></p>`:""}</li>`}})),a&&(a=`<ul>${a}</ul>`)},async getRoomsList(){let t=this.M,e=t.T,a=await t.db.rooms.keys(),n="";return n=`<h3>${e.getLang("Cache Game File")}<button data-act="upload">${e.getLang("Import Game File")}</button></h3><ul class="game-result">`,a&&a.length>0&&a.forEach((t=>{n+=`<li><span>${t}</span><p><button data-game="${t}">${e.getLang("Run this Game")}</button><button data-act="remove" data-game="${t}">${e.getLang("remove Game")}</button></p></li>`})),n+="</ul>",n},async StartFromFile(t,e){let a=this;a.M.T;e=e||"",e+=await a.runaction("getRoomsList"),t.html(e),["keyup","keydown","keypress","wheel"].forEach((e=>t.on(e,(t=>{t.target instanceof Element&&"Keyboard"==t.target.getAttribute("data-act")&&(t.target.value=t.code),t.stopPropagation()}),{passive:!1}))),a.runaction("setInfoEvent",[t])},setInfoEvent(t){let e=this,a=e.M,n=a.T,o=t.$(".game-result");t.click((async r=>{if(t.active)return;let i=r.target;if(i instanceof Element){let r=i.getAttribute("data-act");if("upload"==r)e.upload((async t=>{await Promise.all(Array.from(t).map((async t=>{let a=new Uint8Array(await t.arrayBuffer()),r=t.name,i=e.runaction("addStatusItem",[o,`${r} ${n.getLang("Import ...")}`]);a=await n.unFile(a,(t=>{i.innerHTML=`${r} ${n.getLang("unpack status")}: ${t}`})),a instanceof Uint8Array?e.runaction("addroomItem",[o,r,a]):n.I.toArr(a,(t=>{e.runaction("addroomItem",[o,t[0],t[1]])})),a=null})))}));else if("remove"==r)i.getAttribute("data-game")&&a.db.rooms.remove(i.getAttribute("data-game")),i.getAttribute("data-path")&&a.db.userdata.remove(i.getAttribute("data-path")),i.getAttribute("data-js")&&a.db.libjs.remove(i.getAttribute("data-js")),i.parentNode.parentNode.remove();else if("downstore"==r){let t=i.getAttribute("data-db"),e=i.getAttribute("data-key");if(t==a.db.libjs.table)return a.runaction("showMsg",[n.getLang("this data cant download!")]);let o=await n.getStore(t).data(e);o instanceof Uint8Array?n.down(n.F.getname(e),o):o&&n.I.toArr(o).forEach((t=>n.down(t[0],t[1])))}else if("reRun"==r){let t=i.getAttribute("data-db"),e=i.getAttribute("data-key");a.reloadRoom(e,await n.getStore(t).data(e))}else if("removestore"==r){let t=i.getAttribute("data-db");if(t==a.db.libjs.table)return alert(n.getLang("this data cant download!"));n.getStore(t).remove(i.getAttribute("data-key")),i.parentNode.parentNode.remove()}else if("toggleUl"==r){let t=i.nextElementSibling;t.hidden=!t.hidden}else if("close"==r)a.$(".gbaemu-startinfo").hidden=!0;else if("loadcheat"==r){if(a.$(".cheat_txt")){let t=await a.runaction("loadCheat");t instanceof Uint8Array?a.$(".cheat_txt").value=(new TextDecoder).decode(t):a.runaction("showMsg",[n.getLang("no cheat can load from local!")])}}else if("applycheat"==r){if(a.$(".cheat_txt")){let t=a.$(".cheat_txt").value||"";if(e.cheatTxt=t,t){let e=a.runaction("applyCheatCode",[t]);e?a.runaction("showMsg",[e+n.getLang("cheat is apply and save!")]):a.runaction("showMsg",[n.getLang("no cheat apply!")])}a.$(".cheat_txt")&&(a.$(".cheat_txt").value=t)}}else if("close"==r)a.$(".gbaemu-startinfo").hidden=!0;else if("gamepad"==r)e.Selectgamepad=i.getAttribute("data-padid");else if("clearkey"==r)localStorage.removeItem("vba-setting"),a.runaction("showMsg",[n.getLang("setting remove but may be restart!")]);else if("applykey"==r){let t=[],e={};a.$$('input[data-act="Keyboard"]').forEach((e=>{t.push(e.value)})),a.$$('input[data-act="gamepad"]').forEach((t=>{e[t.getAttribute("data-padid")]=t.value})),localStorage.setItem("vba-setting",JSON.stringify({keymap:t,gamePadKeyMap:e})),a.runaction("showMsg",[n.getLang("setting is save!")])}else if(!r){let e=i.getAttribute("data-game");if(!e)return;t.active=!0,a.db.rooms.data(e).then((n=>{t.active=!1,i.parentNode.parentNode.remove(),n&&(a.gameID=e,a.loadRoom(n))}))}}}))},addStatusItem(t,e){let a=this.T.$ct("li",e);return t.appendChild(a),a},async addroomItem(t,e,a){let n=this.M,o=n.T;if(a){if(e=o.F.getname(e).replace(/\.\w+$/,"")+".gba",150!=a[178])return;await n.db.rooms.put(e,{contents:a,filesize:a.length,type:"Uint8Array",timestamp:o.date}),a=null}let r=o.$ct("li",`<span>${e}</span><button data-game="${e}">${o.getLang("Run this Game")}</button>`);t.appendChild(r)},async Filemanager(){let t=this.M,e=t.T,a="";t.$(".gbaemu-startinfo").hidden=!1,a+=`<h3>${e.getLang("File Manager")}<button data-act="close">${e.getLang("close")}</button></h3><ul class="dblist">`,await Promise.all(Array.from(e.F.StoreList[e.DB_NAME].objectStoreNames).map((async t=>{let n=await e.getStore(t).keys();n.length>0&&(a+=`<li><h4 data-act="toggleUl">${t} ${e.getLang("toggle")}</h4><ul hidden>`,n.forEach((n=>{let o="";"rooms"==t&&(o=`<button data-act="reRun" data-db="${t}" data-key="${n}">${e.getLang("Run")}</button>`),a+=`<li><span>${n}</span><p>${o}<button data-act="downstore" data-db="${t}" data-key="${n}">${e.getLang("download")}</button><button data-act="removestore" data-db="${t}" data-key="${n}">${e.getLang("remove")}</button></p></li>`})),a+="</ul></li>")}))),a+="</ul>",t.$(".g-lastInfo").innerHTML=a}};gamePadKeyMap={a:1,b:0,l:4,r:5,select:8,start:9,up:12,down:13,left:14,right:15};get gamepadStatus(){var t=this,e=t.T,a=navigator.getGamepads()[0],n={};if(!a)return;let o=t.Selectgamepad;if(e.I.toArr(t.gamePadKeyMap,(t=>{a.buttons[t[1]].pressed&&(n[t[0]]=1)})),o){let e=M.$("input[data-padid="+o+"]");e?Array.from(a.buttons).forEach(((t,a)=>{t.pressed&&(e.value=a)})):delete t.Selectgamepad}return a.axes[0]<-.5?n.left=1:a.axes[0]>.5&&(n.right=1),a.axes[1]<-.5?n.up=1:a.axes[1]>.5&&(n.down=1),n}loadgamepad(t){let e=this.M;e.T;e.runaction("showMsg",["Gamepad "+t.type+":"+t.gamepad.id])}upload(t,e){let a=this.T.$ce("input");a.type="file",e||(a.multiple=!0),a.onchange=e=>{let n=e.target.files;if(n&&n.length>0)return t(n);a.remove()},a.click()}};
var Module=new class{constructor(e,t){let a=e.I;e.DB_NAME="44GBA",e.LibStore="data-libjs",e.DB_STORE_MAP={rooms:{},userdata:{timestamp:!1},"data-libjs":{}},a.defines(this,{T:e,I:a},1),a.defines(e,{Module:this},1),this.JSpath=e.JSpath.split("/").slice(0,-2).join("/")+"/vba/",t&&t.JSpath&&(this.JSpath=t.JSpath),this.version=1,this.runaction=e.runaction,this.db={userdata:e.getStore("userdata"),rooms:e.getStore("rooms"),libjs:e.getStore("data-libjs")},this.fps=60,e.docload((async()=>{this.emuElm=Nttr(e.$(".gbaemu",t)),this.loadCores()}))}$(e){return this.emuElm.$(e)}$$(e){return this.emuElm.$$(e)}Nttr(e){return Nttr(this.$(e))}cheatErroTxt="";print(e){let t=Module,a=t.T;if(t.cheatNowTxt&&"GBA: Warning: Codes seem to be for a different game."==e){let e=t.$(".cheat-result");t.cheatErroTxt+=t.cheatNowTxt,e&&(e.innerHTML=`<h3>${a.getLang("cheat Erro")}</h3>${t.cheatErroTxt}`),t.cheatNowTxt=""}}printErr(e){}async loadCores(){let e=this,t=e.T;e.runaction("setNavMenu"),e.canvas=e.$("canvas"),t.lang=await t.FetchItem({url:e.JSpath+"language/"+t.language+".json?t="+t.time,type:"json"});let a=e.runaction("addloadStatus",`44gba.zip : ${t.getLang("loading...")}`),r=await t.FetchItem({url:e.JSpath+"44gba.zip",store:"data-libjs",key:"vba-core",version:e.version,unpack:!0,process:e=>{a&&(a.innerHTML=`44gba.zip : ${e}`)},packtext:t.getLang("unpack")});a.innerHTML=`44gba.zip : ${t.getLang("Ready!")}`;let i=(new TextDecoder).decode(r["44gba.js"]);i=i.replace("wasmReady()","Module.wasmReady()").replace("writeAudio(","Module.writeAudio(").replace(/var\s?arguments_\s?=\s?\[\];/,'var arguments_ = ["-v"];'),e.wasmBinary=r["44gba.wasm"],r=null,new Function("Module",i)(e)}srmLength=131072;async loadRoom(e){let t=this;t.T;t.isRunning=!1;let a=t.Nttr(".gbaemu-startinfo");a&&(a.hidden=!0),localStorage.setItem("last-game",Module.gameID),t.HEAPU8.set(e,t.romBuffer);t._emuLoadROM(e.length);let r=await t.runaction("loadSRM");return r&&t.wasmSaveBuf.set(r.slice(0,t.srmLength)),t.runaction("clearSaveBufState"),t._emuResetCpu(),t.isRunning=!0,this.looptime||t.emuLoop(),t.runaction("tryInitSound")}async FetchRoom(e){let t=this,a=t.T,r=t.runaction("addloadStatus",`${e} : ${a.getLang("download...")}`),i=await a.FetchItem({url:e,store:t.db.rooms,unpack:!0,process:t=>{r.innerHTML=`${e} : ${t}`}});r.innerHTML=`${e} : ${a.getLang("compelte...")}`,this.reloadRoom(a.F.getname(e),i)}reloadRoom(e,t){if(t instanceof Uint8Array)return this.gameID=e,this.loadRoom(t);if(t){let e=Object.entries(t);for(let t=0;t<e.length;t++)/\.gba/i.test(e[t][0])&&(this.reloadRoom(e[t][0],e[t][1]),this.gameID=e[t][0],this.loadRoom(e[t][1]));e=null}}frameCnt=0;lastCheckedSaveState=0;get fps(){return this.fpslen}set fps(e){this.fpslen=parseInt(e),this.fpspeed=1e3/this.fpslen}get gameID(){return this.GameFullName}set gameID(e){this.GameFullName=e,this.GameName=e.replace(/\.gba$/i,""),this.$(".gba-title")&&(this.$(".gba-title").innerHTML=e)}getVKState(){return this.Controller.VKSTATUS}emuLoop(){let e=this;e.looptime=window.requestAnimationFrame((t=>{e.Frametime=t,e.emuLoop()})),e.runaction("loopFrame",[e.Frametime])}OutputCanvans(){let e=this;e.optScaleMode>=2?e.gl&&e.runaction("gpuDraw"):e.drawContext&&e.drawContext.putImageData(e.idata,0,0,0,0,e.canvas.width,e.canvas.height)}optScaleMode=0;async wasmReady(){let e=this,t=e.T;e.Controller||(e.Controller=new NengeController(e)),e.romBuffer=Module._emuGetSymbol(1),e.SrmPtr=Module._emuGetSymbol(2),e.wasmSaveBuf=Module.HEAPU8.subarray(e.SrmPtr,e.SrmPtr+e.srmLength),e.ImgPtr=Module._emuGetSymbol(3);let a=e.canvas;a.width,a.height;var r=new Uint8ClampedArray(Module.HEAPU8.buffer).subarray(e.ImgPtr,e.ImgPtr+153600);if(e.idata=new ImageData(r,240,160),e.isWasmReady=!0,await e.Controller.runaction("setShader",[e.optScaleMode]),e.StartVBA)return e.Controller.runaction("setInfoEvent",[e.Nttr(".g-lastInfo")]),e.StartVBA();e.$(".welcome").remove(),delete e.wasmBinary,e.$(".infotips")&&(e.$(".infotips").innerHTML=t.getLang("This site is not associated with Nintendo in any way.Import your Homemade games. enter 'ESC' show Menu when you running!")),e.Controller.runaction("StartInfo")}writeAudio(e,t){let a=this;a.T;if(a.audioContext){a.wasmAudioBuf||(a.wasmAudioBuf=new Int16Array(a.HEAPU8.buffer).subarray(e/2,e/2+2048));var r=(a.audioFifoHead+a.audioFifoCnt)%a.audioFifo0.length;if(!(a.audioFifoCnt+t>=a.audioFifo0.length)){for(var i=0;i<t;i++)a.audioFifo0[r]=a.wasmAudioBuf[2*i],a.audioFifo1[r]=a.wasmAudioBuf[2*i+1],r=(r+1)%a.audioFifo0.length;a.audioFifoCnt+=t}}}get AUDIO_BLOCK_SIZE(){return 1024}imgList={};action={loopFrame(e){let t=this,a=(t.T,t.fpspeed);if(t.isRunning){if(t.frameCnt++,t.frameCnt%60==0&&t.runaction("checkSaveBufState"),"hidden"==document.visibilityState&&(a=1e3/60),e){if(e>0){if(t.costFrame=(e-t.nowFrame)/a,t.costFrame<=.8)return;let i=Math.round(t.costFrame);t.costFrame=0,i>4&&(i=4),t.nowFrame=e;for(var r=0;r<i;r++)t.runaction("callFrame")}}else{if(t.costFrame)return;t.runaction("callFrame")}t.OutputCanvans()}return!0},callFrame(){this._emuRunFrame(this.getVKState())},addloadStatus(e){let t=this.T,a=this.$(".welcome");if(a){let r=t.$ct("div",e);return a.appendChild(r),r}},showMsg(e,t){let a=this,r=a.Nttr(".g-showtxt");r.html(e),r.active=!0,null!=a.msgTime&&clearTimeout(a.msgTime),a.msgTime=setTimeout((()=>{r.active=!1}),t||2e3)},checkSaveBufState(){let e=this;e.T;if(e.isRunning){var t=e._emuUpdateSavChangeFlag();1==e.lastCheckedSaveState&&0==t&&e.runaction("saveSRM"),e.lastCheckedSaveState=t}},async saveSRM(){let e=this,t=e.T,a=e.GameName;e.runaction("showMsg",[t.getLang("Auto saving, please wait..."),8e4]),e.canvas.toBlob((async r=>{await e.db.userdata.put("/userdata/screenshots/"+a+".png",{contents:new Uint8Array(await r.arrayBuffer()),mode:33206,timestamp:t.date})})),await e.db.userdata.put("/userdata/saves/"+a+".srm",{contents:new Uint8Array(e.wasmSaveBuf),mode:33206,timestamp:t.date}),e.runaction("showMsg",[t.getLang("saves file is ok"),1e3])},async loadSRM(e){let t=this,a=t.T;if(!e)return await t.db.userdata.data("/userdata/saves/"+t.GameName+".srm");t.isRunning=!1,t.wasmSaveBuf.set(e.slice(0,t.srmLength)),t.runaction("clearSaveBufState"),t._emuResetCpu(),t.runaction("showMsg",[a.getLang("this saves is temp to load.<br>the local saves is not change!"),5e3]),t.isRunning=!0},async exportSrm(){let e=this,t=e.GameName+".srm",a=await e.db.userdata.data("/userdata/saves/"+t);a?e.T.down(t,a):e.runaction("showMsg",[e.T.getLang("no saves file!")]),a=null},async loadCheat(){return await this.db.userdata.data(`/userdata/cheats/VBA Next/${this.GameName}.cheat`)},async saveCheat(e){let t=this,a=t.T;"string"==typeof e&&(e=(new TextEncoder).encode(e)),t.db.userdata.put("/userdata/cheats/VBA Next/"+t.GameName+".cheat",{contents:e,mode:33206,timestamp:a.date})},clearSaveBufState(){this.lastCheckedSaveState=0,this._emuUpdateSavChangeFlag()},gpuDraw(){if(!this.gl)return;let e=this,t=e.canvas,a=e.gl;a.texImage2D(a.TEXTURE_2D,0,a.RGBA,a.RGBA,a.UNSIGNED_BYTE,e.idata),a.viewport(0,0,t.width,t.height),a.uniform2f(e.outResolutionUniformLocation,t.width,t.height),a.drawArrays(a.TRIANGLES,0,6)},async gpuInit(){if(this.gl)return;let e=this,t=e.T,a=e.canvas,r=a.width,i=a.height,o=a.getContext("webgl");var n=window.devicePixelRatio||1;let s=a.getBoundingClientRect();if(a.width=s.width*n,a.height=s.width/1.5*n,!o)return void(e.optScaleMode=0);let u=await t.FetchItem({url:e.JSpath+"gl_shader.zip",store:"data-libjs",key:"vba-glshader",version:e.version,unpack:!0});o.viewport(0,0,r,i);var l=o.createProgram(),d=o.createShader(o.VERTEX_SHADER),m=o.createShader(o.FRAGMENT_SHADER);if(o.shaderSource(d,(new TextDecoder).decode(u["vert.shader"])),o.shaderSource(m,(new TextDecoder).decode(u["frag.shader"])),o.compileShader(d),o.compileShader(m),o.getShaderParameter(d,o.COMPILE_STATUS))if(o.getShaderParameter(m,o.COMPILE_STATUS))if(o.attachShader(l,d),o.attachShader(l,m),o.linkProgram(l),o.getProgramParameter(l,o.LINK_STATUS)){o.useProgram(l);var h=o.createTexture();o.bindTexture(o.TEXTURE_2D,h),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_WRAP_S,o.CLAMP_TO_EDGE),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_WRAP_T,o.CLAMP_TO_EDGE),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MIN_FILTER,o.NEAREST),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MAG_FILTER,o.NEAREST);var c=new Float32Array([0,0,1,0,0,1,0,1,1,0,1,1]),g=o.createBuffer();o.bindBuffer(o.ARRAY_BUFFER,g),o.bufferData(o.ARRAY_BUFFER,c,o.STATIC_DRAW);var f=o.getAttribLocation(l,"a_position");o.enableVertexAttribArray(f),o.vertexAttribPointer(f,2,o.FLOAT,!1,0,0),e.outResolutionUniformLocation=o.getUniformLocation(l,"u_outResolution");var p=o.getUniformLocation(l,"u_inResolution");o.uniform2f(p,r,i),this.gl=o}else alert("Error in program: "+o.getProgramInfoLog(l));else alert("Error in fragment shader: "+o.getShaderInfoLog(m));else alert("Error in vertex shader: "+o.getShaderInfoLog(d))},tryInitSound(){let e=this,t=e.audioContext;if(t)return void("running"!=t.state&&t.resume());e.audioFifo0=new Int16Array(4900),e.audioFifo1=new Int16Array(4900),e.audioFifoHead=0,e.audioFifoCnt=0,e.audioContext=new(window.AudioContext||window.webkitAudioContext)({latencyHint:1e-4,sampleRate:48e3});let a=e.audioContext.createScriptProcessor(e.AUDIO_BLOCK_SIZE,0,2);a.onaudioprocess=t=>e.runaction("processAudio",[t]),a.connect(e.audioContext.destination),e.audioContext.resume()},processAudio(e){let t=this;var a=e.outputBuffer,r=a.getChannelData(0),i=a.getChannelData(1);if(!t.isRunning){for(var o=0;o<t.AUDIO_BLOCK_SIZE;o++)r[o]=0,i[o]=0;return}if(t.costFrame)return;for(;t.audioFifoCnt<t.AUDIO_BLOCK_SIZE;)t.runaction("loopFrame");let n=t.AUDIO_BLOCK_SIZE;t.audioFifoCnt<n&&(n=t.audioFifoCnt);for(o=0;o<n;o++)r[o]=t.audioFifo0[t.audioFifoHead]/32768,i[o]=t.audioFifo1[t.audioFifoHead]/32768,t.audioFifoHead=(t.audioFifoHead+1)%t.audioFifo0.length,t.audioFifoCnt--},resetCheat(){let e=this;e.T;if(e.cheatAddList){var t=e._emuGetSymbol(4);e.HEAPU8.set(new Uint8Array(Array(4096).fill(0)),t),e.cheatAddList.forEach((t=>e._emuAddCheat(t)))}},applyCheatCode(e){let t=this;t.T;var a=t._emuGetSymbol(4),r=t.HEAPU8.subarray(a,a+4096),i=e.split("\n");new TextEncoder;t.cheatNowTxt="";let o=0;for(var n=0;n<i.length;n++){var s=i[n].trim().replace(/\:/g," ").replace(/([0-9A-F]{8})([0-9A-F]{8})/gi,"$1 $2").replace(/([0-9A-F]{8})([0-9A-F]{4})/gi,"$1 $2");if(0==s.length||/(#|-|\!)/.test(s.charAt(0)))continue;let e=s.split(/\s/);for(let i=0;i<e.length;){let n=e[i],s=e[i+1];if(i+=2,n&&s&&8==n.length&&(4==s.length||8==s.length)){4==s.length&&(n=n.replace(/^02/,"82"));let e=`${n} ${s}\0`;t.cheatNowTxt+=e.replace("\0","<br>");let i=(new TextEncoder).encode(e);r.set(i,0),t._emuAddCheat(a+0),t.cheatNowTxt="",o++}}}return t.runaction("saveCheat",[e]),o},setNavMenu(){let e=this,t=e.T,a=e.Nttr(".gba-menubtn");a&&a.click((t=>{let r=a.active;a.active=!r,e.emuElm.active=!r}));let r=e.Nttr(".gba-downbtn");r&&r.click((a=>{e.gameID&&t.down(e.gameID,e.db.rooms.data(e.gameID))}))}};upload(e,t){let a=this.T.$ce("input");a.type="file",t||(a.multiple=!0),a.onchange=t=>{let r=t.target.files;if(r&&r.length>0)return e(r);a.remove()},a.click()}}(Nenge);