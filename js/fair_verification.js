
const Encrypt = (hash, serverSeed) => {
  return CryptoJS.HmacSHA256(serverSeed, hash).toString();
}

const Calculate = (hash, lastDigits) => {
  let d = new BigNumber(hash, 16).toFixed();
  let digits = lastDigits;
  if (digits < 8) digits = 8;
  else if (digits > 16) digits = 16;
  return d.slice(-digits);
}

const LotterySingle = (clientSeedJoinUid, serverSeed, lastDigits) => {
  let hash = Encrypt(clientSeedJoinUid, serverSeed);
  return Calculate(hash, lastDigits);
}

const instantDrawWinner = (probabilityValue, clientSeedJoinUid, serverSeed, lastDigits = 8) => {
  let res = new Decimal(LotterySingle(clientSeedJoinUid, serverSeed, lastDigits));
  let lastDigitsMaxNumber = new Decimal(10).pow(lastDigits);
  const probabilityRes = lastDigitsMaxNumber.mul(probabilityValue);
  if (res.greaterThanOrEqualTo(probabilityRes)) return false;
  return true;
}

const notInstantDrawWinner = (
  ethBlockHash,
  serverSeed,
  min = 0,
  max,
  winnerNum
) => {
  const hash = Encrypt(ethBlockHash, serverSeed);
  return CalculateWinnersV2(hash, min, max, winnerNum);
}

class LCG {
  constructor(seed) {
    this.modulus = 2 << 30;
    this.multiplier = 1103515245;
    this.increment = 12345;
    this.seed = seed;
  }
  IntN = function (min, max) {
    this.seed = new BigNumber(this.multiplier, 10)
      .multipliedBy(this.seed)
      .plus(this.increment)
      .mod(this.modulus);
    return +this.seed.toNumber() % (max - min) + min;
  }
}


function CalculateWinnersV2(hash, min, max, winnerNum) {
  let res = [];
  if (max - min + 1 <= winnerNum) {
    for (let i = min; i <= max; i++) {
      res.push(i);
    }
    return res;
  }
  const sourceArr = Array.from(new Array((max)).keys())
  let d = new BigNumber(hash, 16).toFixed();
  let digit10NumberString = d.slice(0, 10);
  let di = parseInt(digit10NumberString);
  let lcg = new LCG(di);

  for (let i = 0; i < winnerNum; i++) {
    let ri = lcg.IntN(i, sourceArr.length);
    [sourceArr[i], sourceArr[ri]] = [sourceArr[ri], sourceArr[i]]
  }

  return sourceArr.slice(0, winnerNum);
}