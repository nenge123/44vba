class NengeController{
    constructor(T){
        let C=this,I = T.I,Module=T.Module;
        I.defines(this,{T,I,Module},1);
        Module.canvas&&(Module.canvas.hidden = false);
        this.runaction = T.runaction;;
        this.runaction('BulidButton');
        ['keydown','keyup'].forEach(v=>{
            T.on(document,v,e=>{
                let type = e.type;
                if(C.keymap.includes(e.code)){
                    let index = C.keymap.indexOf(e.code);
                    if(type == 'keydown'){
                        C.VKDATA[C.keyList[index]]=1;    
                    }else{
                        delete C.VKDATA[C.keyList[index]];
                    }
                    return T.stopProp(e);
                }else if(type=='keyup'&&e.code=='Escape'&&Module.isRunning){
                    T.$('.g-info').hidden = true;
                    Nttr('.game-controller .g-menu').click();
                    return T.stopProp(e);
                }

            },false);
        });
        ["gamepadconnected","gamepaddisconnected"].forEach(v=>T.on(window,v,e=>{
            this.loadgamepad(e);
        }));
        T.on(document,'visibilitychange',e=>{
            console.log(document.visibilityState);
        });
        let config = localStorage.getItem('vba-setting');
        if(config){
            config = JSON.parse(config);
            C.keymap = config.keymap;
            C.gamePadKeyMap = config.gamePadKeyMap;
        }
        //T.on(window, 'resize', () => this.runaction('ReSizeCanvas'));
    }
    button = {
        'a':{
            key:1,
            name:'A',
            pos:'xyab'
        },
        'b':{
            key:0,
            name:'B',
            pos:'xyab'
        },
        'x':{
            key:3,
            name:'X',
            pos:'xyab'
        },
        'y':{
            key:2,
            name:'Y',
            pos:'xyab'
        },
        'up':{
            key:12,
            name:'↑',
            pos:'dp',
            class:'up'
        },
        'down':{
            key:13,
            name:'↓',
            pos:'dp',
            class:'down'
        },
        'left':{
            key:14,
            name:'←',
            pos:'dp',
            class:'left'
        },
        'right':{
            key:15,
            name:'→',
            pos:'dp',
            class:'right'
        },
        'select':{
            key:8,
            name:'SELETC',
            pos:'left',
            class:'select'
        },
        'start':{
            key:9,
            name:'START',
            pos:'right',
            class:'start'
        },
        'l':{
            key:4,
            name:'L',
            pos:'left',
            class:'l'
        },
        'r':{
            key:5,
            name:'R',
            pos:'right',
            class:'r'
        }
    }
    //keymap = [88, 90, 16, 13, 39, 37, 38, 40, 87, 81];
    keyList = ["a", "b", "select", "start", "right", "left", 'up', 'down', 'r', 'l'];
    keymap = ['KeyZ','KeyX', 'ShiftRight', 'Enter', 'ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'KeyW', 'KeyQ'];
    get VKSTATUS(){
        let C = this, ret = 0;
        for (var i = 0; i < 10; i++) {
            ret = ret | (C.GETKEY(i) << i);
        }
        return ret;
    }
    GETKEY(i){
        let C=this,VKDATA = C.VKDATA;
        let gamepad = C.gamepadStatus;
        if(gamepad)VKDATA = Object.assign({},VKDATA,gamepad);
        //if(typeof VKDATA[i] !='undefined') return VKDATA[i]||0;
        return VKDATA[C.keyList[i]]||0;
    }
    VKDATA = {};
    MenuList = {
        'fps60':'set fps 60',
        'exportSrm':'Export SRM',
        'importSrm':'Import SRM',
        'opencheat':'use cheat',
        'Filemanager':'File Manager',
        'keysetting':'Key setting',
    }
    action = {
        BulidButton(){
            let C=this,T=C.T,I=C.I,Module = T.Module,BtnContent = Nttr('.game-controller'),leftContent = BtnContent.$('.g-left'),RightContent = BtnContent.$('.g-right'),lefthtml="",righthtml="";
            I.toArr(C.button,entry=>{
                let [btn,info] = entry;
                if(info.pos=='left'){
                    lefthtml += C.runaction('getButton',['left',btn]);
                }
                if(info.pos=='right'){
                    righthtml +=  C.runaction('getButton',['right',btn]);
                }
            });
            lefthtml +='<button type="button" class="g-menu">Menu</button>';
            lefthtml +='<div class="g-dp">'+C.runaction('getArrow')+'</div>';
            righthtml +='<div class="g-dp">'+C.runaction('getXYAB')+'</div>';
            leftContent.innerHTML=lefthtml;
            RightContent.innerHTML = righthtml;
            let touchlist = [];
            T.stopGesture(BtnContent.obj);
            T.stopGesture(Module.canvas);
            BtnContent.on('contextmenu', e => T.stopProp(e));
            ['touchstart', 'touchmove', 'touchend', 'touchcancel'].forEach(
                evt => {
                    BtnContent.on(evt, e => {
                        let newlist = [];
                        Module.runaction('tryInitSound');
                        if (e.type == 'touchstart') {
                            newlist = touchlist.concat(C.runaction('getButtonKey',[e.target]));
                        } else if (e.touches) {
                            if (e.touches.length) {
                                newlist = Array.from(e.touches).map(entry => C.runaction('getButtonKey',[document.elementFromPoint(entry.pageX, entry.pageY)]));
                            }
                        }
                        if (newlist.length > 0) {
                            newlist = newlist.join(',').split(',');
                        }
                        if (newlist.join() != touchlist) {
                            C.runaction('sendInputKey',[touchlist,newlist]);
                            //Module.inputUp(touchlist);
                            //Module.inputDown(newlist);
                            touchlist = newlist;
                            //console.log(touchlist);
                        }
                        T.stopEvent(e);
                    }, {
                        passive: false
                    });
                }
            );
            let menulist = Nttr('.game-controller .g-menulist'),menubtn = Nttr('.game-controller .g-menu');
            menubtn.click(e=>{
                let active = menulist.hidden;
                menubtn.active = active;
                menulist.hidden = !active;
                if(e.stopPropagation)return e.stopPropagation();
            },'pointerup',{passive:false});
            C.runaction('BulidMenu',[menulist]);
            //Nttr('.game-controller')
            //400x400
        },
        CallMenu(elm){

        },
        BulidMenu(menulist){
            let C=this,T=C.T,I=C.I,Module = T.Module,
                html=`<h3>FPS:<span class="g-status">${Module.fps}</span></h3><label><input class="g-fps" type="range" min="29" max="180" value="${Module.fps}"></label><ul>`;
            I.toArr(C.MenuList,entry=>{
                html += `<li><button type="button" class="g-btn g-blue" data-act="${entry[0]}">${T.getLang(entry[1])}</button>`;
            });
            html+='</li></ul>';
            html+=`<h3>${T.getLang('shader mode')}</h3><ul>`;
            ['Pixelated','Smooth','XBRZ'].forEach(
                (v,i)=>{
                    html += `<li><button type="button" class="g-btn g-blue" data-act="setShader" data-value="${i}">${T.getLang(v)}</button>`;
                }
            )
            html+='</ul>';
            menulist.html(html);
            Nttr(menulist.$('.g-fps')).on('change',e=>{
                let inp = e.target,v=inp.value;
                menulist.$('.g-status').innerHTML = v;
                Module.fps = parseInt(v);
            });
            ['touchstart', 'touchmove', 'touchend', 'touchcancel'].forEach(v=>Nttr(menulist.$('.g-fps')).on(v,e=>{
                e.stopPropagation();
            },{
                passive: true
            }));
            menulist.click(e=>{
                let elm = e.target;
                if(elm instanceof Element){
                    let act = elm.getAttribute('data-act');
                    if(act){
                        C.runaction(act,[elm,menulist]);
                        Nttr('.game-controller .g-menu').click();
                        return T.stopProp(e);
                    }
                }
            });
        },
        fps60(elm,menulist){
            menulist.$('.g-fps').value = 60;
            menulist.$('.g-status').innerHTML = 60;
            this.Module.fps = 60;
        },
        async replaceCanvas(str){
            let C=this,M=C.Module,newcanvas = M.T.$ce('canvas');
            newcanvas.id = Module.canvas.id;
            newcanvas.width = 240;
            newcanvas.height = 160;
            let old = Module.canvas.parentNode.replaceChild(
                newcanvas,Module.canvas
            );
            M.drawContext = null;
            M.gl = null;
            M.canvas = newcanvas;
            if(str=='2d'){
                M.drawContext = M.canvas.getContext('2d');}
            else await M.runaction('gpuInit');
            old.remove();
            return Module.canvas;
            
        },
        async setShader(elm){
            let C=this,M = C.Module,canvas = M.canvas;
            let optScaleMode = elm instanceof Element? parseInt(elm.getAttribute('data-value')):elm;
            if(M.optScaleMode!==optScaleMode){
                if(optScaleMode>=2&&M.optScaleMode<2){
                    canvas = await C.runaction('replaceCanvas',['3d']);
                }else if(optScaleMode<2&&M.optScaleMode>=2){
                    canvas = await C.runaction('replaceCanvas',['2d']);
                }
            }else{
                if(optScaleMode>=2){
                    await await M.runaction('gpuInit');
                }else{
                    M.drawContext = M.canvas.getContext('2d');
                }
            }
            M.optScaleMode = optScaleMode;
            canvas.style.removeProperty('image-rendering');
            console.log(optScaleMode);
            if(M.optScaleMode==0){
                canvas.style.imageRendering = 'pixelated';
            }
        },
        async exportSrm(){
            let name = this.Module.gameID.replace(/\.gba$/,'.srm');
            this.T.down(name,await this.Module.db.userdata.data("/userdata/saves/"+name));
        },
        importSrm(){
            let C=this,T=C.T,I=C.I,M = T.Module;
            C.upload(files=>{
                Array.from(files).forEach(async file=>{
                    let u8 = new Uint8Array(await file.arrayBuffer());
                    clearInterval(M.loopTime);
                    M.wasmSaveBuf.set(u8.slice(0,131072));
                    M.runaction('clearSaveBufState');
                    M._emuResetCpu();
                    M.emuLoop();
                    M.runaction('showMsg',[T.getLang('this saves is temp to load.<br>the local saves is not change!'),5000]);

                });
            },1)
        },
        async opencheat(){
            let C=this,M=C.Module,T=M.T,html="";
            T.$('.g-info').hidden = false;
            if(C.cheatTxt==undefined)C.cheatTxt = new TextDecoder().decode(await M.db.userdata.get("/userdata/cheats/VBA Next/"+M.gameID.replace(/\.gba$/,'.cheat')));
            html +=`<p><textarea class="cheat_txt">${C.cheatTxt||""}</textarea></p><p>Cheat code:\nGameshark: XXXXXXXXYYYYYYYY\nAction Replay: XXXXXXXX YYYY</p><p><button data-act="applycheat">${T.getLang('apply cheat')}</button> <button data-act="loadcheat">${T.getLang('load cheat')}</button> <button data-act="close">${T.getLang('close')}</button></p>`;
            T.$('.g-lastInfo').innerHTML = html;

        },
        async keysetting(){
            let C=this,M=C.Module,T=M.T,html="";
            T.$('.g-info').hidden = false;
            html +=`<table class="g-keysetting"><tr><td>${T.getLang('keyname')}</td><td>${T.getLang('Keyboard')}</td><td>${T.getLang('gamepad')}</td></tr>`;
            C.keyList.forEach((v,index)=>{
                html+=`<tr><th>${v}</th><td><input type="text" data-act="Keyboard" value="${C.keymap[index]}"></td><td><input type="text" data-act="gamepad" data-padid="${v}" value="${C.gamePadKeyMap[v]}"></td></tr>`;
            });
            html+=`</table><p><button data-act="applykey">${T.getLang('apply setting')}</button><button data-act="clearkey">${T.getLang('clear setting')}</button><button data-act="close">${T.getLang('close')}</button></p>`;
            T.$('.g-lastInfo').innerHTML = html;
        },
        sendInputKey(touchlist,newlist){
            let C=this,T=C.T,I=C.I,Module = T.Module;
            touchlist = touchlist.filter(v=>v&&!newlist.includes(v));
            newlist = newlist.filter(v=>v);
            /*
            if(!C.keyMap){
                let retroarchcfg = new TextDecoder().decode(Module.FS.readFile(Module.configPath));
                C.keyMap = {};
                retroarchcfg.split('\n').forEach(v=>{
                    let arr = v.match(/^(\w+)\s=\s("|')?(.+?)("|')?$/);
                    if(arr&&arr[1]&&arr[3]){
                    C.keyMap[arr[1]] = arr[3]=="false"?false:arr[3]=='true'?true:isNaN(arr[3])?arr[3]:parseInt(arr[3]);

                    }
                });
                //console.log(C.keyMap);
            }
            */
            //touchlist = touchlist.map(v=>C.keyMap[C.button[v].key]);
            //newlist = newlist.map(v=>C.keyMap[C.button[v].key]);
            //touchlist = touchlist.map(v=>C.button[v].key);
            //newlist = newlist.map(v=>C.button[v].key);
            C.runaction('EnterKey',[touchlist,false]);
            C.runaction('EnterKey',[newlist,true]);
            //console.log(touchlist,1,newlist);
            
        },
        EnterKey(keylist,type){
            let C=this,T=C.T,I=C.I,Module = T.Module;
            keylist.forEach(
                    v=>{
                        if(type){
                            C.VKDATA[v] = 1;    
                        }else{
                            delete C.VKDATA[v];
                        }
                    }
                );
            return ;
            keylist.forEach(
                v=>C.runaction('keyEvent',[type||false,{code:C.Reflect[v],key:v}])
            )
        },
        keyEvent(type,edata){
            document.dispatchEvent(new KeyboardEvent(type ? 'keydown' : 'keyup', edata));
        },
        getButtonKey(elm){
            let C=this,T=C.T,I=C.I;
            if (I.elment(elm)) {
                let key = elm.getAttribute('data-key');
                if (key) {
                    return key;
                }
            }
            return '';
        },
        getArrow(){
            let C =this,html="";
            ['up,left','up','up,right','left','','right','down,left','down','down,right'].forEach(
                (v,index)=>{
                    html += C.runaction('getButton',['left',v]);
                }
            );
            return html;
        },
        getXYAB(){
            let C =this,html="";
            ['x','y','a','b'].forEach(
                (v,index)=>{
                    html += C.runaction('getButton',['right',v]);
                }
            );
            return html;
        },
        getButton(pos,btn){
            let C = this,info = C.button[btn],btn2=btn;
            if(!info){
                if(pos=='right') return;
                btn2='';
                info ={};
            }
            return  `<button type="button" data-key="${btn}" class="key-${pos}-${btn2||'null'} ${(info.class?'key-'+info.class:'')}" style="${(info.style?info.style:'')}">${(info.name||"")}</button>`;
        },
        ReSizeCtrl(opt,height){
            let width = height/this.AspectRatio;
            console.log(width,height);
        },
        ReSizeCanvas(wh){
            let C = this,T=C.T,I=C.I,Module = C.Module;  
            if (wh) {
                [C.width, C.height] = wh.map(v=>parseInt(v));
                C.AspectRatio = C.width / C.height;
            }
            let opt = Nttr('.g-game-ui').getBoundingClientRect(),QualityHeight = C.Quality||720,AspectRatio = opt.width / opt.height;
            if(I.mobile){
                if(C.AspectRatio){
                    if (typeof window.orientation != "undefined" && window.orientation != 0) {
                        Nttr('.game-controller').css = "";
                    }else{
                        AspectRatio = C.AspectRatio;
                        let mt=0,h=opt.height - opt.width/AspectRatio-20,height = Math.min(h,400);
                        if(h-50>height){
                            mt = h-50-height;
                        }
                        Nttr('.game-controller').css = 'height:'+height+'px;margin-top:'+mt+'px';
                    }
                    Module.setCanvasSize(QualityHeight*AspectRatio,QualityHeight);
                    C.runaction('ReSizeCtrl',[opt,Module.canvas.getBoundingClientRect().height]);
                }
            }else{
                let p = opt.height > QualityHeight ? opt.height:QualityHeight;
                Module.setCanvasSize(p*AspectRatio,p);
            }
        },
             
        async StartInfo(){
            let C=this,M=C.Module,T=M.T,lastgame = localStorage.getItem('last-game'),elm =Nttr('.g-lastInfo'),html="";
            if(lastgame){
                let img = await M.db.userdata.data("/userdata/screenshots/"+lastgame.replace(/\.gba/,'.png'));
                if(img)M.imgList[lastgame] = T.F.URL(img,{type:'image/png'});
                html +=`<h3>${T.getLang('last play')}</h3><div><p>${lastgame}</p><p><button data-game="${lastgame}">${T.getLang('Run this Game')}</button></p>${(M.imgList[lastgame]?`<p><img src="${M.imgList[lastgame]}" width="240"></p>`:'')}</div>`;
            }
            C.runaction('StartFromFile',[elm,html]);
        },
        async ShowSRM(){
            let C=this,M=C.Module,T=M.T,html="";
            let list = await M.db.userdata.keys();
            list.forEach(async entry=>{
                let [key,data]= entry;
                if(/\.srm$/.test(key)){
                    let keyname=T.F.getname(key),imgname = "/userdata/screenshots/"+keyname.replace('.srm','.png');
                    if(list.includes(imgname)){
                        if( M.imgList[key])T.F.removeURL(M.imgList[key]);
                        M.imgList[key] = T.F.URL(await M.db.userdata.data(imgname),{type:'image/png'});
                    }
                    html+=`<li><span>${keyname}</span><p><button data-act="loadSrm" data-path="${key}">${T.getLang('load saves')}</button><button data-act="removeSRM" data-path="${key}">${T.getLang('remove saves')}</button></p>${(M.imgList[key]?`<p><img src="${M.imgList[key]}"  width="240"></p>`:'')}</li>`;
                }
            });
            if(html){
                html = `<ul>${html}</ul>`;
            }
            return ;
        },
        async getRoomsList(){
            let C=this,M=C.Module,T=M.T;
            let list = await  M.db.rooms.keys(),html="";
            html =`<h3>${T.getLang('Cache Game File')}<button data-act="upload">${T.getLang('Import Game File')}</button></h3><ul class="game-result">`;
            if(list&&list.length>0){
                list.forEach(key=>{
                    html+=`<li><span>${key}</span><p><button data-game="${key}">${T.getLang('Run this Game')}</button><button data-act="remove" data-game="${key}">${T.getLang('remove Game')}</button></p></li>`;
                });
            }
            html+='</ul>';
            return html;
        },
        async StartFromFile(elm,html){
            let C=this,M=C.Module,T=M.T;
            html = html||"";
            html+= await C.runaction('getRoomsList');
            elm.html(html);
            //阻止键盘事件冒泡
            ['keyup','keydown','keypress','wheel'].forEach(v=>elm.on(v,e=>{
                if(e.target instanceof Element){
                    if(e.target.getAttribute('data-act')=='Keyboard'){
                        e.target.value = e.code;
                    }
                }
                e.stopPropagation();
            },{passive:false}));
            console.log(elm);
            let result = elm.$('.game-result');
            elm.click(async e=>{
                if(elm.active) return;
                let obj = e.target;
                if(obj instanceof Element){
                    let act = obj.getAttribute('data-act');
                    if(act=='upload'){
                        C.upload(async files=>{
                            await Promise.all(Array.from(files).map(async file=>{
                                let u8 = new Uint8Array(await file.arrayBuffer()) ,filename = file.name;
                                u8 = await T.unFile(u8);
                                if(u8 instanceof Uint8Array){
                                    C.runaction('addroomItem',[result,filename,u8])
                                }else{
                                    T.I.toArr(u8,entry=>{
                                        C.runaction('addroomItem',[result,entry[0],entry[1]]);
                                    });
                                }
                                u8=null;
                            }))
                        });
                    }else if(act=="remove"){
                        if(obj.getAttribute('data-game'))M.db.rooms.remove(obj.getAttribute('data-game'));
                        if(obj.getAttribute('data-path'))M.db.userdata.remove(obj.getAttribute('data-path'));
                        if(obj.getAttribute('data-js'))M.db.libjs.remove(obj.getAttribute('data-js'));
                        obj.parentNode.parentNode.remove();
                    }else if(act=="downstore"){
                        let dbname = obj.getAttribute('data-db'),key = obj.getAttribute('data-key');
                        if(dbname==M.db.libjs.table)return M.runaction('showMsg',[T.getLang('this data cant download!')]);
                        T.down(T.F.getname(key),await T.getStore(dbname).data(key));
                    }else if(act =="reRun"){
                        let dbname = obj.getAttribute('data-db'),key = obj.getAttribute('data-key');
                        M.reloadRoom(key,await T.getStore(dbname).data(key));
                    }else if(act=="removestore"){
                        let dbname = obj.getAttribute('data-db');
                        if(dbname==M.db.libjs.table)return alert(T.getLang('this data cant download!'));
                        T.getStore(dbname).remove(obj.getAttribute('data-key'));
                        obj.parentNode.parentNode.remove();
                    }else if(act=="toggleUl"){
                        let next = obj.nextElementSibling;
                        next.hidden = !next.hidden;
                    }else if(act=="close"){
                        T.$('.g-info').hidden = true;
                    }else if(act=="loadcheat"){
                        if(T.$('.cheat_txt')){
                            let cheat = await M.db.userdata.data("/userdata/cheats/VBA Next/"+M.gameID.replace(/\.gba$/,'.cheat'));
                            if(cheat instanceof Uint8Array)T.$('.cheat_txt').value = new TextDecoder().decode(cheat);
                            else M.runaction('showMsg',[T.getLang('no cheat can load from local!')]);
                        }
                    }else if(act=="applycheat"){
                        if(T.$('.cheat_txt')){
                            let value = C.runaction('filterCheatCode',[T.$('.cheat_txt').value||""]);
                            C.cheatTxt = value;
                            if(value){                                
                                M.runaction('applyCheatCode',[value]);
                                M.runaction('showMsg',[T.getLang('cheat is apply and save!')]);
                            }
                            if(T.$('.cheat_txt'))T.$('.cheat_txt').value = value;
                        }
                    }else if(act=="close"){
                        T.$('.g-info').hidden = true;
                    }else if(act=="gamepad"){
                        C.Selectgamepad = obj.getAttribute('data-padid');
                        console.log(C.Selectgamepad);
                    }else if(act=="clearkey"){
                        localStorage.removeItem('vba-setting');
                        M.runaction('showMsg',[T.getLang('setting remove but may be restart!')]);
                    }else if(act=="applykey"){
                        let keymap = [],gamePadKeyMap={};
                        T.$$('input[data-act="Keyboard"]').forEach(v=>{
                            keymap.push(v.value);
                        });
                        
                        T.$$('input[data-act="gamepad"]').forEach(v=>{
                            gamePadKeyMap[v.getAttribute('data-padid')] = v.value;
                        });
                        localStorage.setItem('vba-setting',JSON.stringify({keymap,gamePadKeyMap}));
                        M.runaction('showMsg',[T.getLang('setting is save!')]);

                    }else if(!act){
                        let gamename = obj.getAttribute('data-game');
                        if(!gamename)return;
                        elm.active = true;
                        M.db.rooms.data(gamename).then(buf=>{
                            elm.active = false;
                            obj.parentNode.parentNode.remove();
                            if(buf){
                                M.gameID = gamename;
                                M.loadRoom(buf);
                            }
                        });

                    }
                }
            });
        },

        async addroomItem(elm,filename,contents){
            let C=this,M=C.Module,T=M.T,html="";
            if(contents){
                filename = T.F.getname(filename).replace(/\.\w+$/,'')+'.gba';
                if (contents[0xB2] != 0x96) {
                    return;
                }
                await M.db.rooms.put(filename,{
                    contents,
                    filesize:contents.length,
                    type:'Uint8Array',
                    'timestamp':T.date
                });
                contents = null;
            }
            let li = T.$ct('li',`<span>${filename}</span><button data-game="${filename}">${T.getLang('Run this Game')}</button>`);
            console.log(elm,li);
            elm.appendChild(li);
        },
        async Filemanager(){
            let C=this,M=C.Module,T=M.T,html="";
            T.$('.g-info').hidden = false;
            html +=`<h3>${T.getLang('File Manager')}<button data-act="close">${T.getLang('close')}</button></h3><ul class="dblist">`;
            await Promise.all(Array.from(T.F.StoreList[T.DB_NAME].objectStoreNames).map(async dbname=>{
                let list = await T.getStore(dbname).keys();
                if(list.length>0){
                    html+=`<li><h4 data-act="toggleUl">${dbname} ${T.getLang('toggle')}</h4><ul hidden>`;
                    list.forEach(key=>{
                        let r = "";
                        if(dbname=='rooms'){
                            r = `<button data-act="reRun" data-db="${dbname}" data-key="${key}">${T.getLang('Run')}</button>`;
                        }
                        html+=`<li><span>${key}</span><p>${r}<button data-act="downstore" data-db="${dbname}" data-key="${key}">${T.getLang('download')}</button><button data-act="removestore" data-db="${dbname}" data-key="${key}">${T.getLang('remove')}</button></p></li>`;
                    });
                    html+='</ul></li>';
                }
            }));
            html+='</ul>';
            T.$('.g-lastInfo').innerHTML = html;
        },
        filterCheatCode(code) {
            var lines = code.split('\n')
            var ret = ''
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i].trim().replace(/ /g, '')
                if ((line.length != 16) && (line.length != 12)) {
                    continue
                }
                // Check if it's a hex string
                if (line.match(/[^0-9A-F]/)) {
                    continue
                }
                ret += line + '\n'
            }
            return ret
        }
    };
    gamePadKeyMap = {
        a: 1,
        b: 0,
        //x: 3,
        //y: 2,
        l: 4,
        r: 5,
        'select': 8,
        'start': 9,
        'up': 12,
        'down': 13,
        'left': 14,
        'right': 15
    };
    get gamepadStatus(){
        var C=this,T=C.T,gamepad = navigator.getGamepads()[0],keyState={};
        if(!gamepad) return;
        let id = C.Selectgamepad;
        T.I.toArr(C.gamePadKeyMap,entry=>{
            if(gamepad.buttons[entry[1]].pressed){
                keyState[entry[0]] = 1;
            }
        });
        if(id){
            let elm = T.$('input[data-padid='+id+']');
            if(elm){
                
            Array.from(gamepad.buttons).forEach((entry,index)=>{
                if(entry.pressed){
                    elm.value = index;
                }
            });
            }else{
                delete C.Selectgamepad;
            }
        }
        // Axes
        if (gamepad.axes[0] < -0.5) {
            keyState['left'] = 1;
        } else if (gamepad.axes[0] > 0.5) {
            keyState['right'] = 1;
        }
        if (gamepad.axes[1] < -0.5) {
            keyState['up'] = 1;
        } else if (gamepad.axes[1] > 0.5) {
            keyState['down'] = 1;
        }

        return keyState;
    }
    loadgamepad(e){
        let C=this,M=C.Module,T=M.T,html="";
        M.runaction('showMsg',['Gamepad '+e.type+':'+e.gamepad.id]);
        console.log(
            "Gamepad connected at index %d: %s. %d buttons, %d axes.",
            e.gamepad.index, e.gamepad.id,
            e.gamepad.buttons.length, e.gamepad.axes.length
        );    
    }
    upload(func,bool){
        let input = this.T.$ce('input');
        input.type = 'file';
        if(!bool)input.multiple = true;
        input.onchange = e => {
            let files = e.target.files;
            if (files && files.length > 0) {
                return func(files);
            }
            input.remove();
        };
        input.click();
    }
}