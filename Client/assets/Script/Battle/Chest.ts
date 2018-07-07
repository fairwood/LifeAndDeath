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
        let isNearby = mainCharacter && mainCharacter.node.position.sub(this.node.position).mag() < 50;
        this.hint.active = isNearby;

        if (isNearby && MainCtrl.Instance.engine.leftEnemyCnt <= 0){
            MainCtrl.Instance.engine.win();
        }
    }
}