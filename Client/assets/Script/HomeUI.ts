import CvsMain from "./CvsMain";
import BaseUI from "./BaseUI";
import MainCtrl from "./MainCtrl";
import { PropertyLine } from "./UI/PropertyLine";
import { DataMgr, EnemyData } from "./DataMgr";
import BattleUI from "./BattleUI";
import { CharacterActor } from "./CharacterActor";
import DialogPanel from "./DialogPanel";
import BlockchainMgr from "./BlockchainMgr";
import RechargePanel from "./UI/RechargePanel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HomeUI extends BaseUI {
    static Instance: HomeUI;
    onLoad() {
        HomeUI.Instance = this;
        this.node.active = false;

        for (let i = 0; i < 5; i++) {
            this.ptArray.push(0);
        }
    }

    @property(cc.EditBox)
    edtNickname: cc.EditBox = null;

    @property(cc.Label)
    lblTotalPt: cc.Label = null;

    @property(CharacterActor)
    characterActor: CharacterActor = null;

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

    ptArray = [];
    nonce = 0;

    start() {
        this.randomize();
    }

    private randomRange(min, max) {//[min, max)整数
        return min + Math.floor(Math.random() * (max - min));
    }
    randomize() {
        let totalPt = DataMgr.freePt + DataMgr.extraPt;
        for (let i = 0; i < 5; i++) {
            this.ptArray[i] = 0;
        }
        for (let i = 0; i < totalPt; i++) {
            let index = this.randomRange(0, 5);
            this.ptArray[index] += 1;
        }
        this.nonce = this.randomRange(0, 1e7);

        this.refresh();
    }

    update() {
        let totalPt = DataMgr.freePt + DataMgr.extraPt;
        this.lblTotalPt.string = '共 ' + totalPt + ' pt';
    }

    refresh() {
        this.prlHP.setAndRefresh(this.ptArray[0], DataMgr.getHP(this.ptArray[0]));
        this.prlAD.setAndRefresh(this.ptArray[1], DataMgr.getAD(this.ptArray[1]));
        this.prlFR.setAndRefresh(this.ptArray[2], DataMgr.getFR(this.ptArray[2]));
        this.prlRG.setAndRefresh(this.ptArray[3], DataMgr.getRG(this.ptArray[3]));
        let dodge = DataMgr.getDG(this.ptArray[4]);
        dodge = Math.round(dodge * 1e4) / 1e2;
        this.prlDG.setAndRefresh(this.ptArray[4], dodge);

        this.characterActor.setAndRefresh(this.nonce, false);
    }

    onStartBattleClick() {

        this.onCheatClick();
        // if (!this.edtNickname.string) {
        //     DialogPanel.PopupWith1Button('', '请填写昵称', 'OK', null);
        //     return;
        // }

        //extraPt没用完的部分顺延到下一局
        let usedExtraPt = 0;
        for (let i = 0; i < 5; i++) {
            usedExtraPt += this.ptArray[i];
        }
        usedExtraPt -= DataMgr.freePt;
        DataMgr.extraPt = Math.max(0, DataMgr.extraPt - usedExtraPt);

        DataMgr.writeExtraPt(DataMgr.extraPt);

        let mainCharacter = {
            HPPt: this.ptArray[0],
            ADPt: this.ptArray[1],
            FRPt: this.ptArray[2],
            RGPt: this.ptArray[3],
            DGPt: this.ptArray[4],
            nonce: this.nonce,
            nickname: this.edtNickname.string,
            address: BlockchainMgr.WalletAddress
        };
        DataMgr.mainCharacter = mainCharacter;

        MainCtrl.Instance.startBattle();
    }

    onRechargeClick() {
        RechargePanel.Instance.node.active = true;
    }

    onCheatClick() {
        console.log('CHEAT!');
        /*
        nickname: string;
        address: string; //区块链地址
        HPPt;
        ADPt;
        FRPt;
        RGPt;
        DGPt;
        nonce;//决定长相
        index;//决定位置
        bounty;
        lastWord;//遗言
        */

        DataMgr.enemysData = {};
        for (let i = 0; i < 20; i++) {
            let ch = new EnemyData();
            ch.nickname = DataMgr.APHash1('nickname' + i).toString();
            ch.address = DataMgr.APHash1('addr' + i).toString();
            ch.nonce = Math.floor(Math.random() * 1e7);
            ch.index = 2 + 2 * i;
            ch.bounty = Math.random() * 2;
            // ch.lastWord = DataMgr.APHash1('lastWord' + i).toString();
            ch.HPPt = 2 + Math.floor(Math.random() * (2+i/3));
            ch.ADPt = 3 + Math.floor(Math.random() * (2+i/3));
            ch.FRPt = 4 + Math.floor(Math.random() * (2+i/3));
            ch.RGPt = 2 + Math.floor(Math.random() * (2+i/3));
            ch.DGPt = 2 + Math.floor(Math.random() * (2+i/3));
            DataMgr.enemysData[ch.address] = ch;
        }
    }
}