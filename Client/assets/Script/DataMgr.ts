import MathUtil from "./Utils/MathUtil";

export class DataMgr {

    static myData: UserData;

    static readonly freePt = 6;
    static extraPt: number = 0;

    static enemysData = {};

    private static inited = false;
    static init() {
        if (this.inited) return;
        this.inited = true;

    }

    static getExtraPt(money: number) {
        return money / 0.01;
    }
    static getHP(pt: number) {
        return 40 + pt * 10;
    }
    static getAD(pt: number) {
        return 5 + pt * 1;
    }
    static getFR(pt: number) {
        return 0.5 + pt * 0.1;
    }
    static getRG(pt: number) {
        return 5 + pt * 1;
    }
    static getDG(pt: number) {
        return 1 - Math.pow(1 - 0.01, pt);
    }
}

export class UserData {
    nickname: string;
    address: string; //区块链地址
}