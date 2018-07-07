import MainCtrl from "../MainCtrl";

const { ccclass, property } = cc._decorator;

@ccclass
export class Chest extends cc.Component {
    @property(cc.Node)
    hint: cc.Node = null;
    @property(cc.Label)
    lblLeftEnemy: cc.Label = null;
    @property(cc.Label)
    lblTotalReward: cc.Label = null;
    update() {
        let mainCharacter = MainCtrl.Instance.engine.mainCharacter;
        this.hint.active = (mainCharacter && mainCharacter.node.position.sub(this.node.position).mag() < 50);
    }
}