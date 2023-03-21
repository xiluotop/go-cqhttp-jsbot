/**
 * CQ Code 模板生成
 * 可根据官方文档进行调用该成员方法生成 CQ 码，使用 sendMessage 发送即可
 */
export = {
    /**
     * QQ 表情
     * @param id 表情号，可参考 https://github.com/kyubotics/coolq-http-api/wiki/表情-CQ-码-ID-表
     * @return [CQ:face,id=123]
     */
    Face(id: Number) {
        return `[CQ:face,id=${id}]`
    },

    /**
     * 发送语音
     * @param file 文件名，即为地址，文件路径或网络路径
     * @param magic 是否变声
     * @param cache 网络文件是否使用已缓存文件
     * @param timeout 超时设置
     * @return [CQ:record,file=http://baidu.com/1.mp3]
     */
    Record(file: string, magic: Number, cache: string, timeout: number) {
        return `[CQ:record,file=${file}${magic ? ',magic=1' : ''}${cache ? ',cache=1' : ''}${timeout ? ',timeout='+timeout : ''}]`
    },

    /**
     * 短视频
     * @param file 视频地址, 支持http和file发送
     * @param cover 视频封面, 支持http, file和base64发送, 格式必须为jpg
     * @return [CQ:video,file=http://baidu.com/1.mp4]
     */
    Video(file: string, cover: string) {
        return `[CQ:video,file=${file},cover=${cover}]`
    },

    /**
     * \@某人
     * @param qq \@的 QQ 号, all 表示全体成员
     * @param name 当在群中找不到此QQ号的名称时才会生效
     * @return [CQ:at,qq=10001000] [CQ:at,qq=123,name=不在群的QQ] [CQ:at,qq=all]
     */
    At(qq: string, name: string) {
        return `[CQ:at,qq=${qq}${name ? ',name=' + name : ''}]`
    },

    /**
     * 链接分享
     * @param url URL
     * @param title 标题
     * @param content 发送时可选, 内容描述
     * @param image 发送时可选, 图片 URL
     * @return [CQ:share,url=http://baidu.com,title=百度]
     */
    Share(url: string, title: string, content: string, image: string) {
        return `[CQ:share,url=${url},title=${title}${content ? ',content=' + content : ''}${image ? ',image=' + image : ''}]`
    },

    /**
     * 音乐分享
     * @param type qq 163 xm 分别表示使用 QQ 音乐、网易云音乐、虾米音乐，custom 表示自定义分享
     * @param id  仅在 qq，164，xm 有效
     * @param url 点击后跳转目标 URL ,仅自定义使用
     * @param audio 音乐 URL ,仅自定义使用
     * @param title 标题 ,仅自定义使用
     * @param content 发送时可选, 内容描述,仅自定义使用
     * @param image 发送时可选, 图片 URL ,仅自定义使用
     * @return [CQ:music,type=custom,url=http://baidu.com,audio=http://baidu.com/1.mp3,title=音乐标题]
     */
    Music(type: string, id: Number, url: string, audio: string, title: string, content: string, image: string) {
        return `[CQ:music,type=${type}${type != 'custom' ? ',id=' + id : ''}${type == 'custom' ? ',url=' + url : ''}${type == 'custom' ? ',audio=' + audio : ''}${type == 'custom' ? ',title=' + title : ''}${(type == 'custom' && content) ? ',content=' + content : ''}${(type == 'custom' && image) ? ',image=' + image : ''}]`
    },

    /**
     * 图片
     * @param file 图片文件名支持绝对路径，网络 URL，Base64 编码
     * @param type 图片类型, flash 表示闪照, show 表示秀图, 默认普通图片
     * @param subType 图片子类型, 只出现在群聊.
     * @param url 图片 URL 只在通过网络 URL 发送时有效, 表示是否使用已缓存的文件, 默认
     * @param cache 只在通过网络 URL 发送时有效, 表示是否使用已缓存的文件, 默认 1
     * @param id 发送秀图时的特效id, 默认为40000
     * @return [CQ:image,file=http://baidu.com/1.jpg,type=show,id=40004]
     */
    Image(file: string, type: string, subType: number, url: string, cache: number, id: number = 4000) {
        return `[CQ:image,file=${file}${type ? ',type=' + type : ''}${subType ? ',subType=' + subType : ''}${url ? ',url=' + url : ''}${cache ? ',cache=' + cache : ''},id=${id}]`
    },

    /**
     * 回复
     * @param id 回复时所引用的消息id, 必须为本群消息.
     * @param text 自定义回复的信息
     * @param qq 自定义回复时的自定义QQ, 如果使用自定义信息必须指定
     * @param time 自定义回复时的时间, 格式为Unix时间
     * @param seq 起始消息序号, 可通过 get_msg 获得
     * @return [CQ:reply,id=123456] [CQ:reply,text=Hello World,qq=10086,time=3376656000,seq=5123]
     */
    Reply(id: number, text: string, qq: number, time: number, seq: number) {
        return `[CQ:reply${!text ? ',id=' + id : ''}${text ? ',text=' + text : ''}${qq ? ',qq=' + qq : ''}${time ? ',time=' + time : ''}${seq ? ',seq=' + seq : ''}]`
    },

    /**
     * 红包(收)
     * @param title 祝福语/口令
     * @return [CQ:redbag,title=恭喜发财]
     */
    Redbag(title: string) {
        return `[CQ:redbag,title=${title}]`
    },

    /**
     * 戳一戳
     * @param qq 需要戳的成员
     * @return [CQ:poke,qq=123456]
     */
    Poke(qq: string) {
        return `[CQ:poke,qq=${qq}]`
    },

    /**
     * 礼物
     * @param qq    接收礼物的成员
     * @param id    礼物的类型
     * @return [CQ:gift,qq=123456,id=8]
     */
    Gift(qq: string, id: number) {
        return `[CQ:gift,qq=${qq},id=${id}]`
    },

    /**
     * 合并转发（收）
     * @param id 合并转发ID, 需要通过 /get_forward_msg API获取转发的具体内容
     * @return [CQ:forward,id=xxxx]
     */
    Forward(id: string) {
        return `[CQ:forward,id=${id}]`
    },

    /**
     * XML 消息
     * @param data xml内容, xml中的value部分, 记得实体化处理
     * @return [CQ:xml,data=xxxx]
     */
    XML(data: string) {
        return `[CQ:xml,data=${data}]`
    },

    /**
     * JSON 消息
     * @param data json内容, json的所有字符串记得实体化处理
     * @param resid 默认不填为0, 走小程序通道, 填了走富文本通道发送
     * @return [CQ:json,data=xxxx]
     * @note json中的字符串需要进行转义 ```","=> &#44;"&"=> &amp;"["=> &#91;"]"=> &#93;```
     */
    JSON(data: string, resid: number) {
        return `[CQ:json,data=${data}${resid ? ',resid' + resid : ''}]`
    },

    /**
     * 一种xml的图片消息（装逼大图）
     * @param file 和image的file字段对齐, 支持也是一样的
     * @param minwidth 默认不填为400, 最小width
     * @param minheight 默认不填为400, 最小height
     * @param maxwidth 默认不填为500, 最大width
     * @param maxheight 默认不填为1000, 最大height
     * @param source 分享来源的名称, 可以留空
     * @param icon 分享来源的icon图标url, 可以留空
     * @return [CQ:cardimage,file=https://i.pixiv.cat/img-master/img/2020/03/25/00/00/08/80334602_p0_master1200.jpg]
     */
    Cardimage(file: string, minwidth: number, minheight: number, maxwidth: number, maxheight: number, source: string, icon: string) {
        return `[CQ:cardimage,file=${file}${minwidth ? ',minwidth=' + minwidth : ''}${minheight ? ',minheight=' + minheight : ''}${maxwidth ? ',maxwidth=' + maxwidth : ''}${maxheight ? ',maxheight=' + maxheight : ''}${source ? ',source=' + source : ''}${icon ? ',icon=' + icon : ''}]`
    },

    /**
     * 文本转语音,通过TX的TTS接口, 采用的音源与登录账号的性别有关
     * @param text 内容
     * @return [CQ:tts,text=这是一条测试消息]
     */
    Tts(text: string) {
        return `[CQ:tts,text=${text}]`
    }
}