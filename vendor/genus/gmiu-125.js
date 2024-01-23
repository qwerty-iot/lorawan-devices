function intFromBytes( x ){
  var val = 0;
  for (var i = x.length-1; i>=0; --i) {
    val += x[i];
    if (i > 0) {
      val = val << 8;
    }
  }
  return val;
}

function decodeUplink(input) {
  var bytes = input.bytes;

  var obj = {
    version: bytes[0],
    batteryVoltage: bytes[1]/10,
    tamper: {
      magnet: bytes[3]>>2>0,
      miu: bytes[3]>>3>0,
      lowBatt: bytes[3]>>6>0,
    },
    periodVolume: [],
    dailyVolume: 0,
  }

  var hvb = bytes.slice(4,31)
  var valIdx=0;
  var val=0;
  for(var byteIdx=0;byteIdx<27;byteIdx++) {
    var byteCur = hvb[byteIdx]
    for(var bitIdx=7;bitIdx>=0;bitIdx--) {
      var bit = 0x01 & (byteCur >> bitIdx);
      val = val | bit << (8-valIdx);
      valIdx++
      if(valIdx==9) {
        obj.periodVolume.push(val/100)
        valIdx=0
        val=0
      }
    }
  }

  var dvb = bytes.slice(31,34)
  var dv = intFromBytes(dvb)
  obj.dailyVolume = dv/100

  dvb = bytes.slice(34,38)
  dv = intFromBytes(dvb)
  obj.latchTimestamp = new Date(dv*1000)

  dvb = bytes.slice(38,42)
  dv = intFromBytes(dvb)
  obj.latchVolume = dv/100

  dvb = bytes.slice(42,46)
  dv = intFromBytes(dvb)
  obj.currentTimestamp = new Date(dv*1000)

  dvb = bytes.slice(46,50)
  dv = intFromBytes(dvb)
  obj.currentVolume = dv/100

  obj.counterCoefficient = bytes[50]
  return obj
}
