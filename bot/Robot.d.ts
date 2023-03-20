import { Event } from '../core/Event';
import { AxiosInstance } from 'axios';
interface InfoDataPack {
    fromUser: number;
    fromGroup: number;
    rawMessage: string;
    robot: number;
    isAt: boolean;
    QQInfo: {
        card: string;
        nickname: string;
    };
    success: boolean;
    type: string;
}
interface EventDataPack {
    fromUser: {};
    fromGroup: {};
    rawMessage: '';
    robot: number;
    isAt: boolean;
    QQInfo: {};
    user_id: number;
    group_id: number;
    notice_type: string;
    nickname: string;
    sub_type: string;
    success: boolean;
    type: string;
}
/**
 * 机器人类，有回调事件，上发操作等功能。
 */
export declare class Robot extends Event {
    private qq;
    private botID;
    private http;
    private _onPrivateMsg;
    private _onGroupMsg;
    private _onEventMsg;
    private groupFunMap;
    private privateCmdAction;
    private groupCmdAction;
    constructor(qq: string | number, http: AxiosInstance, botID: any);
    /**
     * 返回实例化机器人的请求器
     */
    get httpRequest(): AxiosInstance;
    /**
     * 返回机器人序号 ID
     */
    get id(): string;
    /**
     * 返回机器人 QQ 号
     */
    get QQ(): string | number;
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
    onPrivateMsg(fun: (pack: InfoDataPack) => void): void;
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
    onGroupMsg(fun: (pack: InfoDataPack) => void): void;
    /**
     * 绑定特定群组回调消息
     * @param group 群号
     * @param fun   回调函数，返回的参数为消息数据包
     */
    setOnGroupMsg(group: string | number, fun: (pack: InfoDataPack) => void): void;
    getOnGroupMsg(group: string | number): Function;
    /**
     * 当操作事件触发时，回调时带回消息包
     */
    onEventMsg(fun: (pack: EventDataPack) => void): void;
    /**
     * 快速注册一个私聊指令并执行对应的方法
     * @param {Array<string>} cmd       监听的指令
     * @param doAction  要执行的动作，回调参数为发送者相关信息
     */
    regPrivateCmd(cmd: Array<string | number>, doAction: (pack: InfoDataPack) => void): void;
    /**
     * 快速注册一个群要使用的指令并执行对应的方法
     * @param group     监听的目标群
     * @param {Array<string>} cmd       监听的指令
     * @param doAction  要执行的动作，回调参数为发送者相关信息
     */
    regGroupCmd(group: string | number, cmd: Array<string | number>, doAction: (pack: InfoDataPack) => void): void;
    /********************************************************** 工具 tools ************************************************************/
    /**
     * 发送好友私聊消息
     * @param toqq 目标 QQ
     * @param text 发送的文本
     * @param type 文本类型：xml,json,可不传
     */
    sendPrivateMsg(toqq: string | number, text: string): void;
    /**
     * 发送群临时会话消息
     * @param fromGroup 来自群号
     * @param toqq 目标 QQ
     * @param text 发送文本
     */
    sendGroupPrivateMsg(fromGroup: string | number, toqq: string | number, text: string): void;
    /**
     * 发送群组消息
     * @param toGroup 目标群
     * @param text 文本
     * @param anonymous 是否匿名，默认：false
     * @param type 文本类型：xml,json,可不传
     */
    sendGroupMsg(toGroup: string | number, text: string, anonymous?: boolean, type?: string): void;
    /**
     * 私聊发送图片
     * @param toqq      发送目标 qq
     * @param imgSrc    图片资源：url,base64,路径均可
     * @param flashpic  是否发送闪照，默认 false
     */
    sendPrivateImg(toqq: string | number, imgSrc: string, flashpic?: boolean): void;
    /**
     * 发送群临时私聊图片
     * @param fromGroup 群号
     * @param toqq      目标 qq
     * @param imgSrc    图片资源
     * @param flashpic  是否闪照
     */
    sendGroupPrivateImg(fromGroup: string | number, toqq: string | number, imgSrc: string, flashpic?: boolean): void;
    /**
     * 向群发送图片
     * @param togroup  目标群号
     * @param imgSrc   图片资源
     * @param flashpic 是否为闪照
     */
    sendGroupImg(togroup: string | number, imgSrc: string, flashpic?: boolean): void;
    /**
     * 私聊发送语音
     * @param toqq      发送目标 qq
     * @param recordSrc    图片资源：url,base64,路径均可
     */
    sendPrivateRecord(toqq: string | number, recordSrc: string): void;
    /**
     * 发送群临时私聊图片
     * @param fromGroup 群号
     * @param toqq      目标 qq
     * @param recordSrc    图片资源：url,base64,路径均可
     */
    sendGroupPrivateRecord(fromGroup: string | number, toqq: string | number, recordSrc: string): void;
    /**
     * 向群发送图片
     * @param togroup  目标群号
     * @param recordSrc    图片资源：url,base64,路径均可
     */
    sendGroupRecord(togroup: string | number, recordSrc: string): void;
}
export {};
