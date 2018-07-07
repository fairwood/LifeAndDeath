import { DataMgr } from "./DataMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export class CharacterActor extends cc.Component {

    @property(cc.Sprite)
    hair: cc.Sprite = null;
    @property(cc.Sprite)
    face: cc.Sprite = null;
    @property(cc.Sprite)
    body: cc.Sprite = null;
    @property(cc.Sprite)
    mouth: cc.Sprite = null;
    @property(cc.Sprite)
    eyes: cc.Sprite = null;
    @property(cc.Sprite)
    horn: cc.Sprite = null;
    @property(cc.Sprite)
    wing: cc.Sprite = null;

    setAndRefresh(nonce: number, isDevil: boolean) {
        let appearance = DataMgr.getAppearance(nonce);
        try {
            let self = this;
            cc.loader.loadRes('hair/' + appearance.hair.toFixed(), cc.SpriteFrame, function (err, spriteFrame) {
                if (!err) {
                    self.hair.spriteFrame = spriteFrame;
                } else {
                    console.error('err', err);
                }
            });
        } catch (error) {
            console.error(error);
        }
        this.face.node.scaleX = appearance.faceScale;
        this.body.node.scaleX = appearance.bodyScale;
        this.mouth.enabled = isDevil;
        if (this.horn) this.horn.enabled = isDevil;
        this.eyes.node.color = isDevil ? new cc.Color(255, 60, 60) : cc.Color.BLACK;

        if (this.wing) {
            try {
                let self = this;
                cc.loader.loadRes('wing/' + appearance.wing.toFixed(), cc.SpriteFrame, function (err, spriteFrame) {
                    if (!err) {
                        self.wing.spriteFrame = spriteFrame;
                    } else {
                        console.error('err', err);
                    }
                });
            } catch (error) {
                console.error(error);
            }
        }
    }
}