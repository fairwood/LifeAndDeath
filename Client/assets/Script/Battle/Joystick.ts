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

    touchDisplacement: cc.Vec2;
    displacement: cc.Vec2;

    private wasdPressDict = { [cc.KEY.w]: false, [cc.KEY.a]: false, [cc.KEY.s]: false, [cc.KEY.d]: false };
    // keyboard
    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onInputDown, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onInputDrag, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onInputUp, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onInputUp, this);

        let self = this;
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, function (event) {
            self.wasdPressDict[event.keyCode] = true;
            // switch (event.keyCode) {
            //     case cc.KEY.w:
            //         self.speedersKeyboard[0] = true;
            //         self.currentSpeeder = 0;
            //         break;
            //     case cc.KEY[2]:
            //         self.speedersKeyboard[1] = true;
            //         self.currentSpeeder = 1;
            //         break;
            //     case cc.KEY[3]:
            //         self.speedersKeyboard[2] = true;
            //         self.currentSpeeder = 2;
            //         break;
            //     case cc.KEY[4]:
            //         self.speedersKeyboard[3] = true;
            //         self.currentSpeeder = 3;
            //         break;
            //     case cc.KEY[5]:
            //         self.speedersKeyboard[4] = true;
            //         self.currentSpeeder = 4;
            //         break;
            // }
        });
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, function (event) {
            self.wasdPressDict[event.keyCode] = false;
            // switch (event.keyCode) {
            //     case cc.KEY[1]:
            //         self.speedersKeyboard[0] = false;
            //         break;
            //     case cc.KEY[2]:
            //         self.speedersKeyboard[1] = false;
            //         break;
            //     case cc.KEY[3]:
            //         self.speedersKeyboard[2] = false;
            //         break;
            //     case cc.KEY[4]:
            //         self.speedersKeyboard[3] = false;
            //         break;
            //     case cc.KEY[5]:
            //         self.speedersKeyboard[4] = false;
            //         break;
            // }
        });
    }

    update() {
        this.displacement = cc.Vec2.ZERO;
        let keyboardDisplacement = new cc.Vec2(0, 0);
        if (this.wasdPressDict[cc.KEY.w]) {
            console.log('w');
            keyboardDisplacement.addSelf(new cc.Vec2(0, 1));
        }
        if (this.wasdPressDict[cc.KEY.a]) {
            keyboardDisplacement.addSelf(new cc.Vec2(-1, 0));
        }
        if (this.wasdPressDict[cc.KEY.s]) {
            keyboardDisplacement.addSelf(new cc.Vec2(0, -1));
        }
        if (this.wasdPressDict[cc.KEY.d]) {
            keyboardDisplacement.addSelf(new cc.Vec2(1, 0));
        }
        this.displacement = keyboardDisplacement.clone();
        console.log('keyboardDisplacement', keyboardDisplacement)
        if (this.touchDisplacement) this.displacement.addSelf(this.touchDisplacement);
        if (this.displacement.mag() <= 0) this.displacement = null;
        console.log('disp', this.displacement)
    }

    onInputDown(event: cc.Event.EventTouch): void {
        this.pressing = true;
        let startPos = event.getStartLocation();
        this.touchDisplacement = null;
        this.circle.position = startPos;
    }
    onInputDrag(event: cc.Event.EventTouch): void {
        let startPos = event.getStartLocation();
        let curPos = event.getLocation();
        this.touchDisplacement = new cc.Vec2(curPos.x - startPos.x, curPos.y - startPos.y);

        this.circle.position = startPos;
        this.knob.position = this.touchDisplacement.normalize().mul(Math.min(92, this.touchDisplacement.mag()));
    }
    onInputUp(event: cc.Event.EventTouch): void {
        this.pressing = false;
        this.touchDisplacement = null;
        this.circle.position = new cc.Vec2(225, 225);
        this.knob.position = cc.Vec2.ZERO;
    }
}