import MathUtil from "./Utils/MathUtil";

export class DataMgr {

    static myData: UserData;

    static readonly freePt = 15;
    static extraPt: number = 0;

    static mainCharacter: any;
    static enemysData = {};
    static totalReward = 0;

    static resultData = {
        isWin: false,
        mainCharacterData: null,
        bounty: 0,
    };

    private static inited = false;
    static init() {
        if (this.inited) return;
        this.inited = true;

    }
    static clearData() {
        cc.sys.localStorage.removeItem('user0');
        cc.sys.localStorage.removeItem('user0Building');
    }

    static MS = 4;
    static getProjectileSpeed(isEnemy) {
        return isEnemy ? 3 : 12;
    }
    static getExtraPt(money: number) {
        return money / 0.01;
    }
    static getHP(pt: number) {
        return 30 + pt * 10;
    }
    static getAD(pt: number) {
        return 4 + pt * 1;
    }
    static getFR(pt: number) {
        return Math.round((0.7 + pt * 0.1) * 10) / 10;
    }
    static getRG(pt: number) {
        return 3 + pt * 0.5;
    }
    static getDG(pt: number) {
        return 1 - Math.pow(1 - 0.01, pt);
    }

    static getAppearance(nonce: number) {
        const hairCount = 12;
        let hair = Math.floor(this.APHash1('hair' + nonce.toFixed()) * hairCount);
        let faceScale = 1 - this.APHash1('face' + nonce.toFixed()) * 0.25;
        let bodyScale = 0.8 + this.APHash1('body' + nonce.toFixed()) * 0.25;
        const wingCount = 4;
        let wing = Math.floor(this.APHash1('wing' + nonce.toFixed()) * wingCount);
        return {
            hair: hair,
            faceScale: faceScale,
            bodyScale: bodyScale,
            wing: wing
        };
    }
    static getPosition(index: number): cc.Vec2 {

        let a = (this.APHash1(index.toFixed() + 'theta'));
        let b = (this.APHash1(index.toFixed() + 'rho'));
        let theta = a * Math.PI * 2;
        let l = (1 - b * b) * (5 + Math.pow(index, 0.5));
        let x = Math.cos(theta) * l;
        let y = Math.sin(theta) * l;
        return new cc.Vec2(x, y);
    }
    static APHash1(str: string) {
        let hash = 0xAAAAAAAA;
        for (let i = 0; i < str.length; i++) {
            if ((i & 1) == 0) {
                hash ^= ((hash << 7) ^ str.charCodeAt(i) * (hash >> 3));
            }
            else {
                hash ^= (~((hash << 11) + str.charCodeAt(i) ^ (hash >> 5)));
            }
        }
        return hash / 0xAAAAAAAA / 1.5 + 0.5;
    }

    static readExtraPt(): number {
        let extraPt = 0;
        try {
            extraPt = parseFloat(cc.sys.localStorage.getItem('extraPt'));
            if (isNaN(extraPt)) extraPt = 0;
            console.log('finish read extraPt', extraPt);
        } catch (error) {
            console.error(error);
        }
        return extraPt;
    }
    static writeExtraPt(extraPt: number) {
        try {
            cc.sys.localStorage.setItem('extraPt', extraPt.toFixed());
            console.log('finish write extraPt', extraPt);
        } catch (error) {
            console.error(error);
        }
    }
}

export class UserData {
    nickname: string;
    address: string; //区块链地址
    newRecharge: number; //Money
    rechargeTimestamp: number;
}

export class EnemyData {
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
}