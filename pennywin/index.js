Vue.component("v-warning", {
  props: ["text"],
  template:
    '<div class="wrong-box"><img src="../assets/images/tips.png" alt=""><span class="wrong-text">{{text}}</span></div>',
});
function isTimestamp(v) {
  var a = new Date(v);
  return !isNaN(a) && v < Date.now();
}
const app = new Vue({
  el: "#root",
  data: {
    //type  true single  false group

    timestamps: [],
    playerCount: "",
    blockHash: "",
    fixedNumber: "",

    timestampsError: "",

    playerCountError: "",

    blockHashError: "",

    fixedNumberError: "",

    generate: false,
    lock: false,
  },
  created: function () {
    this.getUrlParams();
  },
  methods: {
    groupVerify: async function () {
      var { timestamps, playerCount, blockHash } = this;
      timestamps = timestamps.map((v) => Number(v.trim()));
      playerCount = Number(playerCount);

      if (timestamps.length != 10) {
        this.timestampsError = "Requires 10 timestamps";
        return;
      }

      for (var timestamp of timestamps) {
        if (!isTimestamp(timestamp)) {
          this.timestampsError = timestamp + " is not a valid timestamp";
          return;
        }
      }

      this.timestampsError = "";
      if (
        isNaN(playerCount) ||
        playerCount <= 0 ||
        parseInt(playerCount) != playerCount
      ) {
        this.playerCountError =
          "The number of participants must be a positive integer";
        return;
      }
      this.playerCountError = "";

      var blockHash10;
      try {
        blockHash10 = BigInt(blockHash).toString();
      } catch (err) {
        this.blockHashError = "Invalid input";
        return;
      }
      if (blockHash10 <= 14) {
        this.blockHashError = "Invalid input";
        return;
      }
      this.blockHashError = "";

      if (this.fixedNumber.trim() == "") {
        this.fixedNumberError = "Invalid input";
        return;
      }
      var fixedNumber = Number(this.fixedNumber);
      if (isNaN(fixedNumber)) {
        this.fixedNumberError = "Invalid input";
        return;
      }
      this.fixedNumberError = "";
      this.renderView();
    },
    renderView: async function () {
      if (this.lock) return;
      this.lock = true;
      if (this.generate === false) {
        this.generate = true;
      }
      const view = document.getElementById("view");
      view.innerHTML = "";
      let id = 0;
      generateInput(view, "> Timestamps");
      await this.generateValue(view, id++, this.timestamps.join(",\n"));
      generateLine(view);

      const sumTimeStamp = this.timestamps.reduce(
        (row, i) => row + Number(i),
        0
      );
      await this.generateValue(
        view,
        id++,
        "Sum of timestamp is: " + sumTimeStamp
      );

      generateInput(view, "> Block Hash");
      await this.generateValue(view, id++, this.blockHash);
      generateLine(view);
      var blockHash10 = BigInt(this.blockHash).toString();
      var last14hash = blockHash10.slice(-14);
      await this.generateValue(
        view,
        id++,
        `The decimal format of block hash is :\n${blockHash10}\n the last 14 digist number is :${last14hash}`
      );

      generateInput(view, "> Number of Participants");
      await this.generateValue(view, id++, this.playerCount);
      generateLine(view);

      generateInput(
        view,
        `> Caculating random value: (${sumTimeStamp} + ${last14hash}) % ${this.playerCount}`
      );

      var randomNum =
        (sumTimeStamp + Number(last14hash)) % Number(this.playerCount);
      await this.generateValue(view, id++, randomNum);
      generateLine(view);
      var fixedNumber = Number(this.fixedNumber);
      generateInput(
        view,
        `> Caculating winner number: ${fixedNumber} + ${randomNum}`
      );
      await this.generateValue(view, id++, fixedNumber + randomNum);
      this.lock = false;
    },
    async generateValue(view, id, value) {
      const p = document.createElement("p");
      p.id = id;
      view.appendChild(p);
      await this.stopRender(id, (value + "").split(""));
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
                  res(true);
                }
                res(await render());
              }, this.$data.stop);
            } else {
              res(true);
            }
          } catch (err) {
            this.look = false;
            rej(err);
          }
        });
      };
      return await render();
    },
    getUrlParams: function () {
      var u = new URL(window.location);
      this.timestamps = u.searchParams.getAll("timestamp") || [];
      this.blockHash = u.searchParams.get("blockHash") || "";
      this.playerCount = u.searchParams.get("playerCount") || "";
      this.fixedNumber = u.searchParams.get("fixedNumber") || "";
    },
  },
});

function generateInput(view, input) {
  const h2 = document.createElement("h2");
  h2.innerText = input;
  view.appendChild(h2);
}

function generateLine(view) {
  var line = document.createElement("div");
  line.className = "line";
  view.appendChild(line);
}
