# webo-video

## 安装
```javascript 
npm install webo-video
```
该库依赖 video.js 以及 flv.js 安装 `webo-video` 之后可直接 `import videojs from "video.js"` 以及 `import flv.js from "flv.js"`

## 使用实例
```javascript
// 创建 webo player
import weboVideo from "webo-video";

let config = {
    el:el, // dom元素 可以传video标签 也可以传div 标签
    isLive: true, //是否直播
    type: '', //播放类型 flv webrtc mp4
    url: '',// 视频地址
}
let videojsConfig = {};  // videojs 配置 具体配置查看videojs官网使用 https://docs.videojs.com/
let player: any = weboVideo(config, videojsConfig);
player.play();

// 创建 rtc 示例 参考swms rtc.js使用方式
import { RTC } from "webo-video";
let sdk = new RTC(config.url);
sdk.onaddstream = (event) => {
   el.srcObject = event.stream;
}
sdk.play(url).then(res => {
});
```

## 方法
方法名 | 说明 | 参数
----|----|---
play| 播放视频 | -
setBuffer | 设置视频Buffer （视频为 flv 生效）| bufferData
getPlayStatus | 获取播放状态（null  ready playing played error） | -
setVideoConfig | 设置视频配置 （config） | config
on | 监听事件 | callback
off| 取消事件监听 | -
dispose | 断开连接 | -
clearPlayer | 断开连接并且删除 video 容器 | -
getPlayer | 获取播放器 | -
getVideoEL | 获取video 容器 | -
setMuted | 设置静音状态 | boolean


## 事件回调
```javascript
  // 使用示例
  player.on(event, callback)
```
事件列表
事件名 | 说明 | 参数
------ | ------ | -----
ready | 视频读取完成 | -
click | 视频点击 | -
load | 视频加载完成 | -
play | 视频播放 | -
playing | 视频播放中 | -
error | 视频播放错误 | objecj
ended | 视频播放结束 | -
staermError | 视频流播放错误 | -
staermLoad | 视频流加载（视频类型为 webrtc时生效）


