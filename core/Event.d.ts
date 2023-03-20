export declare class Event {
    private _funList;
    constructor();
    /**
     * 该模型仅支持一个名字同一个事件
     * @param event 事件名称
     * @param fun   触发函数
     */
    on(event: string, fun: Function): void;
    /**
     * 解除该事件触发的功能
     * @param event 事件名称
     */
    un(event: string): void;
    /**
     * 触发事件
     * @param event 事件名称
     * @param args  想要传递的额外参数
     */
    fire(event: any, args: any): void;
}
