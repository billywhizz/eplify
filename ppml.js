(function () {
	var _fillText,
		__slice = [].slice;

	_fillText = CanvasRenderingContext2D.prototype.fillText;

	CanvasRenderingContext2D.prototype.fillText = function () {
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

let editor

function errorHandler(err) {
	console.error(err)
}

function refresh() {
	renderPPML(document.getElementById('result'), editor.getValue())
}

function save() {
	localStorage.setItem('lastPPML', editor.getValue())
	localStorage.setItem('autoRefreshEnabled', autoRefresh.checked ? 'on' : 'off')
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

const defaultPPML = ``

function onLoad() {
	let isDirty = true
	editor = ace.edit("editorEl")
	editor.setTheme("ace/theme/monokai")
	editor.getSession().setUseSoftTabs(true)
	editor.getSession().setTabSize(2)
	editor.session.setMode("ace/mode/text")
	editor.setOptions({
		fontFamily: "monospace",
		fontSize: "12pt"
	});
	editor.getSession().on('change', () => {
		isDirty = true
	})
	let last = localStorage.getItem('lastPPML')
	if (!last) last = defaultPPML
	let autoRefreshEnabled = localStorage.getItem('autoRefreshEnabled') || 'on'
	autoRefresh.checked = (autoRefreshEnabled === 'on')
	keyBindings()
	if (last) {
		editor.setValue(last)
		editor.clearSelection()
		setTimeout(() => editor.gotoLine(1), 0)
	}
	setInterval(() => {
		if ((autoRefresh.checked && isDirty)) {
			isDirty = false
			refresh()
		}
		save()
	}, 1000)
}
