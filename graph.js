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
	renderGraph(document.getElementById('result'), editor.getValue())
}

function save() {
	localStorage.setItem('last', editor.getValue())
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

const defaultGraph = `N
Q800,24

LO10,10,780,1
LO790,10,1,100
LO790,110,-780,1
LO10,10,1,100

LO15,15,150,2
LO165,15,2,60
LO165,75,-150,2
LO15,75,2,-60
A24,50,0,1,1,1,N,"Postgres/RDS"

LO315,15,150,2
LO465,15,2,60
LO465,75,-150,2
LO315,75,2,-60
A345,50,0,1,1,1,N,"Mongo/Atlas"

LO615,15,150,2
LO765,15,2,60
LO765,75,-150,2
LO615,75,2,-60
A624,50,0,1,1,1,N,"Postgres/RDS"

A24,85,0,1,1,1,N,"Cloud"

LO10,120,380,1
LO390,120,1,400
LO390,520,-380,1
LO10,520,1,-400

A24,500,0,1,1,1,N,"Rancher VPC"

LO400,120,380,1
LO780,120,1,400
LO780,520,-380,1
LO400,520,1,-400

A424,500,0,1,1,1,N,"K8S VPC"

LO10,530,780,1
LO790,530,1,100
LO790,630,-780,1
LO10,630,1,-100

A674,033,1,1,1,1,N,"1 Primrose Street"
P1
N`

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
	let last = localStorage.getItem('last')
	if (!last) last = defaultGraph
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
