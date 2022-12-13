var Module = new class {
    constructor(T) {
        let I = T.I;
        T.LibPack = 'common_libjs.zip';
        T.DB_NAME = '44GBA';
        T.LibStore = 'data-libjs';
        T.DB_STORE_MAP = {
            'rooms': {},
            //'info': {},
            'userdata': { 'timestamp': false },
            'data-libjs': {},
        };
        I.defines(this, { T, I }, 1);
        I.defines(T, {Module:this}, 1);
        this.JSpath = T.JSpath.split('/').slice(0, -2).join('/') + '/vba/';
        this.version = 1;
        this.runaction = T.runaction;
        this.db = {
            userdata:T.getStore('userdata'),
            rooms:T.getStore('rooms'),
            libjs:T.getStore('data-libjs'),
        };
        T.docload(() => this.loadCores());
    }
    async loadCores() {
        let M = this, T = M.T;
        M.canvas = T.$('canvas');
        T.lang = await T.FetchItem({ url: M.JSpath + 'language/' + T.language + '.json', 'type': 'json' });
        let welm = T.$('.welcome');
        if(welm)welm.innerHTML = `<p>44gba.zip</p><p class="status">${T.getLang('loading...')}</p>`;
        let CacheFile = await T.FetchItem({
            url: M.JSpath + '44gba.zip', store: 'data-libjs', key: 'vba-core', version: M.version, unpack: true,
            process: e => {
                if(welm)T.$('.welcome>.status').innerHTML = e;
            },
            packtext: T.getLang('unpack'),
        });
        let asmjs = new TextDecoder().decode(CacheFile['44gba.js']);
        asmjs = asmjs.replace('wasmReady()', 'Module.wasmReady()').replace('writeAudio(', 'Module.writeAudio(')
        M.wasmBinary = CacheFile['44gba.wasm'];
        CacheFile = null;
        await T.addJS(asmjs);
        //Nenge.once(document,'click',async e=>{Module.loadRoom(await Nenge.FetchItem('1.gba'));});

    }
    romFileName = "";
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
       let startInfo = Nttr('.g-info');
       if(startInfo)startInfo.hidden=true;
       localStorage.setItem('last-game',Module.gameID);
        M.HEAPU8.set(u8, M.romBuffer);
        var ret = M._emuLoadROM(u8.length);
        //wasmSaveBuf.set(data)
        let savebuf = await M.runaction('loadSRM');
        if(savebuf){
            M.wasmSaveBuf.set(savebuf.slice(0,131072));
        }
        M.runaction('clearSaveBufState');
        M._emuResetCpu();
        M.isRunning = true;
        M.emuLoop();
        return M.runaction('tryInitSound');
    }
    reloadRoom(gameID,u8){
        Module.gameID = gameID;
        return Module.loadRoom(u8);
    }
    fpslen = 60;
    frameCnt = 0;last128FrameTime = 0;lastFrameTime = 0;frameSkip = 0;lowLatencyMode = false;
    lastCheckedSaveState = 0;
    get fps() {
        return this.fpslen;
    }
    set fps(fps) {
        this.fpslen =  parseInt(fps);
        //if(this.isRunning)this.emuLoop();
    }
    getVKState() {
        return this.Controller.VKSTATUS;
    }
    emuLoop() {
        if(this.loopTime){
            cancelAnimationFrame(this.loopTime);
            this.nowFrame = 0;
            this.costFrame = 0;
        };
        this.loopTime = window.requestAnimationFrame(e=>{
            this.emuRunFrame(e);
            delete this.loopTime;
            this.emuLoop();
        });
        //this.loopTime = setInterval(() => this.emuRunFrame(), 1000 / this.fpslen);
    }
    nowFrame = 0;
    costFrame = 0;
    emuRunFrame(e) {
        let M = this, T = M.T;
        //M.nowFrame = e;
        M.runaction('processGamepadInput');
        if (M.isRunning) {
            M.frameCnt++
            if (M.frameCnt % 60 == 0) {
                M.runaction('checkSaveBufState');
            }
            if (M.frameCnt % 128 == 0) {
                if (M.last128FrameTime) {
                    var diff = performance.now() - M.last128FrameTime;
                    var frameInMs = diff / 128;
                    if (frameInMs > 0.001) {
                        M.nowfps = 1000 / frameInMs
                    }
                    console.log('fps', M.nowfps,e);
                }
                M.last128FrameTime = performance.now();

            }
            if(!M.nowFrame){
                M.nowFrame = e;
                M._emuRunFrame(M.getVKState());
            }else if(e){
                M.costFrame = e - M.nowFrame;
                let num = Math.round(this.fpslen/(1000/M.costFrame));
                if(num<1) return;
                if(num>3)num=3;
                for(var i=0;i<num;i++)M._emuRunFrame(M.getVKState());
                //M._emuRunFrame(M.getVKState());
            }else{
                console.log(this.fpslen,e);
            }
            if (M.optScaleMode >= 2) {
                if(M.gl)M.runaction('gpuDraw')
            } else {
                if(M.drawContext)M.drawContext.putImageData(M.idata, 0,0,0,0,M.canvas.width,M.canvas.height);
            }
            M.nowFrame = e;
        }else{
            M.nowFrame = e;
        }
    }
    optScaleMode = 0;
    async wasmReady() {
        let M = this, T = M.T;
        if(!M.Controller)M.Controller = new NengeController(T);
        M.romBuffer = Module._emuGetSymbol(1);
        var ptr = Module._emuGetSymbol(2);
        M.wasmSaveBuf = Module.HEAPU8.subarray(ptr, ptr + 131072);
        ptr = Module._emuGetSymbol(3);
        let canvas = M.canvas, width = canvas.width, height = canvas.height;
        var imgFrameBuffer = new Uint8ClampedArray(Module.HEAPU8.buffer).subarray(ptr, ptr + 240 * 160 * 4);
        M.idata = new ImageData(imgFrameBuffer, 240, 160);
        M.isWasmReady = true;
        await M.Controller.runaction('setShader',[M.optScaleMode]);
        /*
        if (M.optScaleMode >= 2) {
            await M.runaction('gpuInit');
        } else {
            M.drawContext = canvas.getContext('2d');
        }
        */
        T.$('.welcome').remove();
        T.$('.container .g-info').hidden = false;
        delete M.wasmBinary;
        M.Controller.runaction('StartInfo');
    }
    writeAudio(ptr, frames) {
        let M = this, T = M.T,audioContext = M.audioContext;
        if(!audioContext) return;
        //console.log(ptr, frames)
        if(!M.wasmAudioBuf)M.wasmAudioBuf = new Int16Array(M.HEAPU8.buffer).subarray(ptr / 2, ptr / 2 + 2048);
        var tail = (M.audioFifoHead + M.audioFifoCnt) % M.audioFifo0.length;
        if (M.audioFifoCnt + M.frames >= M.audioFifo0.length) {
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
        showMsg(msg,t){
            let elm = Nttr('.g-showtxt');
            elm.html(msg);
            elm.active=true;
            if(this.msgTime!=undefined)clearTimeout(this.msgTime);
            this.msgTime = setTimeout(()=>{
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
            let M = this, T = M.T,name = M.gameID.replace(/\.gba$/,'');
            M.runaction('showMsg',[T.getLang('Auto saving, please wait...'),80000]);
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
            M.runaction('showMsg',[T.getLang('saves file is ok'),1000]);
        },
        async loadSRM(){
            let name = this.gameID.replace(/\.gba$/,'');
            return await  this.db.userdata.data("/userdata/saves/"+name+'.srm');
        },
        processGamepadInput() {

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
            let welm = T.$('.welcome');
            if(welm)welm.innerHTML = `<p>${T.getLang('Cores installed!')}</p><p class="status">${T.getLang('gl-shader')}:${T.getLang('loading...')}</p>`;
            let shaderFile = await T.FetchItem({
                url: M.JSpath + 'gl_shader.zip', store: 'data-libjs', key: 'vba-glshader', version: M.version, unpack: true,
                process: e => {
                    if(welm)T.$('.welcome>.status').innerHTML = T.getLang('gl-shader')+':'+e;
                },
                packtext: T.getLang('unpack'),
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
            while (M.audioFifoCnt < M.AUDIO_BLOCK_SIZE) {
                //console.log('audio fifo underflow, running a new frame')
                M.emuRunFrame();
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
        applyCheatCode(cheatCode) {
            let M = this,T=M.T;
            var ptrGBuf = M._emuGetSymbol(4);
            var gbuf = M.HEAPU8.subarray(ptrGBuf, ptrGBuf + 0x1000);
            var lines = cheatCode.split('\n');
            var textEnc = new TextEncoder();
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i].trim();
                if (line.length == 0) {
                    continue;
                }
                if (line.length == 12) {
                    line = line.substr(0, 8) + ' ' + line.substr(8, 4);
                }
                var lineBuf = textEnc.encode(line);
                console.log(lineBuf.length);
                gbuf.set(lineBuf);
                gbuf[lineBuf.length] = 0;
                M.db.userdata.put("/userdata/cheats/VBA Next/"+M.gameID.replace(/\.gba$/,'.cheat'),{
                    contents:lineBuf,
                    mode: 33206,
                    timestamp:T.date
                });
                Module._emuAddCheat(ptrGBuf);
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
}(Nenge);