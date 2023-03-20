import { AxiosInstance } from "axios";
import { Robot } from "./bot/Robot";
/****************************************************************/
/**
 * 框架类，实例化以后以 create 方法传入 qq 号实例化一个机器人
 */
export declare class CQBotSDK {
    private botList;
    private botID;
    private host;
    private postPort;
    private postPath;
    /**
     * 初始化一个机器人框架
     * @param {string} host 框架主机地址 127.0.0.1
     * @param {number} postPort 上报端口，如果多q均可使用该端口，配置时多个q也需要同一个反向 port 默认5701
     * @param {string} postPath 上报路径如 '/botmsg'，反向 post url 'http://127.0.0.1:5701/botmsg',默认为空
     */
    constructor(host: string, postPort?: number, postPath?: string);
    createHttp(listPort: any): AxiosInstance;
    /**
     * 创建一个 bot
     * @param qq QQ号码
     * @param listPort qq监听的正向端口
     */
    createBot(qq: string | number, listPort: any): Robot;
    /**
     * 销毁一个 bot
     * @param botID bot的id
     */
    destroyBot(bot: Robot): void;
}
