import { _decorator, Component, Node, Sprite, color, Color, ValueType, Input, EventTouch } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Cell')
export class Cell extends Component {
    private _isAlive: boolean = false
    public get isAlive() {
        return this._isAlive
    }
    public set isAlive(value: boolean) {
        this._isAlive = value
        if (this.isAlive) {
            // 存活的细胞设置成黑色
            this.node.getComponent(Sprite).color = new Color(0, 0, 0)
        } else {
            // 死亡的细胞设置成白色
            this.node.getComponent(Sprite).color = new Color(255, 255, 255)
        }
    }

    onLoad() {
        this.node.on(Input.EventType.TOUCH_START, this.onTouchStart, this)
    }

    onTouchStart(event: EventTouch) {
        this.switchState()
    }

    switchState(): void {
        this.isAlive = !this.isAlive
    }
}

