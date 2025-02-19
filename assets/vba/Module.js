var Module = new class {
    constructor(T,elm) {
        let I = T.I;
        T.DB_NAME = '44GBA';
        T.LibStore = 'data-libjs';
        T.DB_STORE_MAP = {
            'rooms': {},
            //'info': {},
            'userdata': { 'timestamp': false },
            'data-libjs': {},
        };
        I.defines(this, { T, I }, 1);
        this.JSpath = T.JSpath.split('/').slice(0, -2).join('/') + '/vba/';
        if(elm){
            if(elm.JSpath)this.JSpath = elm.JSpath;
            elm.innerHTML = `<div class="gbaemu"><div class="gba-menu"><div class="gba-menubtn"><span class="gba-menu-icon"></span></div><div class="gba-title"></div><div class="gba-downbtn"><span class="gba-menu-icon"></span></div></div><div class="gbaemu-container"><div class="gbaemu-startinfo">Ver. 20221116 | wasm power by <a href="https://github.com/44670/44vba">GitHub:44670/44vba</a><p class="infotips">Your files are processed locally and won't be uploaded to any server.<br>This software should not be used to play games you have not legally obtained.<br>"GBA", "Game Boy Advance" are trademarks of Nintendo Co.,Ltd, This site is not associated with Nintendo in any way.</p><div class="welcome"></div><div class="g-lastInfo"></div></div><div class="gbaemu-main no-select"><canvas width="240" height="160"></canvas><div class="user-controller"></div></div><div class="g-showtxt"></div></div></div>`;
            I.defines(elm, {Module:this}, 1);
        }else{
            I.defines(T, {Module:this}, 1);
        }
        this.emuElm = Nttr(T.$('.gbaemu',elm));
        console.log(this.emuElm);
        this.version = 1;
        this.runaction = T.runaction;
        this.getLang = T.getLang;
        this.db = {
            userdata:T.getStore('userdata'),
            rooms:T.getStore('rooms'),
            libjs:T.getStore('data-libjs'),
        };
        this.fps = 60;
        T.docload(async () =>{
            this.loadCores()
        });
    }
    $(str){
        return this.emuElm.$(str);
    }
    $$(str){
        return this.emuElm.$$(str);
    }
    Nttr(str){
        return Nttr(this.$(str));
    }
    cheatErroTxt = "";
    print(txt){
        let M=Module,T=M.T;
        if(M.cheatNowTxt){
            if(txt=='GBA: Warning: Codes seem to be for a different game.'){
                let elm = M.$('.cheat-result');
                M.cheatErroTxt += M.cheatNowTxt;
                if(elm)elm.innerHTML = `<h3>${M.getLang('cheat Erro')}</h3>${M.cheatErroTxt}`;
                M.cheatNowTxt="";
            }
        }
        console.log(txt);
    }
    printErr(txt){
        console.log(txt);
    }
    async loadCores() {
        let M = this, T = M.T;
        M.runaction('setNavMenu');
        M.canvas = M.$('canvas');
        //下载语言包
        if(typeof USERLANG != 'undefined'){
            M.lang = USERLANG[T.language];
        }
        if(!M.lang)M.lang = await T.FetchItem({ url: M.JSpath + 'language/' + T.language + '.json?t='+T.time, 'type': 'json' });
        //非测试模式应该为 缓存加载模式,强制更新添加version参数
        /**
         * M.lang = await T.FetchItem({ url: M.JSpath + 'language/' + T.language + '.json?t='+T.time, 'type': 'json',store:M.db.libjs});
         */
        let selm = M.runaction('addloadStatus',`44gba.zip : ${M.getLang('loading...')}`)
        //if(selm)welm.innerHTML = `<p>44gba.zip</p><p class="status">${M.getLang('loading...')}</p>`;
        let CacheFile = await T.FetchItem({
            url: M.JSpath + '44gba.zip', store: 'data-libjs', key: 'vba-core', version: M.version, unpack: true,
            process: e => {
                if(selm)selm.innerHTML = `44gba.zip : ${e}`;
            },
            packtext: M.getLang('unpack'),
        });
        selm.innerHTML = `44gba.zip : ${M.getLang('Ready!')}`;
        let asmjs = new TextDecoder().decode(CacheFile['44gba.js']);
        asmjs = asmjs.replace('wasmReady()', 'Module.wasmReady()').replace('writeAudio(', 'Module.writeAudio(').replace(/var\s?arguments_\s?=\s?\[\];/,'var arguments_ = ["-v"];');
        M.wasmBinary = CacheFile['44gba.wasm'];
        CacheFile = null;
        (new Function('Module',asmjs))(M);
        //await T.addJS(asmjs);
        //Nenge.once(document,'click',async e=>{Module.loadRoom(await Nenge.FetchItem('1.gba'));});
    }
    //romFileName = "";
    srmLength = 128*1024;
    async loadRoom(u8) {
        let M = this,
            T = M.T,
            gameID;
        M.isRunning = false;
        /*
        M.gameID = "";
        if (u8[0xB2] != 0x96) {
            alert('Not a valid GBA ROM!');
            return;
        }
        for (var i = 0xAC; i < 0xB2; i++) {
            console.log(u8[i]);
            gameID += String.fromCharCode(u8[i]);
        }
        if ((u8[0xAC] == 0) || (gameID.substr(0, 4) == '0000')) {
            // a homebrew! use file name as id
            gameID = M.romFileName;
        }
        M.gameID = gameID;
        console.log('gameID', gameID);
        */
       let startInfo = M.Nttr('.gbaemu-startinfo');
       if(startInfo)startInfo.hidden=true;
       localStorage.setItem('last-game',M.gameID);
        M.HEAPU8.set(u8, M.romBuffer);
        var ret = M._emuLoadROM(u8.length);
        //wasmSaveBuf.set(data)
        let savebuf = await M.runaction('loadSRM');
        if(savebuf){
            M.wasmSaveBuf.set(savebuf.slice(0,M.srmLength));
        }
        M.runaction('clearSaveBufState');
        M._emuResetCpu();
        M.isRunning = true;
        if(!this.looptime)M.emuLoop();
        return M.runaction('tryInitSound');
    }
    async FetchRoom(path,version){
        let M=this,T=M.T;
        let selm = M.runaction('addloadStatus',`${path} : ${M.getLang('download...')}`),u8 = await T.FetchItem({url:path,store:M.db.rooms,unpack:true,process:e=>{
            if(selm)selm.innerHTML = `${path} : ${e}`;
        },'version':version||T.version});
        if(selm)selm.innerHTML = `${path} : ${M.getLang('compelte...')}`;
        this.reloadRoom(T.F.getname(path),u8);
    }
    reloadRoom(gameID,u8){
        if(u8 instanceof Uint8Array){            
            this.gameID = gameID;
            return this.loadRoom(u8);
        }else if(u8){
            let newlist = Object.entries(u8);
            for(let i=0;i<newlist.length;i++){
                if((/\.gba/i).test(newlist[i][0])){
                    this.reloadRoom(newlist[i][0],newlist[i][1]);       
                    this.gameID = newlist[i][0];
                    this.loadRoom(newlist[i][1]);
                }
            }
            newlist = null;
        }
    }
    frameCnt = 0;
    //last128FrameTime = 0;
    //lastFrameTime = 0;
    //frameSkip = 0;
    //lowLatencyMode = false;
    lastCheckedSaveState = 0;
    get fps() {
        return this.fpslen;
    }
    set fps(fps) {
        this.fpslen =  parseInt(fps);
        this.fpspeed = 1000/this.fpslen;
        //if(this.isRunning)this.emuLoop();
    }
    get gameID(){
        return this.GameFullName;
    }
    set gameID(name){
        this.GameFullName = name;
        this.GameName = name.replace(/\.gba$/i,'');
        if(this.$('.gba-title'))this.$('.gba-title').innerHTML = name;
    }
    getVKState() {
        return this.Controller.VKSTATUS;
    }
    emuLoop() {
       let M=this;
       M.looptime = window.requestAnimationFrame(e=>{
            M.Frametime = e;
            M.emuLoop();
       });
       M.runaction('loopFrame',[M.Frametime]);
    }
    OutputCanvans(){
        let M = this;
        if (M.optScaleMode >= 2) {
            if(M.gl)M.runaction('gpuDraw')
        } else {
            if(M.drawContext)M.drawContext.putImageData(M.idata, 0,0,0,0,M.canvas.width,M.canvas.height);
        }
    }
    optScaleMode = 0;
    async wasmReady() {
        let M = this, T = M.T;
        if(!M.Controller)M.Controller = new NengeController(M);
        M.romBuffer = M._emuGetSymbol(1);
        M.SrmPtr = M._emuGetSymbol(2);
        M.wasmSaveBuf = M.HEAPU8.subarray(M.SrmPtr,M.SrmPtr + M.srmLength);
        M.ImgPtr = M._emuGetSymbol(3);
        let canvas = M.canvas, width = canvas.width, height = canvas.height;
        var imgFrameBuffer = new Uint8ClampedArray(M.HEAPU8.buffer).subarray(M.ImgPtr, M.ImgPtr + 240 * 160 * 4);
        M.idata = new ImageData(imgFrameBuffer, 240, 160);
        M.isWasmReady = true;
        await M.Controller.runaction('setShader',[M.optScaleMode]);
        if(M.StartVBA){
            M.Controller.runaction('setInfoEvent',[M.Nttr('.g-lastInfo')]);
            return M.StartVBA();
        }
        /*
        if (M.optScaleMode >= 2) {
            await M.runaction('gpuInit');
        } else {
            M.drawContext = canvas.getContext('2d');
        }
        */
        M.$('.welcome').remove();
        delete M.wasmBinary;
        if(M.$('.infotips'))M.$('.infotips').innerHTML = M.getLang('This site is not associated with Nintendo in any way.Import your Homemade games. enter \'ESC\' show Menu when you running!');
        M.Controller.runaction('StartInfo');
    }
    writeAudio(ptr, frames) {
        let M = this, T = M.T,audioContext = M.audioContext;
        if(!audioContext) return;
        //console.log(ptr, frames)
        if(!M.wasmAudioBuf)M.wasmAudioBuf = new Int16Array(M.HEAPU8.buffer).subarray(ptr / 2, ptr / 2 + 2048);
        var tail = (M.audioFifoHead + M.audioFifoCnt) % M.audioFifo0.length;
        if (M.audioFifoCnt + frames >= M.audioFifo0.length) {
            //console.log('o', audioFifoCnt)
            return
        }
        for (var i = 0; i < frames; i++) {
            M.audioFifo0[tail] = M.wasmAudioBuf[i * 2];
            M.audioFifo1[tail] = M.wasmAudioBuf[i * 2 + 1];
            tail = (tail + 1) % M.audioFifo0.length;
        }
        M.audioFifoCnt += frames;
    }
    get AUDIO_BLOCK_SIZE() {
        return 1024;
    }
    imgList = {};
    action = {
        loopFrame(e) {
            let M = this, T = M.T,speed = M.fpspeed;
            //M.nowFrame = e;
            if (M.isRunning) {
                M.frameCnt++
                if (M.frameCnt % 60 == 0) {
                    M.runaction('checkSaveBufState');
                }
                if(document.visibilityState == 'hidden'){
                    speed = 1000/60;
                }
                if(!e){
                    if(M.costFrame){
                        return ;
                        console.log(M.costFrame);
                    }
                    M.runaction('callFrame');
                }else if(e>0){
                    M.costFrame = (e - M.nowFrame)/speed;
                    if(M.costFrame<=0.8){
                        return;
                    }
                    let num = Math.round(M.costFrame);
                    M.costFrame = 0;
                    if(num>4)num=4;
                    M.nowFrame = e;
                    for(var i=0;i<num;i++)M.runaction('callFrame');
                    //M._emuRunFrame(M.getVKState());
                }
                M.OutputCanvans();
            }
            return true;
        },
        callFrame(){
            let M=this;
            M._emuRunFrame(M.getVKState());
        },
        addloadStatus(txt){
            let M=this,T=M.T,elm = M.$('.welcome');
            if(elm){
                let aelm =  T.$ct('div',txt);
                elm.appendChild(aelm);
                return aelm;
            }
        },
        showMsg(msg,t){
            let M=this,elm = M.Nttr('.g-showtxt');
            elm.html(msg);
            elm.active=true;
            if(M.msgTime!=undefined)clearTimeout(M.msgTime);
            M.msgTime = setTimeout(()=>{
                elm.active = false;
            },t||2000);
            
        },
        checkSaveBufState(){
            let M = this, T = M.T;
            if (!M.isRunning) {
                return;
            }
            var state = M._emuUpdateSavChangeFlag();
            //console.log(state);
            //console.log(state)
            if (M.lastCheckedSaveState == 1&&state == 0) {
                M.runaction('saveSRM');
            }
            M.lastCheckedSaveState = state

        },
        async saveSRM(){
            let M = this, T = M.T,name = M.GameName;
            M.runaction('showMsg',[M.getLang('Auto saving, please wait...'),80000]);
            M.canvas.toBlob(async blob=>{
                await M.db.userdata.put("/userdata/screenshots/"+name+'.png',{
                    'contents':new Uint8Array(await blob.arrayBuffer()),
                    'mode':33206,
                    'timestamp':T.date
                });
            });
            await M.db.userdata.put("/userdata/saves/"+name+'.srm',{
                'contents':new Uint8Array(M.wasmSaveBuf),
                'mode':33206,
                'timestamp':T.date
            });
            M.runaction('showMsg',[M.getLang('saves file is ok'),1000]);
        },
        async loadSRM(u8){
            let M = this,T=M.T;
            if(u8){
                M.isRunning = false;
                M.wasmSaveBuf.set(u8.slice(0,M.srmLength));
                M.runaction('clearSaveBufState');
                M._emuResetCpu();
                M.runaction('showMsg',[M.getLang('this saves is temp to load.<br>the local saves is not change!'),5000]);
                M.isRunning = true;
            }else{
                return await  M.db.userdata.data("/userdata/saves/"+M.GameName+'.srm');
            }
        },
        async exportSrm(){
            let M = this,srmname = M.GameName+'.srm';
            let u8 = await M.db.userdata.data("/userdata/saves/"+srmname);
            if(u8)M.T.down(srmname,u8);
            else M.runaction('showMsg',[M.getLang('no saves file!')]);;
            u8=null;
        },
        async loadCheat(){
            let M=this;
            return await M.db.userdata.data(`/userdata/cheats/VBA Next/${M.GameName}.cheat`);
        },
        async saveCheat(contents){
            let M=this,T=M.T;
            if(typeof contents == 'string')contents = new TextEncoder().encode(contents);
            M.db.userdata.put('/userdata/cheats/VBA Next/'+M.GameName+'.cheat',{
                contents,
                mode: 33206,
                timestamp:T.date
            });
        },
        clearSaveBufState() {
            this.lastCheckedSaveState = 0;
            this._emuUpdateSavChangeFlag();
        },
        gpuDraw() {
            if (!this.gl) {
                return;
            }
            let M = this, canvas = M.canvas, gl = M.gl;
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, M.idata);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.uniform2f(M.outResolutionUniformLocation, canvas.width, canvas.height);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        },
        async gpuInit() {
            if (this.gl) {
                return;
            }
            let M = this,T=M.T, canvas = M.canvas,width = canvas.width, height = canvas.height;
            let gl = canvas.getContext("webgl");
            var devicePixelRatio = window.devicePixelRatio || 1;
            let opt = canvas.getBoundingClientRect();
            console.log(opt);
            canvas.width = opt.width * devicePixelRatio;
            canvas.height = (opt.width/1.5) * devicePixelRatio;
            if (!gl) {
                M.optScaleMode = 0;
                return;
            }
            let shaderFile = await T.FetchItem({
                url: M.JSpath + 'gl_shader.zip', store: 'data-libjs', key: 'vba-glshader', version: M.version, unpack: true,
            });
            gl.viewport(0, 0, width, height);
            // Create shader.
            var program = gl.createProgram();
            var vertShader = gl.createShader(gl.VERTEX_SHADER);
            var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
            gl.shaderSource(vertShader,new TextDecoder().decode(shaderFile['vert.shader']));
            gl.shaderSource(fragShader,new TextDecoder().decode(shaderFile['frag.shader']));
            gl.compileShader(vertShader);
            gl.compileShader(fragShader);
            // Check if compilation succeeded.
            if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
                alert("Error in vertex shader: " + gl.getShaderInfoLog(vertShader));
                return;
            }
            if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
                alert("Error in fragment shader: " + gl.getShaderInfoLog(fragShader));
                return;
            }
            gl.attachShader(program, vertShader);
            gl.attachShader(program, fragShader);
            gl.linkProgram(program);
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                alert("Error in program: " + gl.getProgramInfoLog(program));
                return;
            }
            gl.useProgram(program);
            // Create texture.
            var texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            // Use nearest neighbor interpolation.
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            // Create vertex buffer, a rectangle to (0,0)-(width,height).
            var vertices = new Float32Array([
                0, 0,
                1, 0,
                0, 1,
                0, 1,
                1, 0,
                1, 1
            ]);
            var vertexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
            // Create attribute.
            var positionAttribLocation = gl.getAttribLocation(program, "a_position");
            gl.enableVertexAttribArray(positionAttribLocation);
            gl.vertexAttribPointer(positionAttribLocation, 2, gl.FLOAT, false, 0, 0);
            // Set uniform.
            M.outResolutionUniformLocation = gl.getUniformLocation(program, "u_outResolution");
            var inResolutionUniformLocation = gl.getUniformLocation(program, "u_inResolution");
            gl.uniform2f(inResolutionUniformLocation, width, height);
            this.gl = gl;
        },
        tryInitSound() {
            let M = this, audioContext = M.audioContext;
            if (audioContext) {
                if (audioContext.state != 'running') {
                    audioContext.resume();
                }
                return;
            }
            
            M.audioFifo0 = new Int16Array(4900);
            M.audioFifo1 = new Int16Array(4900);
            M.audioFifoHead = 0;
            M.audioFifoCnt = 0;
            M.audioContext = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: 0.0001, sampleRate: 48000 });
            let scriptProcessor = M.audioContext.createScriptProcessor(M.AUDIO_BLOCK_SIZE, 0, 2);
            scriptProcessor.onaudioprocess = e => M.runaction('processAudio', [e]);
            scriptProcessor.connect(M.audioContext.destination);
            M.audioContext.resume();
        },
        processAudio(event) {
            let M = this;
            var outputBuffer = event.outputBuffer;
            var audioData0 = outputBuffer.getChannelData(0);
            var audioData1 = outputBuffer.getChannelData(1);

            if ((!M.isRunning)) {
                for (var i = 0; i < M.AUDIO_BLOCK_SIZE; i++) {
                    audioData0[i] = 0;
                    audioData1[i] = 0;
                }
                return
            }
            if(M.costFrame)return;
            else{
                while (M.audioFifoCnt < M.AUDIO_BLOCK_SIZE) {
                    //console.log('audio fifo underflow, running a new frame')
                    M.runaction('loopFrame');
                }
            }

            let copySize = M.AUDIO_BLOCK_SIZE;
            if (M.audioFifoCnt < copySize) {
                copySize = M.audioFifoCnt;
            }
            for (var i = 0; i < copySize; i++) {
                audioData0[i] = M.audioFifo0[M.audioFifoHead] / 32768.0;
                audioData1[i] = M.audioFifo1[M.audioFifoHead] / 32768.0;
                M.audioFifoHead = (M.audioFifoHead + 1) % M.audioFifo0.length;
                M.audioFifoCnt--;
            }
        },
        resetCheat(){
            let M = this,T=M.T;
            if(M.cheatAddList){
                var ptrGBuf = M._emuGetSymbol(4);
                M.HEAPU8.set(new Uint8Array(Array(0x1000).fill(0)),ptrGBuf);
                M.cheatAddList.forEach(v=>M._emuAddCheat(v));
            }
        },
        applyCheatCode(cheatCode) {
            let M = this,T=M.T;
            var ptrGBuf = M._emuGetSymbol(4);
            var gbuf = M.HEAPU8.subarray(ptrGBuf, ptrGBuf + 0x1000);
            var lines = cheatCode.split('\n');
            var textEnc = new TextEncoder();
            var linePtr = 0;
            var CheatText = '';
            M.cheatNowTxt = "";
            let checklist = 0;
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i].trim().replace(/\:/g,' ').replace(/([0-9A-F]{8})([0-9A-F]{8})/ig,'$1 $2').replace(/([0-9A-F]{8})([0-9A-F]{4})/ig,'$1 $2');
                if (line.length == 0 || /(#|-|\!)/.test(line.charAt(0))) {
                    continue;
                }
                let linespit = line.split(/\s/);
                for(let k=0;k<linespit.length;){
                    let first = linespit[k];
                    let first2 = linespit[k+1];
                    k+=2;
                    if(first&&first2&&first.length==8&&(first2.length==4||first2.length==8)){
                        //CheatText+= `${first} ${first2}\n`;
                        if(first2.length==4)first = first.replace(/^02/,'82');
                        let linetxt= `${first} ${first2}\x00`;
                        M.cheatNowTxt += linetxt.replace('\x00','<br>')
                        let cheatBuf = new TextEncoder().encode(linetxt);
                        gbuf.set(cheatBuf,linePtr);
                        //if(!M.cheatAddList)M.cheatAddList=[];
                        //M.cheatAddList.push(ptrGBuf+linePtr);
                        M._emuAddCheat(ptrGBuf+linePtr);
                        M.cheatNowTxt = "";
                        checklist++;
                        //linePtr = cheatBuf.length;
                    }
                }
                /*
                console.log(linespit);
                if (line.length == 12) {
                    line = line.substr(0, 8) + ' ' + line.substr(8, 4);
                }
                var lineBuf = textEnc.encode(line);
                console.log(line,lineBuf.length);
                gbuf.set(lineBuf);
                gbuf[lineBuf.length] = 0;
                M._emuAddCheat(ptrGBuf);
            if(CheatText){
                let cheatBuf = new TextEncoder().encode(CheatText.trim());
                gbuf.set(cheatBuf);
                gbuf[cheatBuf.length] = 0;
                this._emuAddCheat(ptrGBuf);
                console.log(CheatText.trim());
            }
                */
            };
            M.runaction('saveCheat',[cheatCode]);
            return checklist;
        },
        setNavMenu(){
            let M=this,T=M.T,menubtn = M.Nttr('.gba-menubtn');
            if(menubtn){
                menubtn.click(e=>{
                    let active = !menubtn.active;
                    menubtn.active = active;
                    M.emuElm.active = active;
                    if(typeof M.isRunning!='undefined'){
                        M.isRunning = !active;
                    }
                });
            }
            let downbtn = M.Nttr('.gba-downbtn');
            if(downbtn){
                downbtn.click(e=>{
                    if(M.gameID){
                        T.down(M.gameID,M.db.rooms.data(M.gameID));
                    }
                });
            }
        }
    };
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
}(Nenge,typeof elm !='undefined'?elm:undefined);