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

    switch (input.fPort) {
      case 136:
		var latBin = bytes.slice(3,7)
		if((latBin[3] & 0x08)>0) {
		  latBin[3] = latBin[3] | 0xF0
		} else {
		  latBin[3] = latBin[3] & 0x0F
		}
		var lat = intFromBytes(latBin) / 1000000
		
		var lngBin = bytes.slice(7)
		if((lngBin[3] & 0x10)>0) {
		  lngBin[3] = lngBin[3] | 0xE0
		} else {
		  lngBin[3] = lngBin[3] & 0x1F
		}
		var lng = intFromBytes(lngBin) / 1000000
        return {
          data: {
            moving: bytes[0] & 0x01,
			gnssFix: bytes[0] & 0x08,
			gnssError: bytes[0] & 0x10,
			batteryVoltage: (25 + (bytes[1] & 0x0f)) / 10,
			temperature: (bytes[2] & 0x7f) - 32,
			latitude: lat,
			longitude: lng,
			gnssAccuracy: Math.pow(2,(bytes[10] >> 5)+2)
          }
      };
    default:
      return {
        errors: ['unknown FPort'],
      };
    }
  }
