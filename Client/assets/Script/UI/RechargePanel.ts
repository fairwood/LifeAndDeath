import BlockchainMgr from "../BlockchainMgr";
import { DataMgr } from "../DataMgr";
import DialogPanel from "../DialogPanel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RechargePanel extends cc.Component {
    static Instance: RechargePanel;
    onLoad() { RechargePanel.Instance = this; this.node.active = false; }

    @property(cc.EditBox)
    edtValue: cc.EditBox = null;
    @property(cc.Label)
    lblNeedMoney: cc.Label = null;
    @property(cc.Label)
    lblReward: cc.Label = null;

    onEnable() {
        this.lblReward.string = DataMgr.totalReward.toPrecision(4) + 'NAS';
    }
    update() {
        let value = parseInt(this.edtValue.string);
        if (value) {
            if (value > DataMgr.totalReward * 10 && value > 0.1) {
                this.lblNeedMoney.node.color = cc.Color.RED;
            } else {
                this.lblNeedMoney.node.color = cc.Color.WHITE;
            }
            this.lblNeedMoney.string = value * 0.01 + 'NAS';
        }
    }
    onConfirmClick() {
        let value = parseInt(this.edtValue.string);
        if (value > DataMgr.totalReward * 10 && value > 0.1) {
            DialogPanel.PopupWith2Buttons('', '充值金额超过了宝藏总额的10倍，充值很有可能失败。\n如果失败，货币回退回您的钱包。',
                '强行充值', () => { this.recharge(value); }, '取消', null);
        }
        else {
            this.recharge(value);
        }
    }
    recharge(value: number) {
        BlockchainMgr.Instance.callFunction('recharge', null, value, null);
    }

    close() {
        this.node.active = false;
    }
}