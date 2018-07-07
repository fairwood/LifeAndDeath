import { CharacterActor } from "../CharacterActor";
import { DataMgr, EnemyData } from "../DataMgr";
import { BattleEngine } from "./BattleEngine";
import MainCtrl from "../MainCtrl";
import { Projectile } from "./Projectile";

const { ccclass, property } = cc._decorator;

@ccclass
export class Character extends cc.Component {

    @property(cc.ProgressBar)
    hpbar: cc.ProgressBar = null;

    @property(cc.Label)
    lblBounty: cc.Label = null;
    @property(cc.Label)
    lblLv: cc.Label = null;

    @property(CharacterActor)
    actor: CharacterActor = null;

    @property(cc.Node)
    HUD: cc.Node = null;

    @property(cc.PhysicsCollider)
    cldr: cc.PhysicsCollider = null;

    //基本属性
    data;
    isEnemy: boolean = false;

    //数值
    HPMax;
    HP;
    AD;
    FR;
    RG;
    DG;
    LV: number;
    alive: boolean = true;

    //操作
    moveDisplacement: cc.Vec2;
    attacking: boolean;
    wantAttackDirection: cc.Vec2;

    //攻击
    leftCDPercent: number;
    defaultShootDirection: cc.Vec2 = cc.Vec2.ONE.normalize();

    //事件
    takenDamage: number = 0;

    public get pos(): cc.Vec2 {
        return this.node.position.mul(BattleEngine.pxToMeter);
    }

    public set pos(v: cc.Vec2) {
        this.node.position = v.mul(BattleEngine.meterToPx);
    }

    start() {
        this.leftCDPercent = 0;
    }

    setData(data: EnemyData | any, isDevil: boolean) {
        this.data = data;
        this.HPMax = DataMgr.getHP(data.HPPt);
        this.HP = this.HPMax;
        this.AD = DataMgr.getAD(data.ADPt);
        this.FR = DataMgr.getFR(data.FRPt);
        this.RG = DataMgr.getRG(data.RGPt);
        this.DG = DataMgr.getDG(data.DGPt);
        this.isEnemy = isDevil;
        this.LV = data.HPPt + data.ADPt + data.FRPt + data.RGPt + data.DGPt - DataMgr.freePt;
        this.lblLv.string = (this.LV + 1).toFixed();
        this.lblBounty.string = data.bounty > 1e-4 ? '$' + data.bounty.toPrecision(3) : '';
        this.actor.setAndRefresh(data.nonce, isDevil);
        this.node.groupIndex = isDevil ? 2 : 1;
        this.cldr.apply();

        // this.hpbar.progress = this.HP / this.HPMax;
    }

    update(dt) {
        if (this.alive) {
            if (this.HUD) {
                this.hpbar.progress = this.HP / this.HPMax;
            }
            if (this.moveDisplacement) {

                if (this.moveDisplacement.mag() > 0) {
                    this.moveToward(this.moveDisplacement, dt);
                    this.defaultShootDirection = this.moveDisplacement.normalize();
                }
            }
            if (this.attacking) {
                if (this.leftCDPercent <= 0) {
                    //找最近目标
                    let target = this.getTarget();
                    let shootDisplacement: cc.Vec2;
                    if (target) {
                        shootDisplacement = target.pos.sub(this.pos);
                    } else {
                        shootDisplacement = this.defaultShootDirection;
                    }
                    console.log("TODO: attack!!! " + (target ? target.pos : 'null'));
                    let projNode = this.createProjectile();
                    let proj = projNode.getComponent(Projectile);
                    proj.velocity = shootDisplacement.normalize().mul(DataMgr.getProjectileSpeed(this.isEnemy));
                    proj.pos = this.pos;
                    proj.setData(this.isEnemy, this.AD, this.RG / DataMgr.getProjectileSpeed(this.isEnemy));
                    let rdg = projNode.getComponent(cc.RigidBody);
                    rdg.linearVelocity = shootDisplacement.normalize().mul(DataMgr.getProjectileSpeed(this.isEnemy) * BattleEngine.meterToPx);
                    this.leftCDPercent = 1;
                }
            }
            if (this.wantAttackDirection) {
                if (this.leftCDPercent <= 0) {
                    let projNode = this.createProjectile();
                    let proj = projNode.getComponent(Projectile);
                    proj.velocity = this.wantAttackDirection.normalize().mul(DataMgr.getProjectileSpeed(this.isEnemy));
                    proj.pos = this.pos;
                    proj.setData(this.isEnemy, this.AD, this.RG / DataMgr.getProjectileSpeed(this.isEnemy));
                    let rdg = projNode.getComponent(cc.RigidBody);
                    rdg.linearVelocity = proj.velocity.mul(BattleEngine.meterToPx)
                    this.leftCDPercent = 1;
                }
            }
            const cdDuration = 1 / this.FR;
            this.leftCDPercent -= dt / cdDuration;

            if (this.takenDamage > 0) {
                this.HP -= this.takenDamage * 1;
                if (this.HP <= 0) {
                    //死了，但不要处理
                    this.die();
                }
            }
            this.takenDamage = 0;
        }
    }

    didUpgrade() {
        let oldHPMax = this.HPMax;
        this.HPMax = DataMgr.getHP(this.data.HPPt);
        this.HP += this.HPMax - oldHPMax;
        this.AD = DataMgr.getAD(this.data.ADPt);
        this.FR = DataMgr.getFR(this.data.FRPt);
        this.RG = DataMgr.getRG(this.data.RGPt);
        this.DG = DataMgr.getDG(this.data.DGPt);
        this.LV = this.data.HPPt + this.data.ADPt + this.data.FRPt + this.data.RGPt + this.data.DGPt - DataMgr.freePt;
        this.lblLv.string = (this.LV + 1).toFixed();
    }

    moveToward(direction: cc.Vec2, dt: number) {
        this.pos = this.pos.add(direction.normalize().mul(DataMgr.MS * dt));
    }

    getTarget(): Character {
        let minDist = 1e21;
        let target: Character = null;
        const engine = MainCtrl.Instance.engine;
        let self = this;
        engine.characterContainer.children.forEach((n) => {
            let c = n.getComponent(Character)
            if (!c) return;
            if (c.isEnemy == self.isEnemy) return;
            let dist = c.pos.sub(self.pos).mag();
            if (dist > self.RG) return;
            if (!target || dist < minDist) {
                target = c;
                minDist = dist;
            }
        });
        return target;
    }

    createProjectile() {
        let node = cc.instantiate(MainCtrl.Instance.engine.projectileTemplate);
        node.parent = MainCtrl.Instance.engine.projectileContainer;
        node.active = true;
        return node;
    }

    takeDamage(damage: number) {
        this.takenDamage += damage;
    }

    die() {
        this.alive = false;
        this.node.groupIndex = 0;
        this.cldr.apply();
        this.HUD.destroy();
        this.node.setPositionY(this.node.getPositionY() - 20);
        this.node.rotation = 90;
        if (this.isEnemy) MainCtrl.Instance.engine.onEnemyDie(this.data);
        else MainCtrl.Instance.engine.onMeDie();
    }
}