import CvsMain from "./CvsMain";
import HomeUI from "./HomeUI";
import { DataMgr, UserData } from "./DataMgr";
import ToastPanel from "./UI/ToastPanel";
import IntroUI from "./UI/IntroUI";
import { BattleEngine } from "./Battle/BattleEngine";
import BattleUI from "./BattleUI";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MainCtrl extends cc.Component {
    static Instance: MainCtrl;
    onLoad() {
        MainCtrl.Instance = this;
        //加载数据
        DataMgr.init();

        //读取缓存
        DataMgr.extraPt = DataMgr.readExtraPt();
    }

    static Ticks = 0;

    bgmHandler: number;
    start() {
        CvsMain.EnterUI(IntroUI);

        // let as = this.node.getComponent(cc.AudioSource);
        setTimeout(() => {
            // as.play();
            let url = cc.url.raw('resources/audio/bgm.mp3');
            this.bgmHandler = cc.audioEngine.play(url, true, 0.5);
        }, 1000);
    }


    update(dt: number) {
        MainCtrl.Ticks++;
    }

    @property(BattleEngine)
    engine: BattleEngine = null;

    startBattle() {
        CvsMain.EnterUI(BattleUI);
        this.engine.startBattle(DataMgr.mainCharacter);
    }

    onGetMyData(resp) {
        console.log('onGetMyData', resp);
        let user: UserData = JSON.parse(resp.result);
        if (user) {
            DataMgr.myData = user;
            let cachedData: UserData = null;
            try {
                cachedData = JSON.parse(cc.sys.localStorage.getItem('user0'));
                console.log('finish read data', cachedData);
            } catch (error) {
                console.error(error);
            }
            if (cachedData) {
                //已有缓存
                if (cachedData.rechargeTimestamp < user.rechargeTimestamp) {
                    //有新充值
                    DataMgr.extraPt += DataMgr.getExtraPt(user.newRecharge);
                    DataMgr.writeExtraPt(DataMgr.extraPt);
                    cachedData.rechargeTimestamp = user.rechargeTimestamp;

                    try {
                        cc.sys.localStorage.setItem('user0', JSON.stringify(cachedData));
                        console.log('finish write data', cachedData);
                    } catch (error) {
                        console.error(error);
                    }
                }
            } else {
                //新客户端
                cachedData = user;
                try {
                    cc.sys.localStorage.setItem('user0', JSON.stringify(cachedData));
                    console.log('finish write data', cachedData);
                } catch (error) {
                    console.error(error);
                }
            }
        }
    }
}
