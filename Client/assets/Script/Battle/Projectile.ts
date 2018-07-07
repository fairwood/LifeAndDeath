import { BattleEngine } from "./BattleEngine";
import { Character } from "./Character";
import MainCtrl from "../MainCtrl";

const { ccclass, property } = cc._decorator;

@ccclass
export class Projectile extends cc.Component {

    @property(cc.PhysicsCollider)
    cldr: cc.PhysicsCollider = null;

    velocity: cc.Vec2;

    lifespan = 1;

    AD = 0;

    @property(cc.Sprite)
    spr: cc.Sprite = null;
    @property(cc.SpriteFrame)
    spfMy: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    spfEnemy: cc.SpriteFrame = null;

    public get pos(): cc.Vec2 {
        return this.node.position.mul(BattleEngine.pxToMeter);
    }

    public set pos(v: cc.Vec2) {
        this.node.position = v.mul(BattleEngine.meterToPx);
    }

    setData(isEnemy, AD, lifespan) {
        this.node.groupIndex = isEnemy ? 4 : 3;
        this.cldr.apply();
        this.AD = AD;
        this.lifespan = lifespan;
        this.spr.spriteFrame = isEnemy ? this.spfEnemy : this.spfMy;
    }

    update(dt) {
        this.lifespan -= dt;
        if (this.lifespan <= 0) this.node.destroy();
    }
    onBeginContact(contact: cc.PhysicsContact, selfCollider, otherCollider) {
        let ch = otherCollider.node.getComponent(Character);
        if (ch) {
            this.takeEffectOn(ch);
        }
        this.node.destroy();
        //特效
        MainCtrl.Instance.engine.playImpactEffect(MainCtrl.Instance.engine.effectContainer.convertToNodeSpace(contact.getWorldManifold().points[0]));
    }

    takeEffectOn(target: Character) {
        //计算闪避
        if (Math.random() <= target.DG) {
            //TODO: 闪避成功
            return;
        }
        //闪避失败，造成伤害
        target.takeDamage(this.AD);
    }
}