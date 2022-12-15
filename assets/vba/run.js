Nenge.docload(function(){
    let T = this;
    T.DB_NAME = '44GBA';
    T.LibStore = 'data-libjs';
    T.DB_STORE_MAP = {
        'rooms': {},
        //'info': {},
        'userdata': { 'timestamp': false },
        'data-libjs': {},
    };
    T.action['TAG-EMU-GBA'] = async (elm,status)=>{
        if(status=='connect'){
            elm.txt = elm.innerHTML;
            let html = `<div class="gbaemu">
            <div class="gba-menu">
                <div class="gba-menubtn">
                    <span class="gba-menu-icon"></span>
                </div>
                <div class="gba-title"></div>
                <div class="gba-downbtn">
                    <span class="gba-menu-icon"></span>
                </div>
            </div>
            <div class="gbaemu-container">
                <div class="gbaemu-startinfo">Ver. 20221116 | wasm power by <a href="https://github.com/44670/44vba">GitHub:44670/44vba</a>
                    <p class="infotips">
                        Your files are processed locally and won't be uploaded to any server.<br>
                        This software should not be used to play games you have not legally obtained.<br>
                        "GBA", "Game Boy Advance" are trademarks of Nintendo Co.,Ltd, This site is not associated with Nintendo in any way.
                    </p>
                    <div class="welcome"></div>
                    <div class="g-lastInfo"></div>
                </div>
                <div class="gbaemu-main no-select">
                    <canvas width="240" height="160"></canvas>
                    <div class="user-controller"></div>
                </div>
                <div class="g-showtxt"></div>
            </div>
        </div>`;
            Nttr(elm).addClass('rungba');
            elm.JSpath = T.JSpath.split('/').slice(0, -2).join('/') + '/vba/';
            T.once(elm,'pointerup',async()=>{
                Nttr(elm).removeClass('rungba');
            elm.innerHTML=html;
            let loaderjs = await T.getScript('assets/vba/loader.js');
            //loader.js 实际上是 Module.js NengeController.js 合拼
            //Module.js 可能需要指定JSpath, JSpath用于首次加载下载wasm核心和语言包路径
            // 非测试用缓存方式加载 let loaderjs = await T.getScript('assets/vba/loader.js',{store:'data-libjs'});
            elm.Module = (new Function('Nenge',loaderjs+';return Module'))(T,elm);
            elm.Module.StartVBA = async ()=>{
                    let gamepath = T.attr(elm,'data-path');
                    elm.Module.FetchRoom(gamepath);
            };

            });
        }
    };
    T.customElement('emu-gba');
});