# go-cqhttp-jsbot node.js API更新记录

  更新内容 api 示例使用方法见 test.js 代码

  基本使用方式：

  ```javascript
  // 引入平台 SDK
  const BotSDK = require('./go-cqhttp-jsbot.js').BotSDK
  // 实例化一个平台，框架插件监听地址、用户名、密码、事件上传路径、上传监听端口，不写则默认80
  const botSDK = new BotSDK('localhost', 8888);
  // 创建一个监听 bot 对象（已挂载至框架内的 qq）
  let bot = botSDK.createBot('123456789', 52566);
  // -------------
  ... 可在 test.js 里参照 api 示例使用 bot.xxx 形式注册或调用相关指令功能。
  // -------------
  ```

## v1.0.4
* 实例机器人添加 CQCode 生成方法如 bot.CQCode.At('123456789')
* 修复被艾特时没有判断正确的问题

## v1.0.0
  
* 完成主程序框架的逻辑封装，实现消息分发
* 封装 bot 操作 api 支持统一事件、私聊、群聊消息监听
* 支持快速鉴定指定群消息，自定义快捷指令
* 实现发送私聊，群私聊，群聊
* 当前仅完成一些常用方法，许多其他事件没有还没有处理好分发，其他请求操作可以根据官方文档使用内置 http 请求完成 post 请求
* 本人代码水平不高，会尽力去完善，有问题或者可以改善的地方还请多多指教
