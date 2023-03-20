const BotSDK = require('./index.js').CQBotSDK
const botSDK = new BotSDK('localhost', 8888);

let bot = botSDK.createBot('123456789', 52566);

const qs = require('qs');
// bot.onPrivateMsg(pack => {
//   console.log('private', pack)
// })

// bot.onGroupMsg(pack => {
//   console.log('group', pack)
// })

// bot.onEventMsg(pack => {
//   console.log('event',pack)
// })

setTimeout(() => {
  // 私聊消息
  // bot.sendPrivateMsg(987654321,'今天是个不错的天气');

  // 群临时消息
  // bot.sendGroupPrivateMsg(233333333,987654321,'群私聊你，收到消息了吗？')

  // 发送群消息
  // bot.sendGroupMsg(233333333,'总有云开日出世时候')

  // 好友私聊图片
  // bot.sendPrivateImg(987654321, "https://b3logfile.com/avatar/1549774471797_1551230872113.png?imageView2/1/w/128/h/128/interlace/0/q/100")

  // 群私聊图片
  // bot.sendGroupPrivateImg(233333333, 987654321, "https://b3logfile.com/avatar/1549774471797_1551230872113.png?imageView2/1/w/128/h/128/interlace/0/q/100", true)

  // 群发送图片
  // bot.sendGroupImg(233333333, "https://jiangck.com/favicon.ico")
  // bot.sendGroupImg(233333333, "https://b3logfile.com/avatar/1549774471797_1551230872113.png?imageView2/1/w/128/h/128/interlace/0/q/100")


  // 指定群接收消息
  // bot.setOnGroupMsg('233333333', (data) => {
  //   console.log(111,data)
  // })

  // 注册私聊指令
  // bot.regPrivateCmd(["你好","哈喽","hello","233"],(data)=>{
  //   bot.sendPrivateImg(data.fromUser,"https://jiangck.com/favicon.ico")
  // })

  // 注册群聊指令
  // bot.regGroupCmd(233333333, ["你好", "How are you?"], (data) => {
  //   if (data.rawMessage == '你好') {
  //     bot.sendGroupMsg(data.fromGroup, '你也好呀~');
  //   } else if (data.rawMessage == 'How are you?') {
  //     bot.sendGroupMsg(data.fromGroup, "I'm fine, thank you. And you?");
  //   }
  // })

  // 发送语音
  // bot.sendGroupRecord(233333333,'https://jiangck.com/resource/%E8%B4%B9%E7%8E%89%E6%B8%85-%E4%B8%80%E5%89%AA%E6%A2%85.mp3')

  // 提示
  console.log('执行成功')
}, 1000)