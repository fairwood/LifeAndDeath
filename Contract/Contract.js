"use strict";

let User = function (jsonStr) {
    if (jsonStr) {
        let obj = JSON.parse(jsonStr);
        for (let key in obj) {
            this[key] = obj[key];
        }
    } else {
        let rad = Math.random() * Math.PI * 2;
        this.nickname = "";
        this.address = "";
        this.newRecharge = 0; //Money
        this.rechargeTimestamp = null;
    }
};

User.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

let Enemy = function (jsonStr) {
    if (jsonStr) {
        let obj = JSON.parse(jsonStr);
        for (let key in obj) {
            this[key] = obj[key];
        }
    } else {
        this.nickname = '';
        this.index = 0;
        this.HPPt = 0;
        this.ADPt = 0;
        this.FRPt = 0;
        this.RGPt = 0;
        this.DGPt = 0;
        this.address = "";
        this.nonce = 0;
    }
};
Enemy.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

let BigNumberDesc = {
    parse: function (jsonText) {
        return new BigNumber(jsonText);
    },
    stringify: function (obj) {
        return obj.toString();
    }
}

let GameContract = function () {
    LocalContractStorage.defineProperty(this, "adminAddress");
    LocalContractStorage.defineProperty(this, "nextEnemyIndex");
    LocalContractStorage.defineProperty(this, "totalNas", BigNumberDesc);
    LocalContractStorage.defineMapProperty(this, "allUsers", {
        parse: function (jsonText) {
            return new User(jsonText);
        },
        stringify: function (obj) {
            return obj.toString();
        }
    });
    LocalContractStorage.defineProperty(this, "allEnemyList", {
        parse: function (jsonText) {
            return JSON.parse(jsonText);
        },
        stringify: function (obj) {
            return JSON.stringify(obj);
        }
    });
    LocalContractStorage.defineMapProperty(this, "allEnemys", {
        parse: function (jsonText) {
            return new Enemy(jsonText);
        },
        stringify: function (obj) {
            return obj.toString();
        }
    });
}

GameContract.prototype = {
    init: function () {
        this.adminAddress = Blockchain.transaction.from;
        this.nextEnemyIndex = 0;
        this.totalNas = new BigNumber(0);
        this.allEnemyList = [];
        this._generateInitialEnemys();
    },
    getMapData: function () {
        let allEnemys = this.allEnemys;
        let enemys = this.allEnemyList.map(function (index) {
            return allEnemys.get(index);
        });
        let reward = Blockchain.getAccountState(Blockchain.transaction.to).balance / 1e18;
        return {
            "success": true,
            "resultData": {
                "enemys": enemys,
                "reward": reward
            }
        };
    },
    getUserList: function () {
        return this.allUserList;
    },
    getUser: function (address) {
        return this.allUsers.get(address);
    },
    recharge: function () {
        let userAddress = Blockchain.transaction.from;
        let user = this.allUsers.get(userAddress);
        if (user === null) {
            user = new User();
            user.address = userAddress;
        }
        user.newRecharge = Blockchain.transaction.value1 / 1e18;
        let curTime = (new Date()).valueOf();
        user.rechargeTimestamp = curTime;

        this.allUsers.set(userAddress, user);
        return {
            "success": true,
        };
    },
    uploadResult: function (isWin, killList, newEnemy) {
        let userAddress = Blockchain.transaction.from;

        if (isWin) {
            //transfer to winner
            let rewardWei = Blockchain.getAccountState(Blockchain.transaction.to).balance;
            this._transaction(Blockchain.transaction.from, rewardWei);

            //clear all enemys
            let allEnemyList = this.allEnemyList;
            allEnemyList.clear();
            this.allEnemyList = allEnemyList;

            //generate initial enemys
            this._generateInitialEnemys();
        } else {
            //每个killList元素，拿5%出来，记录回enemyMap里
            for (let i = 0; i < killList.length; i++) {
                let enemy = this.allEnemys.get(killList[i]);
            }
            // 给钱
            // 将newUnit变成enemy
            // 将user.newRecharge分到enemy里
        }

        //clear my recharge
        let user = this.allUsers.get(userAddress);
        if (user != null) {
            user.newRecharge = 0;
            user.rechargeTimestamp = null;
        }

        return {
            "success": true,
        };
    },
    _generateInitialEnemys: function() {
        let allEnemyList = this.allEnemyList;
        let baseIndex = -parseInt(Math.random() * 1e4);
        for (let i = 0; i < 5; i++) {
            let enemy = new Enemy();
            enemy.nickname = 'Adam ' + i;
            enemy.index = baseIndex - i;
            enemy.HPPt = 3 + i * 2 + parseInt(Math.random() * (5 + i * 2));
            enemy.ADPt = 3 + i * 2 + parseInt(Math.random() * (5 + i * 2));
            enemy.FRPt = 3 + i * 2 + parseInt(Math.random() * (5 + i * 2));
            enemy.RGPt = 3 + i * 2 + parseInt(Math.random() * (5 + i * 2));
            enemy.DGPt = 3 + i * 2 + parseInt(Math.random() * (5 + i * 2));
            enemy.nonce = parseInt(Math.random() * 1e4);
            allEnemyList.push(enemy.index);
            this.allEnemys.set(enemy.index, enemy);
        }
        this.allEnemyList = allEnemyList;
    },
    APHash1: function (str) {
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
    },
    _transaction: function (targetAddress, value) {
        var result = Blockchain.transfer(targetAddress, value);
        console.log("transfer result:", result);
        Event.Trigger("transfer", {
            Transfer: {
                from: Blockchain.transaction.to,
                to: targetAddress,
                value: value
            }
        });
    },
    //Admin
    withdrawMoney: function (targetAddress, value) {
        if (Blockchain.transaction.from != this.adminAddress) {
            throw new Error("Permission denied.");
        }
        if (Blockchain.verifyAddress(targetAddress) == 0) {
            throw new Error("Illegal Address.");
        }

        this.totalNas = this.totalNas.minus(value);
        this._transaction(targetAddress, new BigNumber(value));
        return {
            "success": true,
            "left": this.totalNas / 1e18
        };
    },
}


module.exports = GameContract;