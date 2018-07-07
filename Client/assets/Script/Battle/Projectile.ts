import { BattleEngine } from "./BattleEngine";
import { Character } from "./Character";

const { ccclass, property } = cc._decorator;

@ccclass
export class Projectile extends cc.Component {

    @property(cc.PhysicsCollider)
    cldr: cc.PhysicsCollider = null;

    velocity: cc.Vec2;

    lifespan = 1;

    AD = 0;

    public get pos(): cc.Vec2 {
        return this.node.position.mul(BattleEngine.pxToMeter);
    }

    public set pos(v: cc.Vec2) {
        this.node.position = v.mul(BattleEngine.meterToPx);
    }

    setData(isEnemy, AD, lifespan) {
        this.node.groupIndex = isEnemy ? 2 : 1;
        this.cldr.apply();
        this.AD = AD;
        this.lifespan = lifespan;
    }

    update(dt) {
        this.lifespan -= dt;
        if (this.lifespan <= 0) this.node.destroy();
    }
    onBeginContact(contact, selfCollider, otherCollider) {
        let ch = otherCollider.node.getComponent(Character);
        if (ch) {
            this.takeEffectOn(ch);
        }
        this.node.destroy();
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