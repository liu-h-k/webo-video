/* eslint-disable no-cond-assign */
// @ts-nocheck
import videojs from 'video.js/dist/video.js' //
// flv 插件 
import flvjs from 'flv.js';

// mpegts flv h265 视频格式 使用实例
// import mpegts from "mpegts.js";
// flvPlayer = mpegts.createPlayer({
//     type: "flv", // could also be mpegts, m2ts, flv
//     isLive: true,
//     url: url,
//     liveBufferLatencyChasing: true,
//     enableWorker: true,
// }, {
//     enableWorker: true,
//     lazyLoadMaxDuration: 15,
//     seekType: "range",
//     liveBufferLatencyChasing: true,
//     liveBufferLatencyMaxLatency: 2,
//     liveBufferLatencyMinRemain: 0.1,
//     lazyLoad: true,
//     enableStashBuffer: false,
//     autoCleanupSourceBuffer: true,
//     autoCleanupMaxBackwardDuration: 5,
//     autoCleanupMinBackwardDuration: 3,
// });

// flvPlayer.on("error", (err) => {
//     if (err !== "NetworkError") return;
//     hintTxt.value = "连接视频中...";
//     clearSdk();

//     let num = Number(
//         sessionStorage.getItem("stream_timeout_restart") || 15
//     );
//     if (timer) {
//         clearInterval(timer);
//         timer = null;
//     }
//     timer = setInterval(() => {
//         num = num - 1;
//         hintTxt.value = `重连倒计时(${num})秒`;
//         if (num == 0) {
//             clearInterval(timer);
//             timer = null;

//             setStart(); // 拉取视频
//         }
//     }, 1000);
// });
// flvPlayer.attachMediaElement(
//     document.querySelector(".mpegts-video--" + randomId)
// );

// flvPlayer.load();
// flvPlayer.play();

// videojs + flv.js 插件
const Html5 = videojs.getTech('Html5');
const mergeOptions = videojs.mergeOptions || videojs.util.mergeOptions;
const defaults = {
    mediaDataSource: {},
    config: {}
};

class Flvjs extends Html5 {

    /**
     * Create an instance of this Tech.
     *
     * @param {Object} [options]
     *        The key/value store of player options.
     *
     * @param {Component~ReadyCallback} ready
     *        Callback function to call when the `Flvjs` Tech is ready.
     */
    constructor(options, ready) {
        options = mergeOptions(defaults, options);
        super(options, ready);
    }

    /**
     * A getter/setter for the `Flvjs` Tech's source object.
     *
     * @param {Tech~SourceObject} [src]
     *        The source object you want to set on the `Flvjs` techs.
     *
     * @return {Tech~SourceObject|undefined}
     *         - The current source object when a source is not passed in.
     *         - undefined when setting
     */
    setSrc(src) {
        if (this.flvPlayer) {
            // Is this necessary to change source?
            this.flvPlayer.detachMediaElement();
            this.flvPlayer.destroy();
        }

        const mediaDataSource = this.options_.mediaDataSource;
        const config = this.options_.config;

        mediaDataSource.type = mediaDataSource.type === undefined ? 'flv' : mediaDataSource.type;
        mediaDataSource.url = src;
        this.flvPlayer = flvjs.createPlayer(mediaDataSource, config);
        this.flvPlayer.attachMediaElement(this.el_);
        this.flvPlayer.load();
    }

    /**
     * Dispose of flvjs.
     */
    dispose() {
        if (this.flvPlayer) {
            this.flvPlayer.detachMediaElement();
            this.flvPlayer.destroy();
        }
        super.dispose();
    }

}

/**
 * Check if the Flvjs tech is currently supported.
 *
 * @return {boolean}
 *          - True if the Flvjs tech is supported.
 *          - False otherwise.
 */
Flvjs.isSupported = function() {

    return flvjs && flvjs.isSupported();
};

/**
 * Flvjs supported mime types.
 *
 * @constant {Object}
 */
Flvjs.formats = {
    'video/flv': 'FLV',
    'video/x-flv': 'FLV'
};

/**
 * Check if the tech can support the given type
 *
 * @param {string} type
 *        The mimetype to check
 * @return {string} 'probably', 'maybe', or '' (empty string)
 */
Flvjs.canPlayType = function(type) {
    if (Flvjs.isSupported() && type in Flvjs.formats) {
        return 'maybe';
    }

    return '';
};

/**
 * Check if the tech can support the given source
 * @param {Object} srcObj
 *        The source object
 * @param {Object} options
 *        The options passed to the tech
 * @return {string} 'probably', 'maybe', or '' (empty string)
 */
Flvjs.canPlaySource = function(srcObj, options) {
    return Flvjs.canPlayType(srcObj.type);
};

// Include the version number.
Flvjs.VERSION = '__VERSION__';

videojs.registerTech('Flvjs', Flvjs);

// rtc 类
export class RTC {
    url;
    defaultPath;
    pc
    onaddstream;
    constructor(url) {
        this.url = url;
        this.defaultPath = '/rtc/v1/play/';
        // 初始化配置
        this.pc = new RTCPeerConnection();
        // 监听流
        this.pc.onaddstream = (event) => {
            if (this.onaddstream) {
                this.onaddstream(event);
            }
        };
        // // 信号监听更改
        // this.pc.onsignalingstatechange = this.onsignalingstatechange;
        // // iceconnection 状态更改
        // this.pc.oniceconnectionstatechange = this.oniceconnectionstatechange;
        // // icegathering 状态更改
        // this.pc.onicegatheringstatechange = this.onicegatheringstatechange;
        // // 监听轨道
        // this.pc.ontrack = this.handleOnTrack;
        // // 啥东西
        // this.pc.onicecandidate = this.onicecandidate;
    }

    onsignalingstatechange = function(state) {
        console.info('ddddd', state)
    };

    oniceconnectionstatechange = function(state) {
        console.info('ccccc:', state)
    };

    onicegatheringstatechange = function(state) {
        console.info('bbbbb:', state)
    };

    // 切换轨道
    handleOnTrack = function(e) {
        console.log('handleOnTrack', e.streams);
        // if (self.video.srcObject !== e.streams[0]) {
        //     console.log('setting video stream from ontrack');
        //     self.video.srcObject = e.streams[0];
        // }
    };

    onicecandidate = function(e) {
        if (e.candidate) {
            // self.onWebRtcCandidate(JSON.stringify(e.candidate));
        }
    };

    async play(url) {
        // 发起订阅
        let conf = this.prepareUrl(url);
        this.pc.addTransceiver("audio", { direction: "recvonly" });
        this.pc.addTransceiver("video", { direction: "recvonly" });
        let offer = await this.pc.createOffer({
            offerToReceiveAudio: 1,
            offerToReceiveVideo: 1
        });
        await this.pc.setLocalDescription(offer)
        let session = await new Promise((resolve, reject) => {
            let data = {
                api: conf.apiUrl,
                streamurl: conf.streamUrl,
                clientip: null,
                sdp: offer.sdp
            }
            fetch(conf.apiUrl.replace("1986", "1985"), {
                    method: "POST",
                    body: JSON.stringify(data)
                })
                .then(response => response.json())
                .then(res => {
                    if (res.code) {
                        reject(data);
                    } else {
                        resolve(res)
                    }
                }).catch(error => {
                    console.log(error);
                })
        });
        // 接收订阅
        await this.pc.setRemoteDescription(
                new RTCSessionDescription({ type: 'answer', sdp: session.sdp })
            )
            // console.log('iceConnectionState', this.pc.iceConnectionState)
            // this.pc.onsignalingstatechange = (e) => {
            //     console.log('onsignalingstatechange', e)
            // }
            // this.pc.onloadedmetadata = (e) => {
            //     console.log('onloadedmetadata', e)
            // }
            // this.pc.iceconnectionstatechange = (e) => {
            //     console.log('iceconnectionstatechange', e);
            //     console.log('iceConnectionState1', this.pc.iceConnectionState)
            // }
            // this.pc.oniceconnectionstatechange = (e) => {
            //     console.log('oniceconnectionstatechange', e);
            // }
        return session
    }
    close() {
        this.pc.close();
        this.pc = null;
    }
    prepareUrl(webrtcUrl) {
        let urlObject = this.parse(webrtcUrl)
        let schema = urlObject.user_query.schema;
        schema = schema ? schema + ':' : window.location.protocol;
        let port = urlObject.port || 1985;
        if (schema === 'https:') {
            port = urlObject.port || 443;
        }
        let api = urlObject.user_query.play || this.defaultPath;
        if (api.lastIndexOf('/') !== api.length - 1) {
            api += '/';
        }
        let apiUrl = schema + '//' + urlObject.server + ':' + port + api;
        for (let key in urlObject.user_query) {
            if (key !== 'api' && key !== 'play') {
                apiUrl += '&' + key + '=' + urlObject.user_query[key];
            }
        }
        apiUrl = apiUrl.replace(api + '&', api + '?');
        let streamUrl = urlObject.url;
        return { apiUrl: apiUrl, streamUrl: streamUrl, schema: schema, urlObject: urlObject, port: port };
    }

    parse(url) {
        let a = document.createElement('a')
        a.href = url.replace("rtmp://", "http://")
            .replace("webrtc://", "http://")
            .replace("rtc://", "http://");
        let vhost = a.hostname
        let app = a.pathname.substr(1, a.pathname.lastIndexOf("/") - 1)
        let stream = a.pathname.substr(a.pathname.lastIndexOf("/") + 1)
        app = app.replace("...vhost...", "?vhost=")
        if (app.indexOf("?") >= 0) {
            let params = app.substr(app.indexOf("?"))
            app.substr(0, app.indexOf("?"))
            if (params.indexOf("vhost=") > 0) {
                vhost = params.substr(params.indexOf("vhost=" + "vhost=".length))
                if (vhost.indexOf("&") > 0) {
                    vhost = vhost.substr(0, vhost.indexOf("&"))
                }
            }
        }
        if (a.hostname === vhost) {
            let re = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/
            if (re.test(a.hostname)) {
                vhost = "__defaultVhost__";
            }
        }
        let schema = "rtmp"
        if (url.indexOf("://")) {
            schema = url.substr(0, url.indexOf("://"))
        }
        let port = a.port
        if (!port) {
            if (schema === 'http') {
                port = 80;
            } else if (schema === 'https') {
                port = 443;
            } else if (schema === 'rtmp') {
                port = 1935;
            }
        }
        let ret = {
            url: url,
            schema: schema,
            server: a.hostname,
            port: port,
            vhost: vhost,
            app: app,
            stream: stream
        };
        this.fill_query(a.search, ret)
        if (!ret.port) {
            if (schema === 'webrtc' || schema === 'rtc') {
                if (ret.user_query.schema === 'https') {
                    ret.port = 443;
                } else if (window.location.href.indexOf('https://') === 0) {
                    ret.port = 443;
                } else {
                    // For WebRTC, SRS use 1985 as default API port.
                    ret.port = 1985;
                }
            }
        }
        return ret
    }
    fill_query(query_string, obj) {
        obj.user_query = {}
        if (query_string.length === 0) {
            return;
        }
        if (query_string.indexOf("?") >= 0) {
            query_string = query_string.split("?")[1];
        }
        let queries = query_string.split("&");
        for (let i = 0; i < queries.length; i++) {
            let elem = queries[i];
            let query = elem.split("=");
            obj[query[0]] = query[1];
            obj.user_query[query[0]] = query[1];
        }
        if (obj.domain) {
            obj.vhost = obj.domain;
        }
    }
}

// 1 加入观察者模式
// 2 添加回调类型 play read error end dbclick click
// 3 发布npm包 webo-video.js

// 基于videojs 播放 flv | webrtc | rtmp | mp4 | hls 等视频格式
export class weboVideojs {

    // 播放状态 null ready playing played error
    playStatus = null;

    // 断流配置
    cutoutConfig = {
        max: 10, // 最大重复次数
        num: 0, //  当前时间重复次数
        time: 0 // 当前时间
    }

    // flv 倍数播放配置
    flvConfig = {
        maxDelta: 1, // 最大跳帧延迟
        rate1: 1.5, // 倍数播放1
        maxRateDelta: 1, //最大倍数播放延迟
        rate2: 1.5, // 倍数播放2
    }

    // video 配置
    videoConf = {
        url: '',
        type: '', // flv | webrtc | rtmp | mp4
        el: '', // 可以传video dom 或者视频容器盒子
        isLive: false, //是否直播
    }

    // 初始化订阅者 
    eventObj = {};

    // 播放器
    player = null;

    // 容器
    el = null;

    // web rtc 容器
    RTC = null;

    // 定时器
    interTime = 0;

    constructor(myConfig, videoConfig) {

        // video 配置
        this.videoConf = this.initVideoConfig(myConfig);

        // 初始化播放器
        this.initPlay(videoConfig);
    }

    // 初始化播放器
    initPlay(videoConfig) {
        // videojs 配置
        this.player = videojs(this.el, this.initConfig(videoConfig), () => {
            this.player.on('ready', (e) => {
                this.emit('ready');
                this.setPlayStatus('ready');
            });
            this.player.on('webkitbeginfullscreen', () => {});
            this.player.on('loadedmetadata', () => {});
            this.player.on('click', e => {
                // this.el.play();
                this.emit('click')
            });
            this.player.on('load', (e) => {
                this.emit('load')
            })
            this.player.on('play', () => {
                this.emit('play');
                this.clearTime();
                this.setPlayStatus('playing');
                // 开启定时器
                this.createInterTime();
            });

            this.player.on('error', (e) => {
                this.emit('error', e);
                this.setPlayStatus('error')
            });
            this.player.on('ended', () => {
                this.emit('ended');
                this.setPlayStatus('played')
            });
            this.player.on('data', (e) => {});
        });
    }

    // this.el 事件监听
    eventFun(type) {
        let self = this;

        function onClcik() {
            self.emit('click')
        }
        let funObj = {
            add: () => {
                this.el.addEventListener('click', onClcik);
            },
            remove: () => {
                this.el.removeEventListener('click', onClcik);
            }
        }
        funObj[type]();
    }

    // 事件监听
    on(eventName, cb) {
        if (!this.eventObj[eventName]) this.eventObj[eventName] = [];
        this.eventObj[eventName].push(cb);
    }

    // 取消监听
    off(eventName) {
        this.eventObj[eventName] = []
    }

    // 发布
    emit(eventName, ...rest) {
        if (!this.eventObj[eventName]) return;
        this.eventObj[eventName].forEach(cb => {
            cb(rest)
        });
    }

    // 默认配置config
    initConfig(config) {
        // 默认配置
        let params = {
            autoplay: true,
            controls: false,
        }
        if (this.videoConf.type == 'flv') {
            // flv 默认配置
            params = {
                autoplay: true, //自动播放
                controls: true, //用户可以与之交互的控件
                loop: true, //视频一结束就重新开始
                muted: true, //默认情况下将使所有音频静音
                // aspectRatio: "16:9",//显示比率
                fullscreen: {
                    options: {
                        navigationUI: 'auto'
                    }
                },
                techOrder: ["html5", "flvjs"], // 兼容顺序
                flvjs: {
                    mediaDataSource: {
                        isLive: false,
                        cors: true,
                        withCredentials: false,
                    },
                    config: {

                        autoCleanupMaxBackwardDuration: 20,
                        autoCleanupMinBackwardDuration: 20,
                        lazyLoadMaxDuration: 10,
                        lazyLoadRecoverDuration: 10,

                        // enableWorker: true, // 启用分离的线程进行转换
                        enableStashBuffer: false, // 关闭IO隐藏缓冲区
                        stashInitialSize: 128, // 减少首帧显示等待时长

                        reuseRedirectedURL: true, //重用301/302重定向url，用于随后的请求，如查找、重新连接等。
                        autoCleanupSourceBuffer: true //自动清除缓存
                    },
                    // sources: [{ src: params.url, type: "video/x-flv" }]
                }
            }
        }
        return Object.assign({}, params, config || {})
    }

    // 默认配置myConfig
    initVideoConfig(config) {
        if (!config.el) return console.error('视频容器必传');
        let isLive = config.type == 'mp4' ? false : true

        if (config.el.nodeName == 'VIDEO') {
            this.el = config.el;
        } else {
            this.el = document.createElement('video');
            this.el.setAttribute('class', 'video-js');
            this.el.setAttribute('autoplay', 'autoplay');

            config.el.append(this.el);
        }

        // 初始化监听双击事件和单机事件
        // if (this.el) {
        //     this.eventFun('add');
        // }

        return Object.assign({}, {
            url: '',
            type: '', // flv | webrtc | rtmp | mp4
            el: '', // 可以传video dom 或者视频容器盒子
            isLive, //是否直播
        }, config);
    }

    // 获取播放器
    getPlayer() {
        return this.player;
    }

    // 获取播放容器
    getVideoEL() {
        return this.el;
    }

    // 断开连接
    dispose() {
        // 销毁事件
        // if (this.el) {
        //     this.eventFun('remove');
        // }
        // this.player.dispose();
        this.player = null;
        this.el = null;
        this.closeRTC();
        this.clearTime();
    }

    clearPlayer() {
        this.player.dispose();
        this.dispose();
    }

    // 关闭RTC
    closeRTC() {
        if (this.RTC) {
            this.RTC.close();
            this.RTC = null;
        }
    }

    // 关闭定时器
    clearTime() {
        if (this.interTime) {
            clearInterval(this.interTime)
        }
    }

    // 当视频开始播放 创建一个定时器
    createInterTime() {
        this.interTime = setInterval(() => {
            // 是否直播
            if (this.videoConf.isLive && this.player && this.player.buffered) {
                let end = this.player.buffered().end(0); //获取当前buffered值(缓冲区末尾)
                let delta = end - this.player.currentTime(); //获取buffered与当前播放位置的差值
                // console.log('流的最后一帧', end, '当前播放帧', this.player.currentTime(), '延迟', delta, '重复次数', this.cutoutConfig.num);
                //当视频开始播放 计算播放时间
                if (this.player.currentTime() == this.cutoutConfig.time) {
                    if (this.cutoutConfig.max == this.cutoutConfig.num) {
                        this.cutoutConfig.num = 0;
                        this.clearTime();
                        this.closeRTC();
                        this.emit('staermError');
                        this.setPlayStatus('error')
                    }
                    this.cutoutConfig.num += 1;

                } else {
                    this.cutoutConfig.time = this.player.currentTime();
                    this.cutoutConfig.num = 0
                }
            }

            // flv 跳帧
            if (this.videoConf.type == 'flv' && this.player && this.player.buffered) {
                let end = this.player.buffered().end(0); //获取当前buffered值(缓冲区末尾)
                let delta = end - this.player.currentTime(); //获取buffered与当前播放位置的差值
                // console.log('流的最后一帧', end, '当前播放帧', this.player.currentTime(), '延迟', delta, '重复次数', this.cutoutConfig.num);
                // 延迟过大，通过跳帧的方式更新视频
                if (delta > this.flvConfig.maxDelta) {
                    // 跳帧
                    // this.player.currentTime = this.player.buffered().end(0) - 0.5;
                    // 倍数播放
                    this.player.playbackRate(this.flvConfig.rate1); // 1.5
                } else {
                    // 恢复正常倍速
                    this.player.playbackRate(1);
                }
            }

            // 当视频正在播放
            if (this.getPlayStatus() == 'playing') {
                this.emit('playing')
            }

            if (this.getPlayStatus() == 'read') {
                this.cutoutConfig.num += 1;
                if (this.cutoutConfig.num == this.cutoutConfig.max) {
                    this.emit('error', { msg: '视频播放失败' })
                }
            }
        }, 1000);
    }

    // 设置视频配置
    setVideoConfig(obj = { url: '', type: '' }) {
        this.videoConf = this.initVideoConfig(obj);
    }

    // 播放视频
    play() {
        switch (this.videoConf.type) {
            case "mp4":
                // mp4 直接将地址给this.demo
                if (!this.videoConf.url.endsWith('.mp4')) return console.error('视频地址格式不正确');
                this.el.src = this.videoConf.url;
                break;
            case "webrtc":
                if (!this.videoConf.url.startsWith('webrtc')) return console.error('视频地址格式不正确');
                this.RTC = new RTC(this.videoConf.url);
                this.RTC.onaddstream = (e) => {
                    this.el.srcObject = e.stream;
                    // this.el.click();
                    this.emit('staermLoad')
                }
                this.RTC.play(this.videoConf.url).then(res => {})
                break;
            case "hls":
                break;
            case "flv":
                if (!this.videoConf.url.endsWith('.flv')) return console.error('视频地址格式不正确');
                // 设置视频流
                this.player.src([{ src: this.videoConf.url, type: "video/x-flv" }]);
                this.player.load(this.videoConf.url);
                this.player.play();
                // setTimeout(() => {

                // this.el.click();
                // }, 1000);

                break;
        }
    }

    /**
     * 设置播放状态
     * @param {*} type 
     */
    setPlayStatus(type) {
        this.playStatus = type;
    }

    // 返回播放状态
    getPlayStatus() {
        return this.playStatus;
    }

    // 设置buffer数据
    setBuffer(data) {
        this.player.appendBuffer(data)
    }

    // 设置静音
    setMuted(val) {
        this.player.muted(Boolean(val));
    }
}

const weboVideo = (myConfig, videoConfig) => {
    return new weboVideojs(myConfig, videoConfig)
}

export default weboVideo;