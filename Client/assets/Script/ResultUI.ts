import CvsMain from "./CvsMain";
import BaseUI from "./BaseUI";
import MainCtrl from "./MainCtrl";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ResultUI extends BaseUI {
    static Instance: ResultUI;
    onLoad() {
        ResultUI.Instance = this;
        this.node.active = false;

    }

    @property(cc.Node)
    islandContainer: cc.Node = null;

}
