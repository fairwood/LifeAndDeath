import BattleUI from "../BattleUI";

const { ccclass, property } = cc._decorator;

@ccclass
export class Joystick extends cc.Component {


    @property(cc.Node)
    circle: cc.Node = null;
    @property(cc.Node)
    knob: cc.Node = null;

    private oriCircleX: number;
    private oriCircleY: number;

    private pressX: number;
    private pressY: number;
    private pressing: boolean;

    displacement: cc.Vec2;

    // private wasdPressDict = { [Laya.Keyboard.W]: false, [Laya.Keyboard.A]: false, [Laya.Keyboard.S]: false, [Laya.Keyboard.D]: false };
    // keyboard
    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onInputDown, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onInputDrag, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onInputUp, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onInputUp, this);

        // cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, function (event) {
        //     console.log("keyCode", event.keyCode)
        //     switch (event.keyCode) {
        //         case cc.KEY[1]:
        //             self.speedersKeyboard[0] = true;
        //             self.currentSpeeder = 0;
        //             break;
        //         case cc.KEY[2]:
        //             self.speedersKeyboard[1] = true;
        //             self.currentSpeeder = 1;
        //             break;
        //         case cc.KEY[3]:
        //             self.speedersKeyboard[2] = true;
        //             self.currentSpeeder = 2;
        //             break;
        //         case cc.KEY[4]:
        //             self.speedersKeyboard[3] = true;
        //             self.currentSpeeder = 3;
        //             break;
        //         case cc.KEY[5]:
        //             self.speedersKeyboard[4] = true;
        //             self.currentSpeeder = 4;
        //             break;
        //     }
        // });
        // cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, function (event) {
        //     switch (event.keyCode) {
        //         case cc.KEY[1]:
        //             self.speedersKeyboard[0] = false;
        //             break;
        //         case cc.KEY[2]:
        //             self.speedersKeyboard[1] = false;
        //             break;
        //         case cc.KEY[3]:
        //             self.speedersKeyboard[2] = false;
        //             break;
        //         case cc.KEY[4]:
        //             self.speedersKeyboard[3] = false;
        //             break;
        //         case cc.KEY[5]:
        //             self.speedersKeyboard[4] = false;
        //             break;
        //     }
        // });
    }

    onInputDown(event: cc.Event.EventTouch): void {
        this.pressing = true;
        let startPos = event.getStartLocation();
        let curPos = event.getLocation();
        this.displacement = null;
        this.circle.position = startPos;
    }
    onInputDrag(event: cc.Event.EventTouch): void {
        let startPos = event.getStartLocation();
        let curPos = event.getLocation();
        this.displacement = new cc.Vec2(curPos.x - startPos.x, curPos.y - startPos.y);

        this.circle.position = startPos;
        this.knob.position = this.displacement.normalize().mul(Math.min(92, this.displacement.mag()));
    }
    onInputUp(event: cc.Event.EventTouch): void {
        this.pressing = false;
        this.displacement = null;
        this.circle.position = new cc.Vec2(225, 225);
        this.knob.position = cc.Vec2.ZERO;
    }
}