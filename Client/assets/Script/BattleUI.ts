import CvsMain from "./CvsMain";
import BaseUI from "./BaseUI";
import MainCtrl from "./MainCtrl";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BattleUI extends BaseUI {
    static Instance: BattleUI;
    onLoad() {
        BattleUI.Instance = this;
        this.node.active = false;

    }

    @property(cc.Node)
    islandContainer: cc.Node = null;

}
