Vue.component("v-warning", {
    props: ["text"],
    template: '<div class="wrong-box"><img src="./assets/images/tips.png" alt=""><span class="wrong-text">{{text}}</span></div>'
})

const app = new Vue({
    el: "#root",
    data: {
        //type  true single  false group
        lotteryType: false,
        serverValue: "",
        clientValue: "",
        uidValue: "",
        oddsValue: 0,
        ethHashValue: "",
        participantValue: 0,
        winnerValue: 0,
        myParticipantValue: 0,
        serverSeedHash: "",
        generate: false,
        stop: 10,
        look: false,
        isShowWarning: false

    },
    created: function () {
        this.getUrlParams();
    },
    methods: {
        groupVerify: async function () {
            let {
                serverValue,
                ethHashValue,
                participantValue,
                winnerValue,
                serverSeedHash,
                myParticipantValue
            } = this;
            if (!serverValue ||
                !ethHashValue ||
                participantValue <= 0 ||
                winnerValue <= 0 ||
                myParticipantValue < 0
            ) {
                this.isShowWarning = true;
                return false
            }
            const renderGroupView = [
                {
                    title: "> ServerSeed",
                    value: serverValue.split(""),
                    id: 0
                },
                {
                    title: "> ServerSeed Hash",
                    value: serverSeedHash ? serverSeedHash.split("") : "null".split(""),
                    id: 1
                },
                {
                    title: "> ClientSeed(ETH block hash)",
                    value: ethHashValue.split(""),
                    id: 2
                },
                {
                    title: "> Number of Participants",
                    value: ("" + participantValue).split(""),
                    id: 3
                },
                {
                    title: "> Number of Winners",
                    value: ("" + winnerValue).split(""),
                    id: 4
                },
                {
                    title: "> PID",
                    value: ("" + myParticipantValue).split(""),
                    id: 5
                },
            ]


            const arr = LotteryGroup(ethHashValue, serverValue, 0, (+participantValue - 1), winnerValue);
            console.log(arr);
            let isWin = arr.includes(+myParticipantValue);
            this.renderView(renderGroupView, isWin);
            return false;

        },
        singleVerify() {
            let {
                serverValue,
                clientValue,
                uidValue,
                oddsValue,
                serverSeedHash
            } = this;
            if (!serverValue ||
                !clientValue ||
                !uidValue ||
                oddsValue <= 0 ||
                oddsValue > 100
            ) {
                this.isShowWarning = true;
                return false
            }
            const renderSingleView = [
                {
                    title: "> ServerSeed",
                    value: serverValue.split(""),
                    id: 0
                },
                {
                    title: "> ServerSeed Hash",
                    value: serverSeedHash ? serverSeedHash.split("") : "null".split(""),
                    id: 1
                },
                {
                    title: "> ClientSeed",
                    value: clientValue.split(""),
                    id: 2
                },
                {
                    title: "> PID",
                    value: uidValue.split(""),
                    id: 3
                },
                {
                    title: "> Chance of Winning",
                    value: (parseFloat(oddsValue) + "%").split(""),
                    id: 4

                },
                {
                    title: "> HMAC_SHA256(ClinetSeed:PID,ServerSeed)",
                    value: Encrypt(`${clientValue}:${uidValue}`, serverValue).split(""),
                    id: 5

                }
            ]
            const isWin = winningResult(oddsValue / 100, `${clientValue}:${uidValue}`, serverValue);
            this.renderView(renderSingleView, isWin);
            return false;
        },
        renderView: async function (data, isWin) {
            if (this.look) return;
            this.look = true
            if (this.generate === false) {
                this.generate = true;
            }
            const view = document.getElementById("view");
            view.innerHTML = "";
            const line1 = document.createElement("div");
            const line2 = document.createElement("div");
            const caculating = document.createElement("h2");
            const success = document.createElement("h2");
            const error = document.createElement("h2");
            line1.className = "line";
            line2.className = "line";
            caculating.innerText = "> Caculating...";
            success.innerHTML = ">>> CONGRATS! YOU’VE WON THE DRAW!<i>_</i> ";
            error.innerHTML = ">>> <span class='red'>OOPS! YOU LOST THE DRAW</span><i>_</i>";
            await this.generateResult(data);
            view.appendChild(line1)
            view.appendChild(caculating);
            view.appendChild(line2);
            isWin ?
                view.appendChild(success)
                :
                view.appendChild(error);
            this.look = false
        },
        generateResult: async function (all) {
            if (!all.length) return;
            const cur = all.splice(0, 1)[0];
            const view = document.getElementById("view");
            if (cur.title) {
                const h2 = document.createElement("h2");
                h2.innerText = cur.title;
                view.appendChild(h2);
            }
            if (cur.value) {
                const p = document.createElement("p");
                p.id = cur.id;
                view.appendChild(p);
                await this.stopRender(cur.id, cur.value);
                await this.generateResult(all);
            }
        },
        stopRender: async function (id, arr) {
            if (!Array.isArray(arr) && arr.length == 0) return;
            const ele = document.getElementById(id);
            let curText = "";
            const render = async () => {
                return new Promise((res, rej) => {
                    try {
                        curText += arr.splice(0, 1).join("");
                        ele.innerText = curText;
                        if (arr.length > 0) {
                            setTimeout(async () => {
                                if (arr.length === 1) {
                                    res(true)
                                }
                                res(await render())
                            }, this.$data.stop);
                        }
                        else {
                            res(true)
                        }
                    }
                    catch (err) {
                        this.look = false;
                        rej(err);
                    }
                })
            }
            return await render();
        },
        getUrlParams: function () {
            let params = {
                ss: "",
                ssh: "",
                cs: "",
                uid: "",
                wo: 0,
                ebh: "",
                pa: 0,
                wa: 0,
                ypa: 0
            };
            let search = window.location.search;
            if (!search) return params;
            const paramsArr = search.split("?")[1].split("&");
            paramsArr.map(item => {
                const [key, value] = item.split("=");
                params[key] = value;
            })

            if (params.uid != "" || params.wo != "") {
                this.lotteryType = true;
            }

            this.serverValue = params.ss;
            this.clientValue = params.cs;
            this.serverSeedHash = params.ssh;
            this.uidValue = params.uid;
            this.oddsValue = parseFloat(params.wo) ? parseFloat(params.wo) * 100 : 0;
            this.ethHashValue = params.ebh;
            this.participantValue = parseInt(params.pa) ? parseInt(params.pa) : 0;
            this.winnerValue = parseInt(params.wa) ? parseInt(params.wa) : 0;
            this.myParticipantValue = parseInt(params.ypa) ? parseInt(params.ypa) : 0;
        },
    }
})

