import { Character } from "./Character";
import MainCtrl from "../MainCtrl";

const { ccclass, property } = cc._decorator;

@ccclass
export class EnemyAI extends cc.Component {

    start() {
        this.target = MainCtrl.Instance.engine.mainCharacter;
        this.me = this.node.getComponent(Character);
    }
    target: Character;
    me: Character;
    update() {
        this.me.wantAttackDirection = null;
        if (!this.target) return;
        if (!this.target.alive) return;
        if (this.target.pos.sub(this.me.pos).mag() <= this.me.RG + 0.5) {
            let direction = this.target.pos.sub(this.me.pos).normalize();
            let rad = Math.atan2(direction.y, direction.x);
            rad += Math.PI / 180 * 15 * (Math.random() * 2 - 1);

            this.me.wantAttackDirection = new cc.Vec2(Math.cos(rad), Math.sin(rad));
        }
    }
}