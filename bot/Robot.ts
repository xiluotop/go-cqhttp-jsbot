import { Event } from '../core/Event'
import { AxiosInstance } from 'axios';
import qs from 'qs';
import CQCode from './CQCode'

// qq,group 消息结构体
interface InfoDataPack {
  fromUser: number,
  fromGroup: number,
  rawMessage: string,
  robot: number,
  isAt: boolean,
  QQInfo: {
    card: string,
    nickname: string
  },
  success: boolean,
  type: string,
}

// 事件消息结构体
interface EventDataPack {
  fromUser: {},
  fromGroup: {},
  rawMessage: '',
  robot: number,
  isAt: boolean,
  QQInfo: {},
  user_id: number,
  group_id: number,
  notice_type: string,
  nickname: string,
  sub_type: string,
  success: boolean,
  type: string,
}

/**
 * 机器人类，有回调事件，上发操作等功能。
 */
export class Robot extends Event {
  private qq: string | number = '';
  private botID: string = '';
  private http: AxiosInstance = null;
  private _onPrivateMsg: Array<Function> = [];
  private _onGroupMsg: Array<Function> = [];
  private _onEventMsg: Array<Function> = [];
  private groupFunMap: Map<string | number, Function> = null;
  private privateCmdAction: Map<Array<string | number>, Function> = null;
  private groupCmdAction: Map<Array<string | number>, Function> = null;

  constructor(qq: string | number, http: AxiosInstance, botID) {
    super();
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
        })
      }

      // 遍历注册指令
      this.privateCmdAction.forEach((doAction, cmdArray) => {
        if (cmdArray.includes(pack.rawMessage)) {
          doAction(pack);
        }
      })
    })

    this.on('group', pack => {
      if (this._onGroupMsg) {
        this._onGroupMsg.forEach(fun => {
          if (fun) {
            fun(pack);
          }
        })
      }
      let groupFun = this.groupFunMap.get(String(pack.fromGroup));
      if (groupFun) {
        groupFun(pack);
      }

      // 遍历注册指令
      this.groupCmdAction.forEach((doAction, cmdArray) => {
        if (cmdArray.includes(pack.rawMessage) && ((doAction as any).group == pack.fromGroup)) {
          doAction(pack);
        }
      })
    })

    this.on('notice', pack => {
      if (this._onEventMsg) {
        this._onEventMsg.forEach(fun => {
          if (fun) {
            fun(pack);
          }
        })
      }
    })
  }

  /**
   * 获取 CQ Code 模板对象
   */
  public get CQCode() {
    return CQCode
  }

  /**
   * 返回实例化机器人的请求器
   */
  public get httpRequest() {
    return this.http
  }

  /**
   * 返回机器人序号 ID
   */
  public get id() {
    return this.botID
  }

  /**
   * 返回机器人 QQ 号
   */
  public get QQ() {
    return this.qq
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
  public onPrivateMsg(fun: (pack: InfoDataPack) => void) {
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
  public onGroupMsg(fun: (pack: InfoDataPack) => void) {
    this._onGroupMsg.push(fun);
  }

  /**
   * 绑定特定群组回调消息
   * @param group 群号
   * @param fun   回调函数，返回的参数为消息数据包
   */
  public setOnGroupMsg(group: string | number, fun: (pack: InfoDataPack) => void) {
    this.groupFunMap.set(String(group), fun);
  }
  public getOnGroupMsg(group: string | number) {
    return this.groupFunMap.get(String(group))
  }

  /**
   * 当操作事件触发时，回调时带回消息包
   */
  public onEventMsg(fun: (pack: EventDataPack) => void) {
    this._onEventMsg.push(fun);
  }

  /**
   * 快速注册一个私聊指令并执行对应的方法
   * @param {Array<string>} cmd       监听的指令
   * @param doAction  要执行的动作，回调参数为发送者相关信息
   */
  public regPrivateCmd(cmd: Array<string | number>, doAction: (pack: InfoDataPack) => void) {
    this.privateCmdAction.set(cmd, doAction);
  }

  /**
   * 快速注册一个群要使用的指令并执行对应的方法
   * @param group     监听的目标群
   * @param {Array<string>} cmd       监听的指令
   * @param doAction  要执行的动作，回调参数为发送者相关信息
   */
  public regGroupCmd(group: string | number, cmd: Array<string | number>, doAction: (pack: InfoDataPack) => void) {
    Object.assign(doAction, {
      group
    })
    this.groupCmdAction.set(cmd, doAction);
  }

  /************************************ Bot 账号 *************************************/
  /**
   * 获取登录号信息
   * @return Promise
   */
  public getLoginInfo() {
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
  public setQQProfile(nickname: string, company: string, email: string, college: string, personal_note: string) {
    return this.http.post('/send_msg',
      qs.stringify({
        nickname,
        company,
        email,
        college,
        personal_note
      })
    )
  }

  /**
   * 获取企点账号信息,该API只有企点协议可用
   * @return promise
   */
  public qidianGetAccountInfo() {
    return this.http.post('/qidian_get_account_info');
  }

  /**
   * 获取在线机型
   * @param model 机型名称
   * @return promise
   */
  public getModelShow(model: string) {
    return this.http.post('/_get_model_show', qs.stringify({
      model
    }));
  }

  /**
     * 设置在线机型
     * @param model 机型名称
     * @param model_show 
     * @return promise
     */
  public setModelShow(model: string, model_show: string) {
    return this.http.post('/_set_model_show', qs.stringify({
      model,
      model_show
    }));
  }

  /**
   * 获取当前账号在线客户端列表
   * @param no_cache 是否无视缓存
   * @return Promise
   */
  public getOnlineClients(no_cache: boolean) {
    return this.http.post('/get_online_clients', qs.stringify({
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
  public getStrangerInfo(user_id: number, no_cache: boolean) {
    return this.http.post('/get_stranger_info', qs.stringify({
      user_id,
      no_cache
    }));
  }

  /**
   * 获取好友列表
   * @return Promise
   */
  public getFriendList() {
    return this.http.post('/get_friend_list');
  }

  /**
   * 获取单向好友列表
   * @return Promise
   */
  public getUnidirectionalFriendList() {
    return this.http.post('/get_unidirectional_friend_list');
  }

  /************************************ 好友操作 *************************************/
  /**
   * 删除好友
   * @param user_id 好友 QQ 号
   * @return Promise
   */
  public deleteFriend(user_id: boolean) {
    return this.http.post('/delete_friend', qs.stringify({
      user_id
    }));
  }

  /**
   * 删除单向好友
   * @param user_id 好友 QQ 号
   * @return Promise
   */
  public deleteUnidirectionalFriend(user_id: boolean) {
    return this.http.post('/delete_unidirectional_friend', qs.stringify({
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
  public sendPrivateMsg(toqq: string | number, text: string) {
    return this.http.post('/send_msg',
      qs.stringify({
        message_type: 'private',
        user_id: toqq,
        message: text,
      })
    )
  }

  /**
   * 发送群临时会话消息
   * @param fromGroup 来自群号
   * @param toqq 目标 QQ
   * @param text 发送文本
   * @return httpRequestPromise 返回请求的 promise
   */
  public sendGroupPrivateMsg(fromGroup: string | number, toqq: string | number, text: string) {
    return this.http.post('/send_private_msg',
      qs.stringify({
        user_id: toqq,
        group_id: fromGroup,
        message: text,
      })
    )
  }

  /**
   * 发送群组消息
   * @param toGroup 目标群
   * @param text 文本
   * @param anonymous 是否匿名，默认：false
   * @return httpRequestPromise 返回请求的 promise
   */
  public sendGroupMsg(toGroup: string | number, text: string, anonymous: boolean = false) {
    return this.http.post('/send_msg',
      qs.stringify({
        message_type: 'group',
        group_id: toGroup,
        message: text,
        anonymous
      })
    )
  }

  /**
   * 私聊发送图片
   * @param toqq      发送目标 qq
   * @param imgSrc    图片资源：url,base64,路径均可
   * @param flashpic  是否发送闪照，默认 false
   * @return httpRequestPromise 返回请求的 promise
   */
  public sendPrivateImg(toqq: string | number, imgSrc: string, flashpic: boolean = false) {
    return this.sendPrivateMsg(toqq, `[CQ:image,file=${imgSrc},type=${flashpic ? 'flash' : 'show'},id=40004]`)
  }

  /**
   * 发送群临时私聊图片
   * @param fromGroup 群号
   * @param toqq      目标 qq
   * @param imgSrc    图片资源
   * @param flashpic  是否闪照
   * @return httpRequestPromise 返回请求的 promise
   */
  public sendGroupPrivateImg(fromGroup: string | number, toqq: string | number, imgSrc: string, flashpic: boolean = false) {
    return this.sendGroupPrivateMsg(fromGroup, toqq, `[CQ:image,file=${imgSrc},type=${flashpic ? 'flash' : 'show'},id=40004]`)
  }

  /**
   * 向群发送图片
   * @param togroup  目标群号
   * @param imgSrc   图片资源
   * @param flashpic 是否为闪照
   * @return httpRequestPromise 返回请求的 promise
   */
  public sendGroupImg(togroup: string | number, imgSrc: string, flashpic: boolean = false) {
    return this.sendGroupMsg(togroup, `[CQ:image,file=${imgSrc},type=${flashpic ? 'flash' : ''},id=40004,subType=0]`)
  }

  /**
   * 私聊发送语音
   * @param toqq      发送目标 qq
   * @param recordSrc    图片资源：url,base64,路径均可
   * @return httpRequestPromise 返回请求的 promise
   */
  public sendPrivateRecord(toqq: string | number, recordSrc: string) {
    return this.sendPrivateMsg(toqq, `[CQ:image,file=${recordSrc}]`)
  }

  /**
   * 发送群临时私聊图片
   * @param fromGroup 群号
   * @param toqq      目标 qq
   * @param recordSrc    图片资源：url,base64,路径均可
   * @return httpRequestPromise 返回请求的 promise
   */
  public sendGroupPrivateRecord(fromGroup: string | number, toqq: string | number, recordSrc: string) {
    return this.sendGroupPrivateMsg(fromGroup, toqq, `[CQ:record,file=${recordSrc}]`)
  }

  /**
   * 向群发送图片
   * @param togroup  目标群号
   * @param recordSrc    图片资源：url,base64,路径均可
   * @return httpRequestPromise 返回请求的 promise
   */
  public sendGroupRecord(togroup: string | number, recordSrc: string) {
    return this.sendGroupMsg(togroup, `[CQ:record,file=${recordSrc}]`)
  }

  /**
   * 获取消息
   * @param message_id 消息id
   * @return promise
   */
  public getMsg(message_id: number) {
    return this.http.post('/get_msg',
      qs.stringify({
        message_id
      })
    )
  }

  /**
   * 撤回消息
   * @param message_id 消息id
   * @return promise
   */
  public deleteMsg(message_id: number) {
    return this.http.post('/delete_msg',
      qs.stringify({
        message_id
      })
    )
  }

  /**
   * 标记消息已读
   * @param message_id 消息id
   * @return promise
   */
  public markMsgAsRead(message_id: number) {
    return this.http.post('/mark_msg_as_read',
      qs.stringify({
        message_id
      })
    )
  }

  /**
   * 获取合并转发内容
   * @param message_id 消息id
   * @return promise
   */
  public getForwardMsg(message_id: number) {
    return this.http.post('/get_forward_msg',
      qs.stringify({
        message_id
      })
    )
  }

  /**
   * 获取合并转发内容
   * @param group_id 群号
   * @param messages 自定义转发消息, 具体看 CQcode
   * @return promise
   */
  public sendGroupForwardMsg(group_id: number, messages: any) {
    return this.http.post('/send_group_forward_msg',
      qs.stringify({
        group_id,
        messages
      })
    )
  }

  /**
   * 发送合并转发 ( 好友 )
   * @param user_id 好友QQ号
   * @param messages 自定义转发消息, 具体看 CQcode
   * @return promise
   */
  public sendPrivateForwardMsg(user_id: number, messages: any) {
    return this.http.post('/send_private_forward_msg',
      qs.stringify({
        user_id,
        messages
      })
    )
  }

  /**
   * 获取群消息历史记录
   * @param message_seq 起始消息序号, 可通过 get_msg 获得
   * @param group_id 号
   * @return promise
   */
  public getGroupMsgHistory(message_seq: number, group_id: number) {
    return this.http.post('/get_group_msg_history',
      qs.stringify({
        message_seq,
        group_id
      })
    )
  }

  /************************************ 图片 *************************************/
  /**
   * 获取图片信息
   * @param file 图片缓存文件名
   * @return promise 
   */
  public getImage(file: string) {
    return this.http.post('/get_image',
      qs.stringify({
        file
      })
    )
  }

  /**
   * 检查是否可以发送图片
   * @return promise
   */
  public canSendImage(file: string) {
    return this.http.post('/can_send_image')
  }

  /**
   * 图片 OCR
   * @param image 图片ID
   * @return promise 
   */
  public ocrImage(image: string) {
    return this.http.post('/ocr_image',
      qs.stringify({
        image
      })
    )
  }

  /************************************ 语音 *************************************/
  /**
   * 检查是否可以发送语音
   * @return promise
   */
  public canSendRecord(file: string) {
    return this.http.post('/can_send_record')
  }

  /************************************ 处理 *************************************/
  /**
   * 处理加好友请求
   * @param flag 加好友请求的 flag（需从上报的数据中获得）
   * @param approve 是否同意请求
   * @param remark    添加后的好友备注（仅在同意时有效）
   * @return promise
   */
  public setFriendAddRequest(flag: string, approve: boolean, remark: string) {
    return this.http.post('/set_friend_add_request', qs.stringify({
      flag,
      approve,
      remark
    }))
  }

  /**
   * 处理加群请求／邀请
   * @param flag 加群请求的 flag（需从上报的数据中获得）
   * @param sub_type add 或 invite, 请求类型（需要和上报消息中的 sub_type 字段相符）
   * @param approve 是否同意请求／邀请
   * @param reason    拒绝理由（仅在拒绝时有效）
   * @return promise
   */
  public setGroupAddRequest(flag: string, sub_type: string, approve: boolean, reason: string) {
    return this.http.post('/set_group_add_request', qs.stringify({
      flag,
      sub_type,
      approve,
      reason
    }))
  }

  /************************************ 群消息 *************************************/
  /**
   * 获取群信息
   * @param group_id 群号
   * @param no_cache 是否不使用缓存（使用缓存可能更新不及时, 但响应更快）
   * @return promise
   */
  public getGroupInfo(group_id: string, no_cache: string) {
    return this.http.post('/get_group_info', qs.stringify({
      group_id,
      no_cache
    }))
  }

  /**
   * 获取群列表
   * @param no_cache 是否不使用缓存（使用缓存可能更新不及时, 但响应更快）
   * @return promise
   */
  public getGroupList(no_cache: string) {
    return this.http.post('/get_group_list', qs.stringify({
      no_cache
    }))
  }

  /**
   * 获取群成员信息
   * @param group_id 群号
   * @param user_id QQ 号
   * @param no_cache 是否不使用缓存（使用缓存可能更新不及时, 但响应更快）
   * @return promise
   */
  public getGroupMemberInfo(group_id: number, user_id: number, no_cache: string) {
    return this.http.post('/get_group_member_info', qs.stringify({
      group_id,
      user_id,
      no_cache
    }))
  }

  /**
   * 获取群成员列表
   * @param group_id 群号
   * @param no_cache 是否不使用缓存（使用缓存可能更新不及时, 但响应更快）
   * @return promise
   */
  public getGroupMemberList(group_id: number, no_cache: string) {
    return this.http.post('/get_group_member_list', qs.stringify({
      group_id,
      no_cache
    }))
  }

  /**
   * 获取群荣誉信息
   * @param group_id 群号
   * @param type 要获取的群荣誉类型, 可传入 talkative performer legend strong_newbie emotion 以分别获取单个类型的群荣誉数据, 或传入 all 获取所有数据
   * @return promise
   */
  public getGroupHonorInfo(group_id: number, type: string) {
    return this.http.post('/get_group_honor_info', qs.stringify({
      group_id,
      type
    }))
  }

  /**
   * 获取群系统消息
   * @return promise
   */
  public getGroupSystemMsg() {
    return this.http.post('/get_group_system_msg')
  }

  /**
   * 获取精华消息列表
   * @param group_id 群号
   * @return promise
   */
  public getEssenceMsgList(group_id: number) {
    return this.http.post('/get_essence_msg_list', qs.stringify({
      group_id
    }))
  }

  /**
   * 获取群 @全体成员 剩余次数
   * @param group_id 群号
   * @return promise
   */
  public getGroupAtallremain(group_id: number) {
    return this.http.post('/get_group_at_all_remain', qs.stringify({
      group_id
    }))
  }

  /************************************ 群设置 *************************************/
  /**
   * 设置群名
   * @param group_id 群号
   * @param group_name 新群名
   * @return promise
   */
  public setGroupName(group_id: number, group_name: string) {
    return this.http.post('/set_group_name', qs.stringify({
      group_id,
      group_name
    }))
  }

  /**
   * 设置群头像
   * @param group_id 群号
   * @param file 图片文件名，格式同图片参数接口
   * @param cache 表示是否使用已缓存的文件
   * @return promise
   */
  public setGroupPortrait(group_id: number, file: string, cache: boolean) {
    return this.http.post('/set_group_portrait', qs.stringify({
      group_id,
      file,
      cache
    }))
  }

  /**
   * 设置群管理员
   * @param group_id 群号
   * @param user_id 要设置管理员的 QQ 号
   * @param enable true 为设置, false 为取消
   * @return promise
   */
  public setGroupAdmin(group_id: number, user_id: number, enable: boolean) {
    return this.http.post('/set_group_admin', qs.stringify({
      group_id,
      user_id,
      enable
    }))
  }

  /**
   * 设置群名片 ( 群备注 )
   * @param group_id 群号
   * @param user_id 要设置的 QQ 号
   * @param card 群名片内容, 不填或空字符串表示删除群名片
   * @return promise
   */
  public setGroupCard(group_id: number, user_id: number, card: string) {
    return this.http.post('/set_group_card', qs.stringify({
      group_id,
      user_id,
      card
    }))
  }

  /**
   * 设置群组专属头衔
   * @param group_id 群号
   * @param user_id 要设置的 QQ 号
   * @param special_title 专属头衔, 不填或空字符串表示删除专属头衔
   * @param duration 专属头衔有效期, 单位秒, -1 表示永久, 不过此项似乎没有效果, 可能是只有某些特殊的时间长度有效, 有待测试
   * @return promise
   */
  public setGroupSpecialTitle(group_id: number, user_id: number, special_title: string, duration: number) {
    return this.http.post('/set_group_special_title', qs.stringify({
      group_id,
      user_id,
      special_title,
      duration
    }))
  }

  /************************************ 群操作 *************************************/
  /**
   * 群单人禁言
   * @param group_id 群号
   * @param user_id 要禁言的 QQ 号
   * @param duration 禁言时长, 单位秒, 0 表示取消禁言
   * @return promise
   */
  public setGroupBan(group_id: number, user_id: number, duration: number) {
    return this.http.post('/set_group_ban', qs.stringify({
      group_id,
      user_id,
      duration
    }))
  }

  /**
   * 群全员禁言
   * @param group_id 群号
   * @param enable 是否禁言
   * @return promise
   */
  public setGroupWholeBan(group_id: number, enable: boolean) {
    return this.http.post('/set_group_whole_ban', qs.stringify({
      group_id,
      enable
    }))
  }

  /**
   * 群匿名用户禁言
   * @param group_id 群号
   * @param anonymous 可选, 要禁言的匿名用户对象（群消息上报的 anonymous 字段）
   * @param flag 可选, 要禁言的匿名用户的 flag（需从群消息上报的数据中获得）
   * @param duration 禁言时长, 单位秒, 无法取消匿名用户禁言
   * @return promise
   */
  public setGroupAnonymousBan(group_id: number, anonymous: any, flag: string, duration: number) {
    return this.http.post('/set_group_anonymous_ban', qs.stringify({
      group_id,
      anonymous,
      flag,
      duration
    }))
  }

  /**
   * 设置精华消息
   * @param message_id 消息ID
   * @return promise
   */
  public setEssenceMsg(message_id: number) {
    return this.http.post('/set_essence_msg', qs.stringify({
      message_id
    }))
  }

  /**
   * 移出精华消息
   * @param message_id 消息ID
   * @return promise
   */
  public deleteEssenceMsg(message_id: number) {
    return this.http.post('/delete_essence_msg', qs.stringify({
      message_id
    }))
  }

  /**
   * 群打卡
   * @param group_id 群号
   * @return promise
   */
  public sendGroupSign(group_id: number) {
    return this.http.post('/send_group_sign', qs.stringify({
      group_id
    }))
  }

  /**
   * 发送群公告
   * @param group_id 群号
   * @param content 公告内容
   * @param image 图片路径（可选）
   * @return promise
   */
  public sendGroupNotice(group_id: number, content: string, image: string) {
    return this.http.post('/_send_group_notice', qs.stringify({
      group_id,
      content,
      image
    }))
  }

  /**
   * 获取群公告
   * @param group_id 群号
   * @return promise
   */
  public getGroupNotice(group_id: number) {
    return this.http.post('/_get_group_notice', qs.stringify({
      group_id
    }))
  }

  /**
   * 群组踢人
   * @param group_id 群号
   * @param user_id 要踢的 QQ 号
   * @param reject_add_request 拒绝此人的加群请求
   * @return promise
   */
  public setGroupKick(group_id: number, user_id: number, reject_add_request: boolean) {
    return this.http.post('/set_group_kick', qs.stringify({
      group_id,
      user_id,
      reject_add_request
    }))
  }

  /**
   * 退出群组
   * @param group_id 群号
   * @param is_dismiss 是否解散, 如果登录号是群主, 则仅在此项为 true 时能够解散
   * @return promise
   */
  public setGroupLeave(group_id: number, is_dismiss: boolean) {
    return this.http.post('/set_group_leave', qs.stringify({
      group_id,
      is_dismiss
    }))
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
  public uploadGroupFile(group_id: number, file: string, name: string, folder: string) {
    return this.http.post('/upload_group_file', qs.stringify({
      group_id,
      file,
      name,
      folder
    }))
  }

  /**
   * 删除群文件
   * @param group_id 群号
   * @param file_id 文件ID 参考 File 对象
   * @param busid 文件类型 参考 File 对象
   * @return promise
   */
  public deleteGroupFile(group_id: number, file_id: string, busid: number) {
    return this.http.post('/delete_group_file', qs.stringify({
      group_id,
      file_id,
      busid
    }))
  }

  /**
   * 创建群文件文件夹,仅能在根目录创建文件夹
   * @param group_id 群号
   * @param name 文件夹名称
   * @param parent_id 仅能为 /
   * @return promise
   */
  public createGroupFileFolder(group_id: number, name: string, parent_id: string) {
    return this.http.post('/create_group_file_folder', qs.stringify({
      group_id,
      name,
      parent_id
    }))
  }

  /**
   * 删除群文件文件夹
   * @param group_id 群号
   * @param folder_id 文件夹ID 参考 Folder 对象
   * @return promise
   */
  public deleteGroupFolder(group_id: number, folder_id: string) {
    return this.http.post('/delete_group_folder', qs.stringify({
      group_id,
      folder_id
    }))
  }

  /**
   * 获取群文件系统信息
   * @param group_id 群号
   * @return promise
   */
  public getGroupFileSystemInfo(group_id: number) {
    return this.http.post('/get_group_file_system_info', qs.stringify({
      group_id
    }))
  }

  /**
   * 获取群根目录文件列表
   * @param group_id 群号
   * @return promise
   */
  public getGroupRootFiles(group_id: number) {
    return this.http.post('/get_group_root_files', qs.stringify({
      group_id
    }))
  }

  /**
   * 获取群文件资源链接
   * @param group_id 群号
   * @param file_id 文件ID 参考 File 对象
   * @param busid 文件类型 参考 File 对象
   * @return promise
   */
  public getGroupFileUrl(group_id: number, file_id: string, busid: number) {
    return this.http.post('/get_group_file_url', qs.stringify({
      group_id,
      file_id,
      busid
    }))
  }

  /**
   * 上传私聊文件,只能上传本地文件, 需要上传 http 文件的话请先调用 download_file API下载
   * @param user_id 对方 QQ 号
   * @param file 本地文件路径
   * @param name 文件名称
   * @return promise
   */
  public uploadPrivateFile(user_id: number, file: string, name: string) {
    return this.http.post('/upload_private_file', qs.stringify({
      user_id,
      file,
      name
    }))
  }

  /************************************ Go-CqHttp 相关 *************************************/
  /**
   * 获取版本信息
   * @return promise
   */
  public getVersionInfo() {
    return this.http.post('/get_version_info')
  }

  /**
   * 获取状态
   * @return promise
   */
  public getStatus() {
    return this.http.post('/get_status')
  }

  /**
   * 获取状态
   * @param file 事件过滤器文件
   * @return promise
   */
  public reloadEventFilter(file: string) {
    return this.http.post('/reload_event_filter', qs.stringify({
      file
    }))
  }

  /**
   * 下载文件到缓存目录
   * @param url 链接地址
   * @param thread_count 下载线程数
   * @param headers 自定义请求头
   * @return promise
   */
  public downloadFile(url: string, thread_count: number, headers: string | []) {
    return this.http.post('/download_file', qs.stringify({
      url,
      thread_count,
      headers
    }))
  }

  /**
   * 检查链接安全性
   * @param url 需要检查的链接
   * @return promise
   */
  public checkUrlSafely(url: string) {
    return this.http.post('/check_url_safely', qs.stringify({
      url
    }))
  }
}