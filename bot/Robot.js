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
    /************************************ Bot 账号 *************************************/
    /**
     * 获取登录号信息
     * @return Promise
     */
    getLoginInfo() {
        return this.http.post('/get_login_info');
    }
    /**
     * 设置登录号资料
     * @param nickname 名称
     * @param company 公司
     * @param email 邮箱
     * @param college 学校
     * @param personal_note 个人说明
     * @return Promise
     */
    setQQProfile(nickname, company, email, college, personal_note) {
        return this.http.post('/send_msg', qs_1.default.stringify({
            nickname,
            company,
            email,
            college,
            personal_note
        }));
    }
    /**
     * 获取企点账号信息,该API只有企点协议可用
     * @return promise
     */
    qidianGetAccountInfo() {
        return this.http.post('/qidian_get_account_info');
    }
    /**
     * 获取在线机型
     * @param model 机型名称
     * @return promise
     */
    getModelShow(model) {
        return this.http.post('/_get_model_show', qs_1.default.stringify({
            model
        }));
    }
    /**
       * 设置在线机型
       * @param model 机型名称
       * @param model_show
       * @return promise
       */
    setModelShow(model, model_show) {
        return this.http.post('/_set_model_show', qs_1.default.stringify({
            model,
            model_show
        }));
    }
    /**
     * 获取当前账号在线客户端列表
     * @param no_cache 是否无视缓存
     * @return Promise
     */
    getOnlineClients(no_cache) {
        return this.http.post('/get_online_clients', qs_1.default.stringify({
            no_cache
        }));
    }
    /************************************ 好友信息 *************************************/
    /**
     * 获取当前账号在线客户端列表
     * @param user_id QQ 号
     * @param no_cache 是否不使用缓存（使用缓存可能更新不及时, 但响应更快）
     * @return Promise
     */
    getStrangerInfo(user_id, no_cache) {
        return this.http.post('/get_stranger_info', qs_1.default.stringify({
            user_id,
            no_cache
        }));
    }
    /**
     * 获取好友列表
     * @return Promise
     */
    getFriendList() {
        return this.http.post('/get_friend_list');
    }
    /**
     * 获取单向好友列表
     * @return Promise
     */
    getUnidirectionalFriendList() {
        return this.http.post('/get_unidirectional_friend_list');
    }
    /************************************ 好友操作 *************************************/
    /**
     * 删除好友
     * @param user_id 好友 QQ 号
     * @return Promise
     */
    deleteFriend(user_id) {
        return this.http.post('/delete_friend', qs_1.default.stringify({
            user_id
        }));
    }
    /**
     * 删除单向好友
     * @param user_id 好友 QQ 号
     * @return Promise
     */
    deleteUnidirectionalFriend(user_id) {
        return this.http.post('/delete_unidirectional_friend', qs_1.default.stringify({
            user_id
        }));
    }
    /************************************ 消息 *************************************/
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
        }));
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
    /**
     * 获取消息
     * @param message_id 消息id
     * @return promise
     */
    getMsg(message_id) {
        return this.http.post('/get_msg', qs_1.default.stringify({
            message_id
        }));
    }
    /**
     * 撤回消息
     * @param message_id 消息id
     * @return promise
     */
    deleteMsg(message_id) {
        return this.http.post('/delete_msg', qs_1.default.stringify({
            message_id
        }));
    }
    /**
     * 标记消息已读
     * @param message_id 消息id
     * @return promise
     */
    markMsgAsRead(message_id) {
        return this.http.post('/mark_msg_as_read', qs_1.default.stringify({
            message_id
        }));
    }
    /**
     * 获取合并转发内容
     * @param message_id 消息id
     * @return promise
     */
    getForwardMsg(message_id) {
        return this.http.post('/get_forward_msg', qs_1.default.stringify({
            message_id
        }));
    }
    /**
     * 获取合并转发内容
     * @param group_id 群号
     * @param messages 自定义转发消息, 具体看 CQcode
     * @return promise
     */
    sendGroupForwardMsg(group_id, messages) {
        return this.http.post('/send_group_forward_msg', qs_1.default.stringify({
            group_id,
            messages
        }));
    }
    /**
     * 发送合并转发 ( 好友 )
     * @param user_id 好友QQ号
     * @param messages 自定义转发消息, 具体看 CQcode
     * @return promise
     */
    sendPrivateForwardMsg(user_id, messages) {
        return this.http.post('/send_private_forward_msg', qs_1.default.stringify({
            user_id,
            messages
        }));
    }
    /**
     * 获取群消息历史记录
     * @param message_seq 起始消息序号, 可通过 get_msg 获得
     * @param group_id 号
     * @return promise
     */
    getGroupMsgHistory(message_seq, group_id) {
        return this.http.post('/get_group_msg_history', qs_1.default.stringify({
            message_seq,
            group_id
        }));
    }
    /************************************ 图片 *************************************/
    /**
     * 获取图片信息
     * @param file 图片缓存文件名
     * @return promise
     */
    getImage(file) {
        return this.http.post('/get_image', qs_1.default.stringify({
            file
        }));
    }
    /**
     * 检查是否可以发送图片
     * @return promise
     */
    canSendImage(file) {
        return this.http.post('/can_send_image');
    }
    /**
     * 图片 OCR
     * @param image 图片ID
     * @return promise
     */
    ocrImage(image) {
        return this.http.post('/ocr_image', qs_1.default.stringify({
            image
        }));
    }
    /************************************ 语音 *************************************/
    /**
     * 检查是否可以发送语音
     * @return promise
     */
    canSendRecord(file) {
        return this.http.post('/can_send_record');
    }
    /************************************ 处理 *************************************/
    /**
     * 处理加好友请求
     * @param flag 加好友请求的 flag（需从上报的数据中获得）
     * @param approve 是否同意请求
     * @param remark    添加后的好友备注（仅在同意时有效）
     * @return promise
     */
    setFriendAddRequest(flag, approve, remark) {
        return this.http.post('/set_friend_add_request', qs_1.default.stringify({
            flag,
            approve,
            remark
        }));
    }
    /**
     * 处理加群请求／邀请
     * @param flag 加群请求的 flag（需从上报的数据中获得）
     * @param sub_type add 或 invite, 请求类型（需要和上报消息中的 sub_type 字段相符）
     * @param approve 是否同意请求／邀请
     * @param reason    拒绝理由（仅在拒绝时有效）
     * @return promise
     */
    setGroupAddRequest(flag, sub_type, approve, reason) {
        return this.http.post('/set_group_add_request', qs_1.default.stringify({
            flag,
            sub_type,
            approve,
            reason
        }));
    }
    /************************************ 群消息 *************************************/
    /**
     * 获取群信息
     * @param group_id 群号
     * @param no_cache 是否不使用缓存（使用缓存可能更新不及时, 但响应更快）
     * @return promise
     */
    getGroupInfo(group_id, no_cache) {
        return this.http.post('/get_group_info', qs_1.default.stringify({
            group_id,
            no_cache
        }));
    }
    /**
     * 获取群列表
     * @param no_cache 是否不使用缓存（使用缓存可能更新不及时, 但响应更快）
     * @return promise
     */
    getGroupList(no_cache) {
        return this.http.post('/get_group_list', qs_1.default.stringify({
            no_cache
        }));
    }
    /**
     * 获取群成员信息
     * @param group_id 群号
     * @param user_id QQ 号
     * @param no_cache 是否不使用缓存（使用缓存可能更新不及时, 但响应更快）
     * @return promise
     */
    getGroupMemberInfo(group_id, user_id, no_cache) {
        return this.http.post('/get_group_member_info', qs_1.default.stringify({
            group_id,
            user_id,
            no_cache
        }));
    }
    /**
     * 获取群成员列表
     * @param group_id 群号
     * @param no_cache 是否不使用缓存（使用缓存可能更新不及时, 但响应更快）
     * @return promise
     */
    getGroupMemberList(group_id, no_cache) {
        return this.http.post('/get_group_member_list', qs_1.default.stringify({
            group_id,
            no_cache
        }));
    }
    /**
     * 获取群荣誉信息
     * @param group_id 群号
     * @param type 要获取的群荣誉类型, 可传入 talkative performer legend strong_newbie emotion 以分别获取单个类型的群荣誉数据, 或传入 all 获取所有数据
     * @return promise
     */
    getGroupHonorInfo(group_id, type) {
        return this.http.post('/get_group_honor_info', qs_1.default.stringify({
            group_id,
            type
        }));
    }
    /**
     * 获取群系统消息
     * @return promise
     */
    getGroupSystemMsg() {
        return this.http.post('/get_group_system_msg');
    }
    /**
     * 获取精华消息列表
     * @param group_id 群号
     * @return promise
     */
    getEssenceMsgList(group_id) {
        return this.http.post('/get_essence_msg_list', qs_1.default.stringify({
            group_id
        }));
    }
    /**
     * 获取群 @全体成员 剩余次数
     * @param group_id 群号
     * @return promise
     */
    getGroupAtallremain(group_id) {
        return this.http.post('/get_group_at_all_remain', qs_1.default.stringify({
            group_id
        }));
    }
    /************************************ 群设置 *************************************/
    /**
     * 设置群名
     * @param group_id 群号
     * @param group_name 新群名
     * @return promise
     */
    setGroupName(group_id, group_name) {
        return this.http.post('/set_group_name', qs_1.default.stringify({
            group_id,
            group_name
        }));
    }
    /**
     * 设置群头像
     * @param group_id 群号
     * @param file 图片文件名，格式同图片参数接口
     * @param cache 表示是否使用已缓存的文件
     * @return promise
     */
    setGroupPortrait(group_id, file, cache) {
        return this.http.post('/set_group_portrait', qs_1.default.stringify({
            group_id,
            file,
            cache
        }));
    }
    /**
     * 设置群管理员
     * @param group_id 群号
     * @param user_id 要设置管理员的 QQ 号
     * @param enable true 为设置, false 为取消
     * @return promise
     */
    setGroupAdmin(group_id, user_id, enable) {
        return this.http.post('/set_group_admin', qs_1.default.stringify({
            group_id,
            user_id,
            enable
        }));
    }
    /**
     * 设置群名片 ( 群备注 )
     * @param group_id 群号
     * @param user_id 要设置的 QQ 号
     * @param card 群名片内容, 不填或空字符串表示删除群名片
     * @return promise
     */
    setGroupCard(group_id, user_id, card) {
        return this.http.post('/set_group_card', qs_1.default.stringify({
            group_id,
            user_id,
            card
        }));
    }
    /**
     * 设置群组专属头衔
     * @param group_id 群号
     * @param user_id 要设置的 QQ 号
     * @param special_title 专属头衔, 不填或空字符串表示删除专属头衔
     * @param duration 专属头衔有效期, 单位秒, -1 表示永久, 不过此项似乎没有效果, 可能是只有某些特殊的时间长度有效, 有待测试
     * @return promise
     */
    setGroupSpecialTitle(group_id, user_id, special_title, duration) {
        return this.http.post('/set_group_special_title', qs_1.default.stringify({
            group_id,
            user_id,
            special_title,
            duration
        }));
    }
    /************************************ 群操作 *************************************/
    /**
     * 群单人禁言
     * @param group_id 群号
     * @param user_id 要禁言的 QQ 号
     * @param duration 禁言时长, 单位秒, 0 表示取消禁言
     * @return promise
     */
    setGroupBan(group_id, user_id, duration) {
        return this.http.post('/set_group_ban', qs_1.default.stringify({
            group_id,
            user_id,
            duration
        }));
    }
    /**
     * 群全员禁言
     * @param group_id 群号
     * @param enable 是否禁言
     * @return promise
     */
    setGroupWholeBan(group_id, enable) {
        return this.http.post('/set_group_whole_ban', qs_1.default.stringify({
            group_id,
            enable
        }));
    }
    /**
     * 群匿名用户禁言
     * @param group_id 群号
     * @param anonymous 可选, 要禁言的匿名用户对象（群消息上报的 anonymous 字段）
     * @param flag 可选, 要禁言的匿名用户的 flag（需从群消息上报的数据中获得）
     * @param duration 禁言时长, 单位秒, 无法取消匿名用户禁言
     * @return promise
     */
    setGroupAnonymousBan(group_id, anonymous, flag, duration) {
        return this.http.post('/set_group_anonymous_ban', qs_1.default.stringify({
            group_id,
            anonymous,
            flag,
            duration
        }));
    }
    /**
     * 设置精华消息
     * @param message_id 消息ID
     * @return promise
     */
    setEssenceMsg(message_id) {
        return this.http.post('/set_essence_msg', qs_1.default.stringify({
            message_id
        }));
    }
    /**
     * 移出精华消息
     * @param message_id 消息ID
     * @return promise
     */
    deleteEssenceMsg(message_id) {
        return this.http.post('/delete_essence_msg', qs_1.default.stringify({
            message_id
        }));
    }
    /**
     * 群打卡
     * @param group_id 群号
     * @return promise
     */
    sendGroupSign(group_id) {
        return this.http.post('/send_group_sign', qs_1.default.stringify({
            group_id
        }));
    }
    /**
     * 发送群公告
     * @param group_id 群号
     * @param content 公告内容
     * @param image 图片路径（可选）
     * @return promise
     */
    sendGroupNotice(group_id, content, image) {
        return this.http.post('/_send_group_notice', qs_1.default.stringify({
            group_id,
            content,
            image
        }));
    }
    /**
     * 获取群公告
     * @param group_id 群号
     * @return promise
     */
    getGroupNotice(group_id) {
        return this.http.post('/_get_group_notice', qs_1.default.stringify({
            group_id
        }));
    }
    /**
     * 群组踢人
     * @param group_id 群号
     * @param user_id 要踢的 QQ 号
     * @param reject_add_request 拒绝此人的加群请求
     * @return promise
     */
    setGroupKick(group_id, user_id, reject_add_request) {
        return this.http.post('/set_group_kick', qs_1.default.stringify({
            group_id,
            user_id,
            reject_add_request
        }));
    }
    /**
     * 退出群组
     * @param group_id 群号
     * @param is_dismiss 是否解散, 如果登录号是群主, 则仅在此项为 true 时能够解散
     * @return promise
     */
    setGroupLeave(group_id, is_dismiss) {
        return this.http.post('/set_group_leave', qs_1.default.stringify({
            group_id,
            is_dismiss
        }));
    }
    /************************************ 文件 *************************************/
    /**
     * 上传群文件
     * @param group_id 群号
     * @param file 本地文件路径,只能上传本地文件, 需要上传 http 文件的话请先调用 download_file API下载
     * @param name 储存名称
     * @param folder 父目录ID,在不提供 folder 参数的情况下默认上传到根目录
     * @return promise
     */
    uploadGroupFile(group_id, file, name, folder) {
        return this.http.post('/upload_group_file', qs_1.default.stringify({
            group_id,
            file,
            name,
            folder
        }));
    }
    /**
     * 删除群文件
     * @param group_id 群号
     * @param file_id 文件ID 参考 File 对象
     * @param busid 文件类型 参考 File 对象
     * @return promise
     */
    deleteGroupFile(group_id, file_id, busid) {
        return this.http.post('/delete_group_file', qs_1.default.stringify({
            group_id,
            file_id,
            busid
        }));
    }
    /**
     * 创建群文件文件夹,仅能在根目录创建文件夹
     * @param group_id 群号
     * @param name 文件夹名称
     * @param parent_id 仅能为 /
     * @return promise
     */
    createGroupFileFolder(group_id, name, parent_id) {
        return this.http.post('/create_group_file_folder', qs_1.default.stringify({
            group_id,
            name,
            parent_id
        }));
    }
    /**
     * 删除群文件文件夹
     * @param group_id 群号
     * @param folder_id 文件夹ID 参考 Folder 对象
     * @return promise
     */
    deleteGroupFolder(group_id, folder_id) {
        return this.http.post('/delete_group_folder', qs_1.default.stringify({
            group_id,
            folder_id
        }));
    }
    /**
     * 获取群文件系统信息
     * @param group_id 群号
     * @return promise
     */
    getGroupFileSystemInfo(group_id) {
        return this.http.post('/get_group_file_system_info', qs_1.default.stringify({
            group_id
        }));
    }
    /**
     * 获取群根目录文件列表
     * @param group_id 群号
     * @return promise
     */
    getGroupRootFiles(group_id) {
        return this.http.post('/get_group_root_files', qs_1.default.stringify({
            group_id
        }));
    }
    /**
     * 获取群文件资源链接
     * @param group_id 群号
     * @param file_id 文件ID 参考 File 对象
     * @param busid 文件类型 参考 File 对象
     * @return promise
     */
    getGroupFileUrl(group_id, file_id, busid) {
        return this.http.post('/get_group_file_url', qs_1.default.stringify({
            group_id,
            file_id,
            busid
        }));
    }
    /**
     * 上传私聊文件,只能上传本地文件, 需要上传 http 文件的话请先调用 download_file API下载
     * @param user_id 对方 QQ 号
     * @param file 本地文件路径
     * @param name 文件名称
     * @return promise
     */
    uploadPrivateFile(user_id, file, name) {
        return this.http.post('/upload_private_file', qs_1.default.stringify({
            user_id,
            file,
            name
        }));
    }
    /************************************ Go-CqHttp 相关 *************************************/
    /**
     * 获取版本信息
     * @return promise
     */
    getVersionInfo() {
        return this.http.post('/get_version_info');
    }
    /**
     * 获取状态
     * @return promise
     */
    getStatus() {
        return this.http.post('/get_status');
    }
    /**
     * 获取状态
     * @param file 事件过滤器文件
     * @return promise
     */
    reloadEventFilter(file) {
        return this.http.post('/reload_event_filter', qs_1.default.stringify({
            file
        }));
    }
    /**
     * 下载文件到缓存目录
     * @param url 链接地址
     * @param thread_count 下载线程数
     * @param headers 自定义请求头
     * @return promise
     */
    downloadFile(url, thread_count, headers) {
        return this.http.post('/download_file', qs_1.default.stringify({
            url,
            thread_count,
            headers
        }));
    }
    /**
     * 检查链接安全性
     * @param url 需要检查的链接
     * @return promise
     */
    checkUrlSafely(url) {
        return this.http.post('/check_url_safely', qs_1.default.stringify({
            url
        }));
    }
}
exports.Robot = Robot;
