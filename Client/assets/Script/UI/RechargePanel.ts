import BlockchainMgr from "../BlockchainMgr";
import Island from "../World/Island";
import CurrencyFormatter from "../Utils/CurrencyFormatter";
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
            if (value > DataMgr.totalReward) {
                this.lblNeedMoney.node.color = cc.Color.RED;
            } else {
                this.lblNeedMoney.node.color = cc.Color.WHITE;
            }
            this.lblNeedMoney.string = value * 0.01 + 'NAS';
        }
    }
    onConfirmClick() {
        let value = parseInt(this.edtValue.string);
        if (value > DataMgr.totalReward) {
            DialogPanel.PopupWith2Buttons('', '充值金额超过了宝藏总额，充值很有可能失败。\n如果失败，货币回退回您的钱包。',
                '强行充值', this.recharge, '取消', null);
        }
        else {
            this.recharge();
        }
    }
    recharge() {

    }

    close() {
        this.node.active = false;
    }
}