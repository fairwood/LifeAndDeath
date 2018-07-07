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
        this.prg.progress = 0;
        this.lblPt.string = '0 pt';
        this.lblValue.string = '0 ' + this.unit;
    }

    setAndRefresh(pt: number, value: number) {
        this.prg.progress = pt / 30;
        this.lblPt.string = pt + ' pt';
        this.lblValue.string = value + ' ' + this.unit;
    }
}