

/**CryptoJS key */
function Encrypt(key, plaintext) {
  let mac = CryptoJS.HmacSHA256(plaintext, key).toString();
  return mac;
}

function Calculate(hash, lastDigits) {
  let d = new BigNumber(hash, 16).toFixed();
  let digits = 8;
  if (lastDigits) {
    digits = lastDigits;
  }
  if (digits < 8) {
    digits = 8;
  }
  if (digits > 16) {
    digits = 16;
  }
  d = d.toString();
  let lastDigitNumberString = d.slice(-digits);
  lastDigitNumberString = lastDigitNumberString;
  return lastDigitNumberString;
}

function LotterySingle(key, plaintext, lastDigits) {
  let hash = Encrypt(key, plaintext);
  return Calculate(hash, lastDigits);
}
/**
 * single Determine whether to win the lottery
 * @param {*} p winning odds example:0.2
 * @param {*} key  client seed:uid
 * @param {*} plaintext  server seed
 * @param {*} lastDigits  
 * @returns 
 */
function winningResult(p, key, plaintext, lastDigits = 8) {
  let res = new Decimal(LotterySingle(key, plaintext));
  let lastDigitsMaxNumber = new Decimal(10).pow(lastDigits);
  const probabilityRes = lastDigitsMaxNumber.mul(p);
  if (res.greaterThanOrEqualTo(probabilityRes)) {
    return false;
  }
  return true;
}
/**
 * group
 * @param {*} key eth hash
 * @param {*} plaintext server seed 
 * @param {*} min 
 * @param {*} max participant number
 * @param {*} num winner number
 * @returns 
 */
function LotteryGroup(
  key,
  plaintext,
  min = 0,
  max,
  num
) {
  console.log(key,
    plaintext,
    min = 0,
    max,
    num);
  const hash = Encrypt(key, plaintext);
  return CalculateWinnersV2(hash, min, max, num);
}

// function CalculateWinners(hash, min, max, num) {
//   let res = [];
//   if (max < num) {
//     for (let i = 0; i <= max; i++) {
//       res.push(i);
//     }
//     return res;
//   }
//   let s = new Set();
//   let key = hash;
//   while (res.length < num) {
//     key = CryptoJS.SHA256(key).toString();
//     let d = new BigNumber(key, 16);
//     d = d.mod(max - min + 1);
//     let r = d.toNumber() + min;
//     if (!s.has(r)) {
//       s.add(r);
//       res.push(r);
//     }
//   }
//   return res;
// }

function IntN(min, max) {
  this.seed = new BigNumber(this.a, 10).multipliedBy(this.seed).plus(this.c).mod(this.modulus)

  return +this.seed.toNumber() % (max - min) + min;
}

function LCG(seed) {
  this.modulus = 2 << 30;
  this.a = 1103515245;
  this.c = 12345;
  this.seed = seed;
}

LCG.prototype = {
  constructor: LCG,
  IntN: IntN
}


function CalculateWinnersV2(hash, min, max, num) {
  let res = [];
  if (max + 1 < num) {
    for (let i = min; i < max; i++) {
      res.push(i);
    }
    return res;
  }
  const source = Array.from(new Array((max + 1)).keys())
  let d = new BigNumber(hash, 16).toFixed();
  let digit10NumberString = d.slice(0, 10);
  let di = parseInt(digit10NumberString)
  // console.log(di === 3090708040)
  let lcg = new LCG(di)
  for (let i = 0; i < num; i++) {

    let ri = lcg.IntN(i, source.length);
    // console.log(ri);
    [source[i], source[ri]] = [source[ri], source[i]]
  }

  res = source.slice(0, num);
  return res;
}