const { ccclass, property } = cc._decorator;

@ccclass
export class PropertyLine extends cc.Component {

    @property(cc.ProgressBar)
    prg: cc.ProgressBar = null;
    @property(cc.Label)
    lblPropertyName: cc.Label = null;
    @property(cc.Label)
    lblPt: cc.Label = null;
    @property(cc.Label)
    lblValue: cc.Label = null;
    @property(cc.String)
    propertyName: string = '';
    @property(cc.String)
    unit: string = '';

    start() {
        this.lblPropertyName.string = this.propertyName;
    }

    setAndRefresh(pt: number, value: number) {
        this.prg.progress = pt / 20;
        this.lblPt.string = pt + ' pt';
        this.lblValue.string = value + ' ' + this.unit;
    }
}