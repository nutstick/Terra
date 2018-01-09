var context = imageRenderer.getContext('2d');

function defaultImage(url, cb) {
  var img = new Image()
  img.crossOrigin = "Anonymous"
  var time = Date.now()
  console.time(time+' download elevation ')
  img.onload = function() {
      console.log('p');
    //console.timeEnd(time+' download elevation ')
    var draw = Date.now()
    console.time(draw+' drawn elevation to canvas ')

    context.drawImage(img, 0, 0)
    var pixels = context.getImageData(0, 0, img.width, img.height)
    cb(null, ndarray(new Uint8Array(pixels.data.buffer), [img.width, img.height, 4], [4, 4*img.width, 1], 0))
    //console.timeEnd(draw+' drawn elevation to canvas ')

  }
  img.onerror = function(err) {
      console.log('prrr');
    cb(err)
  }
  img.src = url
}

//Animated gif loading
function handleGif(data, cb) {
  var reader
  try {
    reader = new GifReader(data)
  } catch(err) {
    cb(err)
    return
  }
  if(reader.numFrames() > 0) {
    var nshape = [reader.numFrames(), reader.height, reader.width, 4]
    var ndata = new Uint8Array(nshape[0] * nshape[1] * nshape[2] * nshape[3])
    var result = ndarray(ndata, nshape)
    try {
      for(var i=0; i<reader.numFrames(); ++i) {
        reader.decodeAndBlitFrameRGBA(i, ndata.subarray(
          result.index(i, 0, 0, 0),
          result.index(i+1, 0, 0, 0)))
      }
    } catch(err) {
      cb(err)
      return
    }
    cb(null, result.transpose(0,2,1))
  } else {
    var nshape = [reader.height, reader.width, 4]
    var ndata = new Uint8Array(nshape[0] * nshape[1] * nshape[2])
    var result = ndarray(ndata, nshape)
    try {
      reader.decodeAndBlitFrameRGBA(0, ndata)
    } catch(err) {
      cb(err)
      return
    }
    cb(null, result.transpose(1,0))
  }
}

function httpGif(url, cb) {
  var xhr          = new XMLHttpRequest()
  xhr.open('GET', url, true)
  xhr.responseType = 'arraybuffer'
  if(xhr.overrideMimeType){
    xhr.overrideMimeType('application/binary')
  }
  xhr.onerror = function(err) {
    cb(err)
  }
  xhr.onload = function() {
    if(xhr.readyState !== 4) {
      return
    }
    var data = new Uint8Array(xhr.response)
    handleGif(data, cb)
    return
  }
  xhr.send()
}

function copyBuffer(buffer) {
  if(buffer[0] === undefined) {
    var n = buffer.length
    var result = new Uint8Array(n)
    for(var i=0; i<n; ++i) {
      result[i] = buffer.get(i)
    }
    return result
  } else {
    return new Uint8Array(buffer)
  }
}

function dataGif(url, cb) {
  process.nextTick(function() {
    try {
      var buffer = parseDataURI(url)
      if(buffer) {
        handleGif(copyBuffer(buffer), cb)
      } else {
        cb(new Error('Error parsing data URI'))
      }
    } catch(err) {
      cb(err)
    }
  })
}

function getPixels(url, type, cb) {
  if(!cb) {
    cb = type
    type = ''
  }
  var ext = '.' + url.split('?')[0].split('.').pop()
  switch(type || ext.toUpperCase()) {
    case '.GIF':
      httpGif(url, cb)
    break
    default:
//      if(Buffer.isBuffer(url)) {
//        url = 'data:' + type + ';base64,' + url.toString('base64')
//      }
      if(url.indexOf('data:image/gif;') === 0) {
        dataGif(url, cb)
      } else {
        defaultImage(url, cb)
      }
  }
}
