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
            Nttr(elm).addClass('rungba');
            elm.JSpath = T.JSpath.split('/').slice(0, -2).join('/') + '/vba/';
            T.once(elm,'pointerup',async()=>{
                Nttr(elm).removeClass('rungba');
            elm.innerHTML='请稍等!';
            let loaderjs = await T.getScript('assets/vba/emu-loader.js?t='+T.time,{process:e=>{
                elm.innerHTML = '加载引导文件:'+e;
            }});
            if(!loaderjs)alert('网络错误!');
            //loader.js 实际上是 Module.js NengeController.js 合拼
            //Module.js 可能需要指定JSpath, JSpath用于首次加载下载wasm核心和语言包路径
            /** 
             * 非测试用缓存方式加载 
             * 
            let loaderjs = await T.getScript('assets/vba/emu-loader.js?t='+T.time,{process:e=>{
                elm.innerHTML = '加载引导文件:'+e;
            },store:'data-libjs'});
             * */ 
            elm.Module = (new Function('Nenge,elm',loaderjs+';return Module'))(T,elm);
            elm.Module.StartVBA = async ()=>{
                    let gamepath = T.attr(elm,'data-path');
                    elm.Module.FetchRoom(gamepath);
            };

            });
        }
    };
    T.customElement('emu-gba');
});