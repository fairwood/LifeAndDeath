import CvsMain from "./CvsMain";
import BaseUI from "./BaseUI";
import MainCtrl from "./MainCtrl";
import { PropertyLine } from "./UI/PropertyLine";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HomeUI extends BaseUI {
    static Instance: HomeUI;
    onLoad() {
        HomeUI.Instance = this;
        this.node.active = false;
    }

    @property(cc.Label)
    lblTotalPt: cc.Label = null;
    @property(PropertyLine)
    prlHP: PropertyLine = null;
    @property(PropertyLine)
    prlAD: PropertyLine = null;
    @property(PropertyLine)
    prlFreq: PropertyLine = null;
    @property(PropertyLine)
    prlRange: PropertyLine = null;
    @property(PropertyLine)
    prlDodge: PropertyLine = null;

    start() {
        this.randomize();
    }

    randomize() {
        
    }
}