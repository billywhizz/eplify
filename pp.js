function clearrect(context, left, top, width, height, color) {
	const oldFill = context.fillStyle;
	context.fillStyle = color;
	context.fillRect(left, top, width, height);
	context.fillStyle = oldFill;
}

function rect(context, x, y, width, height) {
	context.rect(x, y, width, height)
	context.stroke()
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

function drawText(context, left, top, text, fontSize, hmul = 1, vmul = 1) {
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

function drawRotatedText(context, left, top, text, fontSize, rotate, hmul = 1, vmul = 1) {
	context.save()
	context.font = `${fontSize}px monospace`
	context.translate(left - fontSize, top)
	const rotation = getRotate(rotate)
	context.rotate(rotation * Math.PI / 180)
	context.scale(hmul, vmul);
	context.fillText(text, 0, 0)
	context.restore()
}

function renderPPML(container, text) {
	const layout = JSON.parse(text)
	let { pages } = layout
	pages = pages.slice(1,100)
	const canvas = createCanvas()
	const context = canvas.getContext('2d')
	const { width, height } = layout.defaults.page.size
	canvas.setAttribute('height', height * pages.length)
	canvas.setAttribute('width', width)
	clearrect(context, 0, 0, width, height * pages.length, '#FFFFFF');
	let layoutTop = 0
	for (const page of pages) {
		const { elements } = page
		for (const element of elements) {
			const { left, top, width, height } = layout.classes.find(c => c.name === element.class)
			rect(context, left, layoutTop + top, width, height)
			drawText(context, left, layoutTop + top, element.page, 12)
		}
		layoutTop += height
	}
	container.innerHTML = ''
	container.appendChild(canvas)
}
