import { Character } from "./Character";
import { DataMgr } from "../DataMgr";
import MathUtil from "../Utils/MathUtil";
import BattleUI from "../BattleUI";
import ToastPanel from "../UI/ToastPanel";
import { EnemyAI } from "./EnemyAI";

const { ccclass, property } = cc._decorator;

@ccclass
export class BattleEngine extends cc.Component {

    onLoad() {
        this.characterTemplate.active = false;
        this.projectileTemplate.active = false;

        //开启物理引擎
        cc.director.getPhysicsManager().enabled = true;
    }
    @property(cc.Node)
    characterTemplate: cc.Node = null;
    @property(cc.Node)
    characterContainer: cc.Node = null;
    @property(cc.Node)
    projectileTemplate: cc.Node = null;
    @property(cc.Node)
    projectileContainer: cc.Node = null;
    @property(cc.Node)
    effectContainer: cc.Node = null;

    @property(cc.Node)
    chest: cc.Node = null;

    @property(cc.Node)
    camera: cc.Node = null;

    @property(cc.Label)
    lblLeftEnemy: cc.Label = null;
    @property(cc.Label)
    lblReward: cc.Label = null;

    mainCharacter: Character;

    exp = 0;

    pt = 0;

    leftEnemyCnt: number;

    start() {
        this.chest.active = false;
    }

    startBattle(mainCharacter) {
        this.clear();
        //TODO 创建主角
        let chNode = cc.instantiate(this.characterTemplate);
        chNode.parent = this.characterContainer;
        this.mainCharacter = chNode.getComponent(Character);
        this.mainCharacter.setData(mainCharacter, false);
        chNode.active = true;

        let mostLeftDown = 0;
        //TODO 创建敌人
        this.leftEnemyCnt = 0;
        for (let address in DataMgr.enemysData) {
            let enemyData = DataMgr.enemysData[address];
            let chNode = cc.instantiate(this.characterTemplate);
            chNode.parent = this.characterContainer;
            let enemy = chNode.getComponent(Character);
            enemy.setData(enemyData, true);
            let pos = DataMgr.getPosition(enemyData.index);
            enemy.node.position = pos.mul(this.meterToPx);
            chNode.active = true;
            chNode.addComponent(EnemyAI);

            this.leftEnemyCnt += 1;

            let leftdown = -pos.x - pos.y;
            if (leftdown > mostLeftDown) mostLeftDown = leftdown;
        }

        let x = -mostLeftDown / 2 - 6;
        this.mainCharacter.node.position = new cc.Vec2(x, x).mul(this.meterToPx);

        //TODO 创建宝箱
        this.chest.active = true;

    }

    update(dt) {
        if (this.mainCharacter) {
            // this.node.position = MathUtil.lerpVec2(this.node.position, this.mainCharacter.node.position.mul(-1), dt);
            this.camera.position = MathUtil.lerpVec2(this.camera.position, this.mainCharacter.node.position, dt);

            let moveDisplacement = BattleUI.Instance.joystick.displacement;
            this.mainCharacter.moveDisplacement = moveDisplacement;
            this.mainCharacter.attacking = BattleUI.Instance.attacking;

            this.lblLeftEnemy.string = this.leftEnemyCnt.toFixed();
        }
    }

    onEnemyDie(enemyData) {
        this.leftEnemyCnt -= 1;
        let enemyLv = enemyData.HPPt + enemyData.ADPt + enemyData.FRPt + enemyData.RGPt + enemyData.DGPt - DataMgr.freePt;
        let gainExp = Math.round(enemyLv * 100 * (0.05 + 0.1 * Math.random()));
        this.exp += gainExp;
        let newPt = Math.floor(this.exp / 100);
        this.exp -= newPt * 100;
        this.pt += newPt;
        ToastPanel.Toast(`+ ${gainExp.toFixed()} EXP`);
    }
    onMeDie() {
        console.log('onMeDie【】【】【】');
    }

    upgrade(prop) {
        if (this.pt < 1) return;
        this.pt -= 1;
        this.mainCharacter.data[prop + 'Pt'] += 1;
        let func = DataMgr['get' + prop];
        let valueStr = (Math.round((func(1) - func(0)) * 1e3) / 1e3).toString();
        switch (prop) {
            case 'HP':
                ToastPanel.Toast(`+ ${valueStr} HP`);
                break;
            case 'AD':
                ToastPanel.Toast(`+ ${valueStr} AD`);
                break;
            case 'FR':
                ToastPanel.Toast(`+ ${valueStr} /s 射速`);
                break;
            case 'RG':
                ToastPanel.Toast(`+ ${valueStr} m 射程`);
                break;
            case 'DG':
                ToastPanel.Toast(`+ ${valueStr} % 闪避`);
                break;
        }
        this.mainCharacter.didUpgrade();
    }

    clear() {
        this.characterContainer.destroyAllChildren();
        this.projectileContainer.destroyAllChildren();
        this.effectContainer.destroyAllChildren();
        this.mainCharacter = null;
        this.chest.active = false;
    }

    readonly pxToMeter = 1 / 60;
    readonly meterToPx = 60;
    static readonly pxToMeter = 1 / 60;
    static readonly meterToPx = 60;

}