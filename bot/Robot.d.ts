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
    robot: number;
    user_id: number;
    group_id: number;
    notice_type: string;
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
     * 获取 CQ Code 模板对象
     */
    get CQCode(): {
        Face(id: Number): string;
        Record(file: string, magic: Number, cache: string, timeout: number): string;
        Video(file: string, cover: string): string;
        At(qq: string, name: string): string;
        Share(url: string, title: string, content: string, image: string): string;
        Music(type: string, id: Number, url: string, audio: string, title: string, content: string, image: string): string; /**
         * 获取 CQ Code 模板对象
         */
        Image(file: string, type: string, subType: number, url: string, cache: number, id?: number): string;
        Reply(id: number, text: string, qq: number, time: number, seq: number): string;
        Redbag(title: string): string;
        Poke(qq: string): string;
        Gift(qq: string, id: number): string;
        Forward(id: string): string;
        XML(data: string): string;
        JSON(data: string, resid: number): string;
        Cardimage(file: string, minwidth: number, minheight: number, maxwidth: number, maxheight: number, source: string, icon: string): string;
        Tts(text: string): string;
    };
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
    /************************************ Bot 账号 *************************************/
    /**
     * 获取登录号信息
     * @return Promise
     */
    getLoginInfo(): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 设置登录号资料
     * @param nickname 名称
     * @param company 公司
     * @param email 邮箱
     * @param college 学校
     * @param personal_note 个人说明
     * @return Promise
     */
    setQQProfile(nickname: string, company: string, email: string, college: string, personal_note: string): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 获取企点账号信息,该API只有企点协议可用
     * @return promise
     */
    qidianGetAccountInfo(): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 获取在线机型
     * @param model 机型名称
     * @return promise
     */
    getModelShow(model: string): Promise<import("axios").AxiosResponse<any>>;
    /**
       * 设置在线机型
       * @param model 机型名称
       * @param model_show
       * @return promise
       */
    setModelShow(model: string, model_show: string): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 获取当前账号在线客户端列表
     * @param no_cache 是否无视缓存
     * @return Promise
     */
    getOnlineClients(no_cache: boolean): Promise<import("axios").AxiosResponse<any>>;
    /************************************ 好友信息 *************************************/
    /**
     * 获取当前账号在线客户端列表
     * @param user_id QQ 号
     * @param no_cache 是否不使用缓存（使用缓存可能更新不及时, 但响应更快）
     * @return Promise
     */
    getStrangerInfo(user_id: number, no_cache: boolean): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 获取好友列表
     * @return Promise
     */
    getFriendList(): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 获取单向好友列表
     * @return Promise
     */
    getUnidirectionalFriendList(): Promise<import("axios").AxiosResponse<any>>;
    /************************************ 好友操作 *************************************/
    /**
     * 删除好友
     * @param user_id 好友 QQ 号
     * @return Promise
     */
    deleteFriend(user_id: boolean): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 删除单向好友
     * @param user_id 好友 QQ 号
     * @return Promise
     */
    deleteUnidirectionalFriend(user_id: boolean): Promise<import("axios").AxiosResponse<any>>;
    /************************************ 消息 *************************************/
    /**
     * 发送好友私聊消息
     * @param toqq 目标 QQ
     * @param text 发送的文本
     * @param type 文本类型：xml,json,可不传
     * @return httpRequestPromise 返回请求的 promise
     */
    sendPrivateMsg(toqq: string | number, text: string): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 发送群临时会话消息
     * @param fromGroup 来自群号
     * @param toqq 目标 QQ
     * @param text 发送文本
     * @return httpRequestPromise 返回请求的 promise
     */
    sendGroupPrivateMsg(fromGroup: string | number, toqq: string | number, text: string): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 发送群组消息
     * @param toGroup 目标群
     * @param text 文本
     * @param anonymous 是否匿名，默认：false
     * @return httpRequestPromise 返回请求的 promise
     */
    sendGroupMsg(toGroup: string | number, text: string, anonymous?: boolean): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 私聊发送图片
     * @param toqq      发送目标 qq
     * @param imgSrc    图片资源：url,base64,路径均可
     * @param flashpic  是否发送闪照，默认 false
     * @return httpRequestPromise 返回请求的 promise
     */
    sendPrivateImg(toqq: string | number, imgSrc: string, flashpic?: boolean): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 发送群临时私聊图片
     * @param fromGroup 群号
     * @param toqq      目标 qq
     * @param imgSrc    图片资源
     * @param flashpic  是否闪照
     * @return httpRequestPromise 返回请求的 promise
     */
    sendGroupPrivateImg(fromGroup: string | number, toqq: string | number, imgSrc: string, flashpic?: boolean): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 向群发送图片
     * @param togroup  目标群号
     * @param imgSrc   图片资源
     * @param flashpic 是否为闪照
     * @return httpRequestPromise 返回请求的 promise
     */
    sendGroupImg(togroup: string | number, imgSrc: string, flashpic?: boolean): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 私聊发送语音
     * @param toqq      发送目标 qq
     * @param recordSrc    图片资源：url,base64,路径均可
     * @return httpRequestPromise 返回请求的 promise
     */
    sendPrivateRecord(toqq: string | number, recordSrc: string): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 发送群临时私聊图片
     * @param fromGroup 群号
     * @param toqq      目标 qq
     * @param recordSrc    图片资源：url,base64,路径均可
     * @return httpRequestPromise 返回请求的 promise
     */
    sendGroupPrivateRecord(fromGroup: string | number, toqq: string | number, recordSrc: string): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 向群发送图片
     * @param togroup  目标群号
     * @param recordSrc    图片资源：url,base64,路径均可
     * @return httpRequestPromise 返回请求的 promise
     */
    sendGroupRecord(togroup: string | number, recordSrc: string): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 获取消息
     * @param message_id 消息id
     * @return promise
     */
    getMsg(message_id: number): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 撤回消息
     * @param message_id 消息id
     * @return promise
     */
    deleteMsg(message_id: number): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 标记消息已读
     * @param message_id 消息id
     * @return promise
     */
    markMsgAsRead(message_id: number): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 获取合并转发内容
     * @param message_id 消息id
     * @return promise
     */
    getForwardMsg(message_id: number): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 获取合并转发内容
     * @param group_id 群号
     * @param messages 自定义转发消息, 具体看 CQcode
     * @return promise
     */
    sendGroupForwardMsg(group_id: number, messages: any): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 发送合并转发 ( 好友 )
     * @param user_id 好友QQ号
     * @param messages 自定义转发消息, 具体看 CQcode
     * @return promise
     */
    sendPrivateForwardMsg(user_id: number, messages: any): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 获取群消息历史记录
     * @param message_seq 起始消息序号, 可通过 get_msg 获得
     * @param group_id 号
     * @return promise
     */
    getGroupMsgHistory(message_seq: number, group_id: number): Promise<import("axios").AxiosResponse<any>>;
    /************************************ 图片 *************************************/
    /**
     * 获取图片信息
     * @param file 图片缓存文件名
     * @return promise
     */
    getImage(file: string): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 检查是否可以发送图片
     * @return promise
     */
    canSendImage(file: string): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 图片 OCR
     * @param image 图片ID
     * @return promise
     */
    ocrImage(image: string): Promise<import("axios").AxiosResponse<any>>;
    /************************************ 语音 *************************************/
    /**
     * 检查是否可以发送语音
     * @return promise
     */
    canSendRecord(file: string): Promise<import("axios").AxiosResponse<any>>;
    /************************************ 处理 *************************************/
    /**
     * 处理加好友请求
     * @param flag 加好友请求的 flag（需从上报的数据中获得）
     * @param approve 是否同意请求
     * @param remark    添加后的好友备注（仅在同意时有效）
     * @return promise
     */
    setFriendAddRequest(flag: string, approve: boolean, remark: string): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 处理加群请求／邀请
     * @param flag 加群请求的 flag（需从上报的数据中获得）
     * @param sub_type add 或 invite, 请求类型（需要和上报消息中的 sub_type 字段相符）
     * @param approve 是否同意请求／邀请
     * @param reason    拒绝理由（仅在拒绝时有效）
     * @return promise
     */
    setGroupAddRequest(flag: string, sub_type: string, approve: boolean, reason: string): Promise<import("axios").AxiosResponse<any>>;
    /************************************ 群消息 *************************************/
    /**
     * 获取群信息
     * @param group_id 群号
     * @param no_cache 是否不使用缓存（使用缓存可能更新不及时, 但响应更快）
     * @return promise
     */
    getGroupInfo(group_id: string, no_cache: string): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 获取群列表
     * @param no_cache 是否不使用缓存（使用缓存可能更新不及时, 但响应更快）
     * @return promise
     */
    getGroupList(no_cache: string): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 获取群成员信息
     * @param group_id 群号
     * @param user_id QQ 号
     * @param no_cache 是否不使用缓存（使用缓存可能更新不及时, 但响应更快）
     * @return promise
     */
    getGroupMemberInfo(group_id: number, user_id: number, no_cache: string): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 获取群成员列表
     * @param group_id 群号
     * @param no_cache 是否不使用缓存（使用缓存可能更新不及时, 但响应更快）
     * @return promise
     */
    getGroupMemberList(group_id: number, no_cache: string): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 获取群荣誉信息
     * @param group_id 群号
     * @param type 要获取的群荣誉类型, 可传入 talkative performer legend strong_newbie emotion 以分别获取单个类型的群荣誉数据, 或传入 all 获取所有数据
     * @return promise
     */
    getGroupHonorInfo(group_id: number, type: string): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 获取群系统消息
     * @return promise
     */
    getGroupSystemMsg(): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 获取精华消息列表
     * @param group_id 群号
     * @return promise
     */
    getEssenceMsgList(group_id: number): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 获取群 @全体成员 剩余次数
     * @param group_id 群号
     * @return promise
     */
    getGroupAtallremain(group_id: number): Promise<import("axios").AxiosResponse<any>>;
    /************************************ 群设置 *************************************/
    /**
     * 设置群名
     * @param group_id 群号
     * @param group_name 新群名
     * @return promise
     */
    setGroupName(group_id: number, group_name: string): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 设置群头像
     * @param group_id 群号
     * @param file 图片文件名，格式同图片参数接口
     * @param cache 表示是否使用已缓存的文件
     * @return promise
     */
    setGroupPortrait(group_id: number, file: string, cache: boolean): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 设置群管理员
     * @param group_id 群号
     * @param user_id 要设置管理员的 QQ 号
     * @param enable true 为设置, false 为取消
     * @return promise
     */
    setGroupAdmin(group_id: number, user_id: number, enable: boolean): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 设置群名片 ( 群备注 )
     * @param group_id 群号
     * @param user_id 要设置的 QQ 号
     * @param card 群名片内容, 不填或空字符串表示删除群名片
     * @return promise
     */
    setGroupCard(group_id: number, user_id: number, card: string): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 设置群组专属头衔
     * @param group_id 群号
     * @param user_id 要设置的 QQ 号
     * @param special_title 专属头衔, 不填或空字符串表示删除专属头衔
     * @param duration 专属头衔有效期, 单位秒, -1 表示永久, 不过此项似乎没有效果, 可能是只有某些特殊的时间长度有效, 有待测试
     * @return promise
     */
    setGroupSpecialTitle(group_id: number, user_id: number, special_title: string, duration: number): Promise<import("axios").AxiosResponse<any>>;
    /************************************ 群操作 *************************************/
    /**
     * 群单人禁言
     * @param group_id 群号
     * @param user_id 要禁言的 QQ 号
     * @param duration 禁言时长, 单位秒, 0 表示取消禁言
     * @return promise
     */
    setGroupBan(group_id: number, user_id: number, duration: number): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 群全员禁言
     * @param group_id 群号
     * @param enable 是否禁言
     * @return promise
     */
    setGroupWholeBan(group_id: number, enable: boolean): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 群匿名用户禁言
     * @param group_id 群号
     * @param anonymous 可选, 要禁言的匿名用户对象（群消息上报的 anonymous 字段）
     * @param flag 可选, 要禁言的匿名用户的 flag（需从群消息上报的数据中获得）
     * @param duration 禁言时长, 单位秒, 无法取消匿名用户禁言
     * @return promise
     */
    setGroupAnonymousBan(group_id: number, anonymous: any, flag: string, duration: number): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 设置精华消息
     * @param message_id 消息ID
     * @return promise
     */
    setEssenceMsg(message_id: number): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 移出精华消息
     * @param message_id 消息ID
     * @return promise
     */
    deleteEssenceMsg(message_id: number): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 群打卡
     * @param group_id 群号
     * @return promise
     */
    sendGroupSign(group_id: number): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 发送群公告
     * @param group_id 群号
     * @param content 公告内容
     * @param image 图片路径（可选）
     * @return promise
     */
    sendGroupNotice(group_id: number, content: string, image: string): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 获取群公告
     * @param group_id 群号
     * @return promise
     */
    getGroupNotice(group_id: number): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 群组踢人
     * @param group_id 群号
     * @param user_id 要踢的 QQ 号
     * @param reject_add_request 拒绝此人的加群请求
     * @return promise
     */
    setGroupKick(group_id: number, user_id: number, reject_add_request: boolean): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 退出群组
     * @param group_id 群号
     * @param is_dismiss 是否解散, 如果登录号是群主, 则仅在此项为 true 时能够解散
     * @return promise
     */
    setGroupLeave(group_id: number, is_dismiss: boolean): Promise<import("axios").AxiosResponse<any>>;
    /************************************ 文件 *************************************/
    /**
     * 上传群文件
     * @param group_id 群号
     * @param file 本地文件路径,只能上传本地文件, 需要上传 http 文件的话请先调用 download_file API下载
     * @param name 储存名称
     * @param folder 父目录ID,在不提供 folder 参数的情况下默认上传到根目录
     * @return promise
     */
    uploadGroupFile(group_id: number, file: string, name: string, folder: string): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 删除群文件
     * @param group_id 群号
     * @param file_id 文件ID 参考 File 对象
     * @param busid 文件类型 参考 File 对象
     * @return promise
     */
    deleteGroupFile(group_id: number, file_id: string, busid: number): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 创建群文件文件夹,仅能在根目录创建文件夹
     * @param group_id 群号
     * @param name 文件夹名称
     * @param parent_id 仅能为 /
     * @return promise
     */
    createGroupFileFolder(group_id: number, name: string, parent_id: string): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 删除群文件文件夹
     * @param group_id 群号
     * @param folder_id 文件夹ID 参考 Folder 对象
     * @return promise
     */
    deleteGroupFolder(group_id: number, folder_id: string): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 获取群文件系统信息
     * @param group_id 群号
     * @return promise
     */
    getGroupFileSystemInfo(group_id: number): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 获取群根目录文件列表
     * @param group_id 群号
     * @return promise
     */
    getGroupRootFiles(group_id: number): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 获取群文件资源链接
     * @param group_id 群号
     * @param file_id 文件ID 参考 File 对象
     * @param busid 文件类型 参考 File 对象
     * @return promise
     */
    getGroupFileUrl(group_id: number, file_id: string, busid: number): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 上传私聊文件,只能上传本地文件, 需要上传 http 文件的话请先调用 download_file API下载
     * @param user_id 对方 QQ 号
     * @param file 本地文件路径
     * @param name 文件名称
     * @return promise
     */
    uploadPrivateFile(user_id: number, file: string, name: string): Promise<import("axios").AxiosResponse<any>>;
    /************************************ Go-CqHttp 相关 *************************************/
    /**
     * 获取版本信息
     * @return promise
     */
    getVersionInfo(): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 获取状态
     * @return promise
     */
    getStatus(): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 获取状态
     * @param file 事件过滤器文件
     * @return promise
     */
    reloadEventFilter(file: string): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 下载文件到缓存目录
     * @param url 链接地址
     * @param thread_count 下载线程数
     * @param headers 自定义请求头
     * @return promise
     */
    downloadFile(url: string, thread_count: number, headers: string | []): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 检查链接安全性
     * @param url 需要检查的链接
     * @return promise
     */
    checkUrlSafely(url: string): Promise<import("axios").AxiosResponse<any>>;
}
export {};
