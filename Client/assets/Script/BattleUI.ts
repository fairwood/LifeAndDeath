import CvsMain from "./CvsMain";
import BaseUI from "./BaseUI";
import MainCtrl from "./MainCtrl";
import HomeUI from "./HomeUI";
import { Joystick } from "./Battle/Joystick";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BattleUI extends BaseUI {
    static Instance: BattleUI;
    onLoad() {
        BattleUI.Instance = this;
        this.node.active = false;

        this.btnAttack.on(cc.Node.EventType.TOUCH_START, this.onAttackDown, this);
        this.btnAttack.on(cc.Node.EventType.TOUCH_END, this.onAttackUp, this);
        this.btnAttack.on(cc.Node.EventType.TOUCH_CANCEL, this.onAttackUp, this);

        let self = this;
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, function (event) {
            console.log('key down', event.keyCode, cc.KEY.space);
            switch (event.keyCode) {
                case cc.KEY.space:
                    self.attacking = true;
                    break;
            }
        });
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, function (event) {
            switch (event.keyCode) {
                case cc.KEY.space:
                    self.attacking = false;
                    break;
            }
        });
    }

    @property(cc.Node)
    btnAttack: cc.Node = null;

    @property(Joystick)
    joystick: Joystick = null;

    @property(cc.Node)
    grpUpgrade: cc.Node = null;

    @property(cc.ProgressBar)
    prgExp: cc.ProgressBar = null;
    @property(cc.Label)
    lblExp: cc.Label = null;
    @property(cc.Label)
    lblBounty: cc.Label = null;

    @property(cc.Label)
    lblHP: cc.Label = null;
    @property(cc.Label)
    lblAD: cc.Label = null;
    @property(cc.Label)
    lblFR: cc.Label = null;
    @property(cc.Label)
    lblRG: cc.Label = null;
    @property(cc.Label)
    lblDG: cc.Label = null;

    attacking: boolean;

    onEnable() {
        this.attacking = false;
    }

    update() {
        let engine = MainCtrl.Instance.engine;
        this.grpUpgrade.active = MainCtrl.Instance.engine.pt >= 1;
        this.prgExp.progress = MainCtrl.Instance.engine.exp / 100;
        this.lblExp.string = MainCtrl.Instance.engine.exp.toFixed() + '/ 100';

        let mainCharacter = MainCtrl.Instance.engine.mainCharacter;
        this.lblHP.string = `${mainCharacter.HP.toFixed()} HP`;
        this.lblAD.string = `${mainCharacter.AD.toFixed()} AD`;
        this.lblFR.string = `${mainCharacter.FR.toPrecision(2)}/s 射速`;
        this.lblRG.string = `${mainCharacter.RG.toPrecision(2)}m 射程`;
        this.lblDG.string = `${mainCharacter.DG.toPrecision(2)}% 闪避`;

        this.lblBounty.string = engine.bounty + 'NAS';
    }

    onAttackDown() {
        this.attacking = true;
    }
    onAttackUp() {
        this.attacking = false;
    }
    onUpgradeClick(event, arg) {
        MainCtrl.Instance.engine.upgrade(arg);
    }

    onQuitClick() {
        MainCtrl.Instance.engine.clear();
        CvsMain.EnterUI(HomeUI);
    }
}
