"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CQBotSDK = void 0;
const axios_1 = __importDefault(require("axios"));
const Robot_1 = require("./bot/Robot");
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
/* **************************************************************
 * 机器人的主类
 *    使用工厂模式实例化一个机器人视为开启一个机器人的操控，该机器人的
 *    动作、事件均由此类的公共方法实现，通过其他各模块进行扩展维护。
 * 开发思路
 *    1、机器人实例化的机器人通过 Map 存储，主控信息轮询获取获消息的
 *        qq 然后通过 Map 查询并分发下去
 *    2、可以通过机器人配置默认类，仅在构造函数传入 qq 号即可完成一个
 *        机器人的实例化。
 *    3、通过 SDK 首先实例化一个平台对象，传入框架服务器的相关信息
 ***************************************************************/
/********************** Tools Functions *************************/
function unicode2string(unicode) {
    let res = unicode.replace(/\\\\/g, '\\');
    return res ? res : '[]';
}
// 处理一些无法被 JSON 解析的特殊字符例如 ASCII 为 0~28 的
function dealSomeStr(strCode) {
    let obj = strCode.split('');
    obj.forEach((item, index) => {
        if (item.charCodeAt(0) <= 28) {
            obj[index] = '';
        }
    });
    return obj.join('');
}
/**
 * @param {Object} dataPack 数据包
 * @描述 格式化数据包规范
 * @returns 如果找不到类型则返回null
 */
function getFormatData(dataPack) {
    let formatData = new Object();
    switch (dataPack.post_type) {
        // 私聊，群聊类型
        case 'message': {
            switch (dataPack.message_type) {
                // 群组消息
                case 'group':
                    Object.assign(formatData, {
                        fromUser: dataPack.sender.user_id,
                        fromGroup: dataPack.group_id,
                        rawMessage: filterAt(dataPack.raw_message, dataPack.self_id),
                        robot: dataPack.self_id,
                        isAt: isAt(dataPack.raw_message, dataPack.self_id),
                        QQInfo: {
                            card: dataPack.sender.card,
                            nickname: dataPack.sender.nickname
                        },
                        success: true
                    });
                    break;
                // 私聊消息
                case 'private':
                    Object.assign(formatData, {
                        fromUser: dataPack.user_id,
                        rawMessage: filterAt(dataPack.raw_message, dataPack.self_id),
                        robot: dataPack.self_id,
                        isAt: isAt(dataPack.raw_message, dataPack.self_id),
                        QQInfo: {
                            nickname: dataPack.sender.nickname // QQ 昵称
                        },
                        success: true
                    });
                    break;
            }
            break;
        }
        // 通知事件
        case 'notice':
            Object.assign(formatData, {
                fromUser: {},
                fromGroup: {},
                rawMessage: '',
                robot: dataPack.self_id,
                isAt: false,
                QQInfo: {},
                user_id: dataPack.user_id,
                group_id: dataPack.group_id,
                notice_type: dataPack.notice_type,
                operator: dataPack.operator_id,
                sub_type: dataPack.sub_type,
                success: true
            });
            break;
    }
    Object.assign(formatData, {
        type: dataPack.post_type == 'message' ? dataPack.message_type : (dataPack.post_type == 'notice' ? 'notice' : '')
    });
    return formatData;
}
// 过滤 @ 机器人
function filterAt(str, loginQQ) {
    if (!str) {
        return '';
    }
    let reg = new RegExp(`\\[CQ:at,qq=${loginQQ}\\]`, 'g');
    return str.replace(reg, '').trim();
}
function isAt(str, loginQQ) {
    return (str.indexOf(`[CQ:at,qq=${loginQQ}]`) != -1);
}
/****************************************************************/
/**
 * 框架类，实例化以后以 create 方法传入 qq 号实例化一个机器人
 */
class CQBotSDK {
    /**
     * 初始化一个机器人框架
     * @param {string} host 框架主机地址 127.0.0.1
     * @param {number} postPort 上报端口，如果多q均可使用该端口，配置时多个q也需要同一个反向 port 默认5701
     * @param {string} postPath 上报路径如 '/botmsg'，反向 post url 'http://127.0.0.1:5701/botmsg',默认为空
     */
    constructor(host, postPort = 5701, postPath = '') {
        this.botID = 0; // bot ID
        this.host = '127.0.0.1';
        this.postPort = 5701; // 上报端口
        this.postPath = ''; // 上报路径
        this.botList = new Map();
        this.host = host;
        this.postPort = postPort;
        this.postPath = postPath;
        // 有设置上报地址则采用
        if (this.postPort) {
            // 创建事件上报监听服务
            let app = (0, express_1.default)();
            app.use((0, body_parser_1.default)({
                extended: false
            }));
            app.post('/' + this.postPath, (req, response) => {
                let objData = req.body;
                // 遍历数据包然后分发下去且过滤掉自己发送的消息
                let resData = getFormatData(objData);
                if (resData && resData.success && resData.robot !== resData.fromUser) {
                    // console.log(resData);
                    // 获取 bot 对象并正确将消息分发下去
                    let botArray = this.botList.get(String(resData.robot));
                    if (botArray) {
                        botArray.forEach(bot => {
                            bot.fire(resData.type, resData);
                        });
                    }
                }
                response.send();
            });
            app.listen(this.postPort, '0.0.0.0', () => {
                console.log('post listen start for ' + this.postPort + '...');
            });
        }
        else {
            /*
            let timeStamp = Math.round(new Date().getTime() / 1000)
            let ws: WebSocket = null;
            let timeCount = 0;
            let isReceiveHeart: boolean = false;
            // 没有上报地址则使用 ws
            let initWs = () => {
              if (ws) {
                ws.removeAllListeners()
                ws.terminate();
              }
              timeCount = 0;
              ws = new WebSocket(`${url.replace('http', 'ws')}/ws?user=${user}&timestamp=${timeStamp}&signature=${md5(user + "/ws" + md5(pass) + timeStamp.toString())}`)
              console.log('ws started ...');
              // 接受信息
              ws.on('message', (message: String) => {
                if (message.toString() == '{"type":"heartbeatreply"}') {
                  // 返回的心跳检测数据
                  // console.log(message.toString())
                  isReceiveHeart = true
                  return;
                }
                let data = message.toString().replace(/\\\\/g, '\\');
                let originData: Array<any> = null;
                if (data && 'string' == typeof data) {
                  let res = data.split('\n')
                  res.forEach((elm, index) => {
                    // 测试崩溃
                    JSON.parse(unicode2string(elm));
                    res[index] = JSON.parse(dealSomeStr(unicode2string(elm)))
                  })
                  originData = res
                } else {
                  originData = data ? [JSON.parse(dealSomeStr(unicode2string(JSON.stringify(data))))] : [];
                }
                for (let key in originData) {
                  let obj = originData[key];
                  // 排除掉来自机器人的消息
                  if (obj.fromqq && obj.fromqq.qq == obj.logonqq) {
                    continue
                  }
                  // 遍历数据包然后分发下去且过滤掉自己发送的消息
                  let resData = (getFormatData(obj) as any)
                  if (resData && resData.success && resData.robot !== resData.fromUser) {
                    // 获取 bot 对象并正确将消息分发下去
                    let botArray = this.botList.get(String(resData.robot));
                    if (botArray) {
                      botArray.forEach(bot => {
                        bot.fire(resData.type, resData)
                      })
                    }
                  }
                }
              })
              ws.on('error', error => {
                // console.log('Error:', error)
                console.log('connect closed and will reconnect ws...');
                initWs();
              })
              ws.on('close', info => {
                console.log('connect closed ... info:' + info + ' , will reconnect ws...');
                initWs();
              })
            }
      
            let timeRepeatFun = () => {
              setTimeout(timeRepeatFun, 5000);
              try {
                timeCount += 5;
                // console.log('----------------------------------')
                // console.log('send heart , ws hold ' + timeCount + 's ...')
      
              } catch (error) {
                initWs();
              }
              isReceiveHeart = false;
              setTimeout(() => {
                // 收不到心跳 1s 后进行重连
                if (!isReceiveHeart) {
                  initWs();
                }
              }, 1000)
            }
            setTimeout(() => {
              timeRepeatFun();
            }, 5000)
      
            initWs();
            */
        }
    }
    // 为每个 bot 创建自己的 axios 请求
    createHttp(listPort) {
        let botHttp = axios_1.default.create({
            baseURL: `http://${this.host}:${listPort}`,
            timeout: 1000 * 20 // 超时时间 20s
        });
        botHttp.defaults.withCredentials = true;
        // 请求拦截器,本后台管理系统的所有请求均带上 token
        botHttp.interceptors.request.use(function (config) {
            config.headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
            };
            return config;
        }, function (error) {
            // axios发生错误的处理
            return Promise.reject(error);
        });
        // 响应拦截器,不要那么多复杂数据了直接返回 data 就行
        botHttp.interceptors.response.use(function (response) {
            let returnData = response.data;
            try {
            }
            catch (error) {
                console.log(error);
            }
            return returnData;
        }, function (error) {
            // axios请求服务器端发生错误的处理
            return Promise.reject(error);
        });
        return botHttp;
    }
    /**
     * 创建一个 bot
     * @param qq QQ号码
     * @param listPort qq监听的正向端口
     */
    createBot(qq, listPort) {
        qq = String(qq);
        ++this.botID;
        const bot = new Robot_1.Robot(qq, this.createHttp(listPort), this.botID);
        let botArray = this.botList.get(qq);
        if (!botArray) {
            botArray = [];
        }
        botArray.push(bot);
        this.botList.set(qq, botArray);
        return bot;
    }
    /**
     * 销毁一个 bot
     * @param botID bot的id
     */
    destroyBot(bot) {
        let botArray = this.botList.get(String(bot.QQ));
        if (!botArray) {
            return;
        }
    }
}
exports.CQBotSDK = CQBotSDK;
// 防止异常中断
process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err);
});
