/* eslint-disable no-cond-assign */
import videojs from 'video.js';
// flv 插件
import "videojs-flvjs-es6";

// rtc 类
class RTC {
    constructor(url) {
        this.url = url;
        this.defaultPath = '/rtc/v1/play/';
        // 初始化配置
        this.pc = new RTCPeerConnection({
            sdpSemantics: "unified-plan",
        });
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
                new RTCSessionDescription({ type: 'answer', sdp: session.data.sdp })
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
        apiUrl = schema + '//' + urlObject.server + ':' + port + api;
        for (let key in urlObject.user_query) {
            if (key !== 'api' && key !== 'play') {
                apiUrl += '&' + key + '=' + urlObject.user_query[key];
            }
        }
        let apiUrl = apiUrl.replace(api + '&', api + '?');
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
            app.app.substr(0, app.indexOf("?"))
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
export default class weboVideo {
    constructor(videoConfig, myConfig) {
        // 断流配置
        this.cutoutConfig = {
            max: 10, // 最大重复次数
            num: 0, //  当前时间重复次数
            time: 0 // 当前时间
        };
        // flv 倍数播放
        this.flvConfig = {
            maxDelta: 1, // 最大跳帧延迟
            rate1: 1.5, // 倍数播放1
            maxRateDelta: 1, //最大倍数播放延迟
            rate2: 1.5, // 倍数播放2
        }

        // video 配置
        this.videoConf = this.initVideoConfig(videoConfig);

        // 初始化订阅者 
        this.eventObj = {}

        // 初始化播放器
        this.initPlay(myConfig);
    }

    // 初始化播放器
    initPlay(myConf) {
        // videojs 配置
        this.player = videojs(this.el, this.initConfig(myConf), () => {

            this.player.on('ready', (e) => {
                this.emit('ready')
            });
            this.player.on('webkitbeginfullscreen', () => {});
            this.player.on('loadedmetadata', () => {});
            this.player.on('click', e => {
                this.el.play();
                this.emit('click')
            });
            this.player.on('load', (e) => {
                this.emit('load')
            })
            this.player.on('play', () => {

                this.emit('play');
                this.clearTime()

                this.interTime = setInterval(() => {
                    // 是否直播
                    if (this.videoConf.isLive && this.player) {
                        //当视频开始播放 计算播放时间
                        if (this.player.currentTime() == this.cutoutConfig.time) {
                            this.cutoutConfig.num += 1;
                            if (this.cutoutConfig.max == this.cutoutConfig.num) {
                                this.cutoutConfig.num = 0;
                                this.clearTime();
                                this.closeRTC();
                                this.emit('staermError');
                            }
                        } else {
                            this.cutoutConfig.time = this.player.currentTime();
                            this.cutoutConfig.num = 0
                        }
                    }

                    // flv 跳帧
                    if (this.videoConf.type == 'flv' && this.player && this.player.buffered) {
                        let end = this.player.buffered().end(0); //获取当前buffered值(缓冲区末尾)
                        let delta = end - this.player.currentTime(); //获取buffered与当前播放位置的差值
                        console.log('流的最后一帧', end, '当前播放帧', this.player.currentTime(), '延迟', delta, '重复次数', this.cutoutConfig.num);
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

                }, 1000);
            });

            this.player.on('error', (e) => {
                this.emit('error', e)
            });
            this.player.on('ended', () => {
                this.emit('ended')
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

    off(eventName) {
        this.eventObj[eventName] = []
    }

    emit(eventName, ...rest) {
        if (!this.eventObj[eventName]) return;
        this.eventObj[eventName].forEach(cb => {
            cb(rest)
        });
    }

    // 默认配置config
    initConfig(config) {
        return Object.assign({}, {
            autoplay: true,
            controls: false,
        }, config || {})
    }

    // 默认配置videoConfig
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

    getVideoEL() {
        return this.el;
    }

    // 断开连接
    dispose() {
        // 销毁事件
        // if (this.el) {
        //     this.eventFun('remove');
        // }
        this.player.dispose();
        this.player = null;
        this.el = null;
        this.closeRTC();
        this.clearTime();

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
                    this.el.click();
                    this.emit('staermLoad')
                }
                this.RTC.play(this.videoConf.url).then(res => {
                    console.log('视频播放')
                })
                break;
            case "hls":
                break;
            case "flv":
                if (!this.videoConf.url.endsWith('.flv')) return console.error('视频地址格式不正确');
                // 设置视频流
                this.player.src([{ src: this.videoConf.url, type: "video/x-flv" }]);
                this.player.load(this.videoConf.url);

                setTimeout(() => {
                    this.player.play();
                    this.el.click();
                }, 1000);

                break;
        }
    }

    // 设置buffer数据
    setBuffer(data) {
        this.player.appendBuffer(data)
    }
}