import CvsMain from "./CvsMain";
import BaseUI from "./BaseUI";
import MainCtrl from "./MainCtrl";
import { DataMgr } from "./DataMgr";
import HomeUI from "./HomeUI";
import { PropertyLine } from "./UI/PropertyLine";
import { CharacterActor } from "./CharacterActor";
import BlockchainMgr from "./BlockchainMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ResultUI extends BaseUI {
    static Instance: ResultUI;
    onLoad() {
        ResultUI.Instance = this;
        this.node.active = false;

    }

    @property(cc.Node)
    grpWin: cc.Node = null;
    @property(cc.Node)
    grpLose: cc.Node = null;

    @property(cc.Label)
    lblNicknameWin: cc.Label = null;
    @property(cc.Label)
    lblReward: cc.Label = null;
    @property(cc.Label)
    lblNicknameLose: cc.Label = null;
    @property(cc.Label)
    lblBounty: cc.Label = null;

    @property(CharacterActor)
    characterActor: CharacterActor = null;
    @property(CharacterActor)
    demonActor: CharacterActor = null;

    @property(PropertyLine)
    prlHP: PropertyLine = null;
    @property(PropertyLine)
    prlAD: PropertyLine = null;
    @property(PropertyLine)
    prlFR: PropertyLine = null;
    @property(PropertyLine)
    prlRG: PropertyLine = null;
    @property(PropertyLine)
    prlDG: PropertyLine = null;

    onEnable() {
        const resultData = DataMgr.resultData;
        if (resultData.isWin) {
            this.grpWin.active = true;
            this.grpLose.active = false;
            this.lblNicknameWin.string = resultData.mainCharacterData.nickname;
            this.lblReward.string = DataMgr.totalReward.toPrecision(4)+' NAS';
        } else {
            this.grpWin.active = false;
            this.grpLose.active = true;
            this.lblNicknameLose.string = resultData.mainCharacterData.nickname;
            this.lblBounty.string = resultData.bounty.toPrecision(3) + 'NAS';

            this.prlHP.setAndRefresh(resultData.mainCharacterData.HPPt, DataMgr.getHP(resultData.mainCharacterData.HPPt));
            this.prlAD.setAndRefresh(resultData.mainCharacterData.ADPt, DataMgr.getAD(resultData.mainCharacterData.ADPt));
            this.prlFR.setAndRefresh(resultData.mainCharacterData.FRPt, DataMgr.getFR(resultData.mainCharacterData.FRPt));
            this.prlRG.setAndRefresh(resultData.mainCharacterData.RGPt, DataMgr.getRG(resultData.mainCharacterData.RGPt));
            let dodge = DataMgr.getDG(resultData.mainCharacterData.DGPt);
            dodge = Math.round(dodge * 1e4) / 1e2;
            this.prlDG.setAndRefresh(resultData.mainCharacterData.DGPt, dodge);

            this.characterActor.setAndRefresh(resultData.mainCharacterData.nonce, false);
            this.demonActor.setAndRefresh(resultData.mainCharacterData.nonce, true);
        }
    }

    onUploadClick() {
        BlockchainMgr.Instance.callFunction('uploadResult', null, 0, null);
    }
    onBackClick() {
        CvsMain.EnterUI(HomeUI);
    }
}
