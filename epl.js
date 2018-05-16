(function(){
  var _fillText,
    __slice = [].slice;

  _fillText = CanvasRenderingContext2D.prototype.fillText;

  CanvasRenderingContext2D.prototype.fillText = function() {
    var args, offset, previousLetter, str, x, y,
      _this = this;

    str = arguments[0], x = arguments[1], y = arguments[2], args = 4 <= arguments.length ? __slice.call(arguments, 3) : [];
    if (this.letterSpacing == null || this.letterSpacing === 0) {
      return _fillText.apply(this, arguments);
    }
    offset = 0;
		previousLetter = false;
		for (const letter of str) {
      _fillText.apply(_this, [letter, x + offset + _this.letterSpacing, y].concat(args));
      offset += _this.measureText(letter).width + _this.letterSpacing;
      previousLetter = letter;
    }
  };
})();	

function clearrect(context, left, top, width, height, color) {
	const oldFill = context.fillStyle;
	context.fillStyle = color;
	context.fillRect(left, top, width, height);
	context.fillStyle = oldFill;
}

function line(context, x1, y1, x2, y2) {
	context.beginPath();
	context.moveTo(x1 || 0, y1 || 0);
	context.lineTo(x2 || 0, y2 || 0);
	context.stroke();
	context.closePath();
}

function rect(context, x, y, width, height) {
	console.log(`rect: x: ${x}, y: ${y}, w: ${width}, h: ${height}`)
	context.fillRect(x, y, width, height)
}

function getFontSize(font, dpi) {
	if (dpi === 203) {
		let fontSize = 12
		switch(font) {
			case '2':
				fontSize = 16
				break
			case '3':
				fontSize = 20
				break
			case '4':
				fontSize = 24
				break
		}
		return fontSize
	} else {
		let fontSize = 20
		switch(font) {
			case '2':
				fontSize = 28
				break
			case '3':
				fontSize = 36
				break
			case '4':
				fontSize = 44
				break
		}
		return fontSize
	}
}

function getRotate(rotate) {
	let rotation = 0
	switch(rotate) {
		case 1:
			rotation = 90
			break
		case 2:
			rotation = 180
			break
		case 3:
			rotation = 270
			break
	}
	return rotation
}

function barcode(context, text, left, top, rotate, type, nwidth, wwidth, height) {
	const bw = new BWIPJS(bwipjs_fonts, true)
	const canvas = document.createElement('canvas')
	canvas.height = 1
	canvas.width = 1
	canvas.style.visibility = 'hidden'
	bw.scale(nwidth, 1)
	bw.bitmap(new Bitmap(canvas, 'N'))
	height = height / 2.35 / 72 * 2
	BWIPP()(bw, 'code128', text, { height })
	bw.render()
	context.drawImage(canvas, left, top, canvas.width, canvas.height)
}

function drawText(context, left, top, text, font, hmul = 1, vmul = 1, dpi = 203) {
	const fontSize = getFontSize(font, dpi)
	console.log(`text: x: ${left}, y: ${top}, text: ${text}, f: ${font}, hmul: ${hmul}, vmul: ${vmul}`)
	context.save();
	context.font = `${fontSize}px monospace`
	let bottom = top + fontSize
	context.scale(hmul, vmul);
	if (hmul > 1) {
		left = Math.floor(left / hmul)
	}
	if (vmul > 1) {
		bottom = Math.floor(bottom / vmul) + (fontSize / 2)
	}
	context.fillText(text, left, bottom)
	console.log(`text: ${text}, left: ${left}, bottom: ${bottom}`)
	context.setTransform(1, 0, 0, 1, 0, 0)
	context.restore();
}

function drawRotatedText(context, left, top, text, font, rotate, hmul = 1, vmul = 1, dpi = 203) {
	const fontSize = getFontSize(font, dpi)
	context.save()
	context.font = `${fontSize}px monospace`
	context.translate(left - fontSize, top)
	const rotation = getRotate(rotate)
	context.rotate(rotation * Math.PI / 180 )
	context.scale(hmul, vmul);
	context.fillText(text, 0, 0)
	context.restore()
}

function convertEPL(epl) {
	const output = []
	const factor = 300 / 200
	const input = epl.split('\n')
	for (const line of input) {
		if (line.length) {
			const command = line[0]
			if (command === 'Q') {
				const params = line.slice(1).split(',')
				const height = parseInt(params[0], 10)
				const offset = parseInt(params[1], 10)
				const h = Math.ceil(height * factor)
				const off = Math.ceil(offset * factor)
				output.push(`Q${h.toString().padStart('0', 3)},${off.toString().padStart('0', 3)}`)
			} else if (command === 'A') {
				const params = line.slice(1).split(',')
				const left = parseInt(params[0], 10)
				const top = parseInt(params[1], 10)
				const l = Math.ceil(left * factor)
				const t = Math.ceil(top * factor)
				output.push(`A${l.toString().padStart('0', 3)},${t.toString().padStart('0', 3)},${params.slice(2).join(',')}`)
			} else if (command === 'B') {
				const params = line.slice(1).split(',')
				const left = parseInt(params[0], 10)
				const top = parseInt(params[1], 10)
				const height = parseInt(params[6], 10)
				const l = Math.ceil(left * factor)
				const t = Math.ceil(top * factor)
				const h = Math.ceil(height * factor)
				output.push(`B${l.toString().padStart('0', 3)},${t.toString().padStart('0', 3)},${params.slice(2, 6).join(',')},${h.toString().padStart('0', 3)},${params.slice(7).join(',')}`)
			} else if (command === 'L') {
				const c2 = line[1]
				const params = line.slice(2).split(',')
				const left = parseInt(params[0], 10)
				const top = parseInt(params[1], 10)
				const width = parseInt(params[2], 10)
				const height = parseInt(params[3], 10)
				const l = Math.ceil(left * factor)
				const t = Math.ceil(top * factor)
				const w = Math.ceil(width * factor)
				const h = Math.ceil(height * factor)
				output.push(`L${c2}${l.toString().padStart('0', 3)},${t.toString().padStart('0', 3)},${w.toString().padStart('0', 3)},${h.toString().padStart('0', 3)}`)
			} else {
				output.push(line)
			}
		}
	}
	return output.join('\n')
}

function renderEPL(container, epl) {
	const dpi = parseInt(dotsPerInch.value, 10)
	if (dpi === 300) {
		epl = convertEPL(epl)
	}
	const input = epl.split('\n')
	container.innerHTML = ''
	const canvas = document.createElement('canvas')
	canvas.style.letterSpacing = '8px';
	const context = canvas.getContext('2d')
	context.letterSpacing = 1
	let shiftLeft = 0
	let shiftTop = 0
	for (const line of input) {
		if (line.length) {
			const command = line[0]
			if (command === 'R') {
				const params = line.slice(1).split(',')
				shiftLeft = parseInt(params[0], 10)
				shiftTop = parseInt(params[1], 10)
			}
			else if (command === 'Q') {
				const params = line.slice(1).split(',')
				const height = parseInt(params[0], 10)
				const gap = parseInt(params[1], 10)
				let offset
				if (params.length > 2) {
					offset = parseInt(params[2], 10)
				}
				const width = height
				canvas.setAttribute('height', height)
				canvas.setAttribute('width', width)
				clearrect(context, 0, 0, width, height, 'white');
			} else if (command === 'A') {
				const params = line.slice(1).split(',')
				const left = parseInt(params[0], 10) + shiftLeft
				const top = parseInt(params[1], 10) + shiftTop
				const rotate = parseInt(params[2], 10)
				const font = params[3]
				const hmul = parseInt(params[4], 10)
				const vmul = parseInt(params[5], 10)
				const reverse = params[6]
				const text = params[7].slice(1, params[7].length - 1).replace(/"/g, '')
				if (rotate > 0) {
					drawRotatedText(context, left, top, text, font, rotate, hmul, vmul, dpi)
				} else {
					drawText(context, left, top, text, font, hmul, vmul, dpi)
				}
			} else if (command === 'B') {
				const params = line.slice(1).split(',')
				const left = parseInt(params[0], 10) + shiftLeft
				const top = parseInt(params[1], 10)
				const rotate = parseInt(params[2], 10)
				const type = parseInt(params[3], 10)
				const nwidth = parseInt(params[4], 10)
				const wwidth = parseInt(params[5], 10)
				const height = parseInt(params[6], 10)
				const text = params[8].slice(1, params[8].length - 1).replace(/"/g, '')
				barcode(context, text, left, top, rotate, type, nwidth, wwidth, height)
			} else if (command === 'L') {
				const c2 = line[1]
				const params = line.slice(2).split(',')
				const left = parseInt(params[0], 10) + shiftLeft
				const top = parseInt(params[1], 10) + shiftTop
				const width = parseInt(params[2], 10)
				const height = parseInt(params[3], 10)
				rect(context, left, top, width, height)
			} else {

			}
		}
	}
	container.appendChild(canvas)
}
