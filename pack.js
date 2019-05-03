function clearrect(context, left, top, width, height, color) {
	const oldFill = context.fillStyle;
	context.fillStyle = color;
	context.fillRect(left, top, width, height);
	context.fillStyle = oldFill;
}

function rect(context, x, y, width, height) {
	context.fillRect(x, y, width, height)
}

function getFontSize(font) {
    let fontSize = 12
    switch (font) {
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
}

function getRotate(rotate) {
	let rotation = 0
	switch (rotate) {
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

function createCanvas() {
	return document.createElement('canvas')
}

function drawText(context, left, top, text, font, hmul = 1, vmul = 1) {
	const fontSize = getFontSize(font)
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
	context.setTransform(1, 0, 0, 1, 0, 0)
	context.restore();
}

function drawRotatedText(context, left, top, text, font, rotate, hmul = 1, vmul = 1) {
	const fontSize = getFontSize(font)
	context.save()
	context.font = `${fontSize}px monospace`
	context.translate(left - fontSize, top)
	const rotation = getRotate(rotate)
	context.rotate(rotation * Math.PI / 180)
	context.scale(hmul, vmul);
	context.fillText(text, 0, 0)
	context.restore()
}

function renderGraph(container, json) {
    const config = JSON.parse(json)
	const canvas = createCanvas()
	const context = canvas.getContext('2d')
	let shiftLeft = 0
	let shiftTop = 0
	let printFromBottom = false
	let labelHeight = 0
	let contentHeight = 0
	for (const line of input) {
		if (line && line.trim().length) {
			const command = line[0]
			if (command === 'R') {
				const params = line.slice(1).split(',')
				shiftLeft = parseInt(params[0], 10)
				shiftTop = parseInt(params[1], 10)
			}
			else if (command === 'Z') {
				printFrom = line[1]
				if (labelHeight > contentHeight && printFrom === 'B') {
					context.translate(0, labelHeight - contentHeight)
				}
			}
			else if (command === 'Q') {
				const params = line.slice(1).split(',')
				contentHeight = parseInt(params[0], 10)
				contentHeight = Math.ceil(contentHeight * factor)
				const gap = parseInt(params[1], 10)
				let offset
				if (params.length > 2) {
					offset = parseInt(params[2], 10)
				}
				let width = 4 * dpi
				let height = width
				width = 4 * dpi
				height = 6 * dpi
				canvas.setAttribute('height', height)
				canvas.setAttribute('width', width)
				clearrect(context, 0, 0, width, height, 'white');
				labelHeight = height
			} else if (command === 'A') {
				const params = line.slice(1).split(',')
				let left = parseInt(params[0], 10) + shiftLeft
				let top = parseInt(params[1], 10) + shiftTop
				left = Math.ceil(left * factor)
				top = Math.ceil(top * factor)
				const rotate = parseInt(params[2], 10)
				const font = params[3]
				const hmul = parseInt(params[4], 10)
				const vmul = parseInt(params[5], 10)
				const text = params[7].slice(1, params[7].length - 1).replace(/"/g, '')
				if (rotate > 0) {
					drawRotatedText(context, left, top, text, font, rotate, hmul, vmul, dpi)
				} else {
					drawText(context, left, top, text, font, hmul, vmul, dpi)
				}
			} else if (command === 'B') {
				const params = line.slice(1).split(',')
				let left = parseInt(params[0], 10) + shiftLeft
				let top = parseInt(params[1], 10)
				const rotate = parseInt(params[2], 10)
				const type = parseInt(params[3], 10)
				let nwidth = parseInt(params[4], 10)
				let wwidth = parseInt(params[5], 10)
				let height = parseInt(params[6], 10)
				left = Math.ceil(left * factor)
				top = Math.ceil(top * factor)
				height = Math.ceil(height * factor)
				nwidth = Math.ceil(nwidth * factor)
				wwidth = Math.ceil(wwidth * factor)
				const text = params[8].slice(1, params[8].length - 1).replace(/"/g, '')
				barcode(context, text, left, top, rotate, type, nwidth, wwidth, height)
			} else if (command === 'L') {
				const params = line.slice(2).split(',')
				let left = parseInt(params[0], 10) + shiftLeft
				let top = parseInt(params[1], 10) + shiftTop
				let width = parseInt(params[2], 10)
				let height = parseInt(params[3], 10)
				left = Math.ceil(left * factor)
				top = Math.ceil(top * factor)
				height = Math.ceil(height * factor)
				width = Math.ceil(width * factor)
				rect(context, left, top, width, height)
			}
		}
	}
	container.appendChild(canvas)
}
