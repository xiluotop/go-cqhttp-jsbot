"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Robot = void 0;
const Event_1 = require("../core/Event");
const qs_1 = __importDefault(require("qs"));
const CQCode_1 = __importDefault(require("./CQCode"));
/**
 * 机器人类，有回调事件，上发操作等功能。
 */
class Robot extends Event_1.Event {
    constructor(qq, http, botID) {
        super();
        this.qq = '';
        this.botID = '';
        this.http = null;
        this._onPrivateMsg = [];
        this._onGroupMsg = [];
        this._onEventMsg = [];
        this.groupFunMap = null;
        this.privateCmdAction = null;
        this.groupCmdAction = null;
        this.qq = String(qq);
        this.http = http;
        this.botID = botID;
        this.groupFunMap = new Map();
        this.privateCmdAction = new Map();
        this.groupCmdAction = new Map();
        this.on('private', pack => {
            if (this._onPrivateMsg) {
                this._onPrivateMsg.forEach(fun => {
                    if (fun) {
                        fun(pack);
                    }
                });
            }
            // 遍历注册指令
            this.privateCmdAction.forEach((doAction, cmdArray) => {
                if (cmdArray.includes(pack.rawMessage)) {
                    doAction(pack);
                }
            });
        });
        this.on('group', pack => {
            if (this._onGroupMsg) {
                this._onGroupMsg.forEach(fun => {
                    if (fun) {
                        fun(pack);
                    }
                });
            }
            let groupFun = this.groupFunMap.get(String(pack.fromGroup));
            if (groupFun) {
                groupFun(pack);
            }
            // 遍历注册指令
            this.groupCmdAction.forEach((doAction, cmdArray) => {
                if (cmdArray.includes(pack.rawMessage) && (doAction.group == pack.fromGroup)) {
                    doAction(pack);
                }
            });
        });
        this.on('notice', pack => {
            if (this._onEventMsg) {
                this._onEventMsg.forEach(fun => {
                    if (fun) {
                        fun(pack);
                    }
                });
            }
        });
    }
    /**
     * 获取 CQ Code 模板对象
     */
    get CQCode() {
        return CQCode_1.default;
    }
    /**
     * 返回实例化机器人的请求器
     */
    get httpRequest() {
        return this.http;
    }
    /**
     * 返回机器人序号 ID
     */
    get id() {
        return this.botID;
    }
    /**
     * 返回机器人 QQ 号
     */
    get QQ() {
        return this.qq;
    }
    /**
     * 当私聊信息触发时，回调时带回消息包
     * @param resPack 参数包
     * ```
     * {
     *  fromUser:   发送者QQ
     *  rawMessage：接收的消息
     *  robot：     框架QQ
     *  isAt：      机器人是否被 at 的
     *  OOInfo：{card,nickname} // 昵称，群昵称
     *  success：   成功状态
     * }
     * ```
     */
    onPrivateMsg(fun) {
        this._onPrivateMsg.push(fun);
    }
    /**
     * 当群聊消息触发时，回调时带回消息包
     * @param resPack 参数包
     * ```
     * {
     *  fromUser:   发送者QQ
     *  fromGroup:  接收群
     *  rawMessage：接收的消息
     *  robot：     框架QQ
     *  isAt：      机器人是否被 at 的
     *  OOInfo：{card,nickname} // 昵称，群昵称
     *  success：   成功状态
     * }
     * ```
     */
    onGroupMsg(fun) {
        this._onGroupMsg.push(fun);
    }
    /**
     * 绑定特定群组回调消息
     * @param group 群号
     * @param fun   回调函数，返回的参数为消息数据包
     */
    setOnGroupMsg(group, fun) {
        this.groupFunMap.set(String(group), fun);
    }
    getOnGroupMsg(group) {
        return this.groupFunMap.get(String(group));
    }
    /**
     * 当操作事件触发时，回调时带回消息包
     */
    onEventMsg(fun) {
        this._onEventMsg.push(fun);
    }
    /**
     * 快速注册一个私聊指令并执行对应的方法
     * @param {Array<string>} cmd       监听的指令
     * @param doAction  要执行的动作，回调参数为发送者相关信息
     */
    regPrivateCmd(cmd, doAction) {
        this.privateCmdAction.set(cmd, doAction);
    }
    /**
     * 快速注册一个群要使用的指令并执行对应的方法
     * @param group     监听的目标群
     * @param {Array<string>} cmd       监听的指令
     * @param doAction  要执行的动作，回调参数为发送者相关信息
     */
    regGroupCmd(group, cmd, doAction) {
        Object.assign(doAction, {
            group
        });
        this.groupCmdAction.set(cmd, doAction);
    }
    /********************************************************** 工具 tools ************************************************************/
    /**
     * 发送好友私聊消息
     * @param toqq 目标 QQ
     * @param text 发送的文本
     * @param type 文本类型：xml,json,可不传
     * @return httpRequestPromise 返回请求的 promise
     */
    sendPrivateMsg(toqq, text) {
        return this.http.post('/send_msg', qs_1.default.stringify({
            message_type: 'private',
            user_id: toqq,
            message: text,
        }));
    }
    /**
     * 发送群临时会话消息
     * @param fromGroup 来自群号
     * @param toqq 目标 QQ
     * @param text 发送文本
     * @return httpRequestPromise 返回请求的 promise
     */
    sendGroupPrivateMsg(fromGroup, toqq, text) {
        return this.http.post('/send_private_msg', qs_1.default.stringify({
            user_id: toqq,
            group_id: fromGroup,
            message: text,
        }));
    }
    /**
     * 发送群组消息
     * @param toGroup 目标群
     * @param text 文本
     * @param anonymous 是否匿名，默认：false
     * @return httpRequestPromise 返回请求的 promise
     */
    sendGroupMsg(toGroup, text, anonymous = false) {
        return this.http.post('/send_msg', qs_1.default.stringify({
            message_type: 'group',
            group_id: toGroup,
            message: text,
            anonymous
        })).catch(err => {
            console.log('错误', err);
        });
    }
    /**
     * 私聊发送图片
     * @param toqq      发送目标 qq
     * @param imgSrc    图片资源：url,base64,路径均可
     * @param flashpic  是否发送闪照，默认 false
     * @return httpRequestPromise 返回请求的 promise
     */
    sendPrivateImg(toqq, imgSrc, flashpic = false) {
        return this.sendPrivateMsg(toqq, `[CQ:image,file=${imgSrc},type=${flashpic ? 'flash' : 'show'},id=40004]`);
    }
    /**
     * 发送群临时私聊图片
     * @param fromGroup 群号
     * @param toqq      目标 qq
     * @param imgSrc    图片资源
     * @param flashpic  是否闪照
     * @return httpRequestPromise 返回请求的 promise
     */
    sendGroupPrivateImg(fromGroup, toqq, imgSrc, flashpic = false) {
        return this.sendGroupPrivateMsg(fromGroup, toqq, `[CQ:image,file=${imgSrc},type=${flashpic ? 'flash' : 'show'},id=40004]`);
    }
    /**
     * 向群发送图片
     * @param togroup  目标群号
     * @param imgSrc   图片资源
     * @param flashpic 是否为闪照
     * @return httpRequestPromise 返回请求的 promise
     */
    sendGroupImg(togroup, imgSrc, flashpic = false) {
        return this.sendGroupMsg(togroup, `[CQ:image,file=${imgSrc},type=${flashpic ? 'flash' : ''},id=40004,subType=0]`);
    }
    /**
     * 私聊发送语音
     * @param toqq      发送目标 qq
     * @param recordSrc    图片资源：url,base64,路径均可
     * @return httpRequestPromise 返回请求的 promise
     */
    sendPrivateRecord(toqq, recordSrc) {
        return this.sendPrivateMsg(toqq, `[CQ:image,file=${recordSrc}]`);
    }
    /**
     * 发送群临时私聊图片
     * @param fromGroup 群号
     * @param toqq      目标 qq
     * @param recordSrc    图片资源：url,base64,路径均可
     * @return httpRequestPromise 返回请求的 promise
     */
    sendGroupPrivateRecord(fromGroup, toqq, recordSrc) {
        return this.sendGroupPrivateMsg(fromGroup, toqq, `[CQ:record,file=${recordSrc}]`);
    }
    /**
     * 向群发送图片
     * @param togroup  目标群号
     * @param recordSrc    图片资源：url,base64,路径均可
     * @return httpRequestPromise 返回请求的 promise
     */
    sendGroupRecord(togroup, recordSrc) {
        return this.sendGroupMsg(togroup, `[CQ:record,file=${recordSrc}]`);
    }
}
exports.Robot = Robot;
