let editor

function mmToDots(mm) {
	return Math.floor(mm * (72 / 25.4));
}

function inchesToDots(inches) {
	return Math.floor(inches * 72);
}

function errorHandler(err) {
	console.error(err)
}

function refresh() {
	renderEPL(document.getElementById('result'), editor.getValue())
}

function save() {
	localStorage.setItem('last', editor.getValue())
}

function keyBindings() {
	let isCtrl = false;
	document.onkeyup = e => {
		if (e.keyCode === 17) isCtrl = false;
	}
	document.onkeydown = e => {
		if (e.keyCode === 17) isCtrl = true;
		if (e.keyCode === 83 && isCtrl) {
			save();
			return false;
		} else if (e.keyCode === 82 && isCtrl) {
			refresh();
			return false;
		}
	}
}

function onLoad() {
	editor = ace.edit("editorEl")
	editor.setTheme("ace/theme/monokai")
	editor.getSession().setUseSoftTabs(true)
	editor.getSession().setTabSize(2)
	editor.session.setMode("ace/mode/text")
	editor.setOptions({ fontSize: '12pt' })
	const last = localStorage.getItem('last')
	keyBindings()
	if (last) {
		editor.setValue(last)
		editor.clearSelection()
		setTimeout(() => editor.gotoLine(1), 0)
	}
}
