"use strict";

var PlayerInfo = function(jsonStr) {
    if (jsonStr) {
        var obj = JSON.parse(jsonStr);
        this.address = obj.address;
        this.score = obj.score;
        this.operation = obj.operation;
        this.donation = obj.donation;
        this.comment = obj.comment;
        this.hasReward = obj.hasReward;
    } else {
        this.address = "";
        this.score = 0;
        this.operation = [];
        this.donation = new BigNumber(0);
        this.comment = "";
        this.hasReward = false;
    }
};

PlayerInfo.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var RankBoard = function(jsonStr) {
    if (jsonStr) {
        if (typeof jsonStr == 'string') {
            var obj = JSON.parse(jsonStr);
            this.list = obj.list;
            this.len = obj.len;
        } else {
            this.list = jsonStr;
            this.len = 20;
        }
    } else {
        this.list = [];
        this.len = 20;
    }
};

RankBoard.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

function decrypto(str) {
    let xor = 37234;
    let hex = 25;
    if (typeof str !== 'string' || typeof xor !== 'number' || typeof hex !== 'number') {
        return;
    }
    let strCharList = [];
    let resultList = [];
    hex = hex <= 25 ? hex : hex % 25;
    let splitStr = String.fromCharCode(hex + 97);
    strCharList = str.split(splitStr);

    for (let i = 0; i < strCharList.length; i++) {
        let charCode = parseInt(strCharList[i], hex);
        charCode = (charCode * 1) ^ xor;
        let strChar = String.fromCharCode(charCode);
        resultList.push(strChar);
    }
    let resultStr = resultList.join('');
    return resultStr;
}

var GameContract = function() {
    LocalContractStorage.defineProperty(this, "totalDonate", {
        parse: function(jsonText) {
            return new BigNumber(jsonText);
        },
        stringify: function(obj) {
            return obj.toString();
        }
    });
    LocalContractStorage.defineProperty(this, "returnNas", {
        parse: function(jsonText) {
            return new BigNumber(jsonText);
        },
        stringify: function(obj) {
            return obj.toString();
        }
    });
    LocalContractStorage.defineProperty(this, "scoreThreshold");
    LocalContractStorage.defineProperty(this, "adminAddress");

    LocalContractStorage.defineMapProperty(this, "players", {
        parse: function(jsonText) {
            return new PlayerInfo(jsonText);
        },
        stringify: function(obj) {
            return obj.toString();
        }
    });
    LocalContractStorage.defineProperty(this, "scoreRankBoard", {
        parse: function(jsonText) {
            return new RankBoard(jsonText);
        },
        stringify: function(obj) {
            return obj.toString();
        }
    });
    LocalContractStorage.defineProperty(this, "donateRankBoard", {
        parse: function(jsonText) {
            return new RankBoard(jsonText);
        },
        stringify: function(obj) {
            return obj.toString();
        }
    });
};

GameContract.prototype = {
    init: function() {
        this.totalDonate = new BigNumber(0);
        this.returnNas = new BigNumber(1e16);
        this.scoreThreshold = 1000;
        this.adminAddress = "n1TktJaRK8nkobvvBQ2QCwco25XLaP88SSJ";
        this.scoreRankBoard = new RankBoard();
        this.donateRankBoard = new RankBoard();
    },
    submit: function(score_str, comment, operation) {
        var comment_len = comment.length;
        if (comment_len > 100) {
            throw new Error("Comment is too long.");
        }

        if (typeof score_str !== 'string') {
            throw new Error("Score_str isn't string.");
        }

        var score = parseFloat(decrypto(score_str));
        if (isNaN(score)) {
            throw new Error("Score isn't float.")
        }

        var value = Blockchain.transaction.value;
        this.totalDonate = value.plus(this.totalDonate);

        var playerAddress = Blockchain.transaction.from;
        var player = this.players.get(playerAddress);
        if (player === null) {
            player = new PlayerInfo();
            player.address = playerAddress;
        }
        if (comment_len > 0) {
            player.comment = comment;
        }
        if (score > player.score) {
            player.score = score;
            player.operation = operation;
        }
        if (player.score >= this.scoreThreshold && !player.hasReward) {
            if (this.totalDonate >= this.returnNas) {
                player.hasReward = true;
                this.totalDonate = this.totalDonate.minus(this.returnNas);
                var result = Blockchain.transfer(playerAddress, this.returnNas);
                console.log("transfer result:", result);
                Event.Trigger("transfer", {
                    Transfer: {
                        from: Blockchain.transaction.to,
                        to: playerAddress,
                        value: this.returnNas
                    }
                });
            }
        }
        player.donation = value.plus(player.donation);
        var res = this.players.put(playerAddress, player);

        this.scoreRankBoard = this._update_to_rankboard(this.scoreRankBoard, player, function(a, b) {
            return b["score"] - a["score"];
        });
        this.donateRankBoard = this._update_to_rankboard(this.donateRankBoard, player, function(a, b) {
            return b["donation"] - a["donation"];
        });

        return {
            "success": true
        };
    },
    _update_to_rankboard: function(rankBoard, player, sortFun) {
        var list = rankBoard.list;
        var len = rankBoard.len;

        var inBoard = false;
        list = list.map(function(boardItem) {
            if (boardItem['address'] === player.address) {
                boardItem['score'] = player.score;
                boardItem['comment'] = player.comment;
                boardItem['donation'] = player.donation;
                inBoard = true;
                return boardItem;
            } else {
                return boardItem;
            }
        });
        if (!inBoard) {
            list.push({
                'address': player.address,
                'score': player.score,
                'comment': player.comment,
                'donation': player.donation
            });
        }
        list.sort(sortFun);
        return new RankBoard(list.slice(0, len));
    },
    get_player_info: function() {
        var playerAddress = Blockchain.transaction.from;
        return {
            "success": true,
            "result_data": this.players.get(playerAddress)
        }
    },
    get_score_rankboard: function() {
        return {
            "success": true,
            "result_data": this.scoreRankBoard.list
        };
    },
    get_donation_rankboard: function() {
        return {
            "success": true,
            "result_data": this.donateRankBoard.list
        };
    },
    get_total_donation: function() {
        return {
            "success": true,
            "result_data": this.totalDonate
        };
    },
    take_redundant_nas: function(targetAddress) {
        if (Blockchain.transaction.from != this.adminAddress) {
            throw new Error("Permission denied.");
        }
        if (Blockchain.verifyAddress(targetAddress) == 0) {
            throw new Error("Illegal Address.");
        }

        var value = this.totalDonate;
        var result = Blockchain.transfer(targetAddress, value);
        console.log("transfer result:", result);
        Event.Trigger("transfer", {
            Transfer: {
                from: Blockchain.transaction.to,
                to: targetAddress,
                value: value
            }
        });

        if (result) {
            this.totalDonate = new BigNumber(0);
        }
        return {
            "success": result
        };
    }
}

module.exports = GameContract;