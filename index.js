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
	const dpi = parseInt(dotsPerInch.value, 10)
	renderEPL(document.getElementById('result'), editor.getValue(), dpi, labelStock.value)
}

function save() {
	localStorage.setItem('last', editor.getValue())
	localStorage.setItem('autoRefreshEnabled', autoRefresh.checked ? 'on' : 'off')
	localStorage.setItem('dotsPerInch', dotsPerInch.value)
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

const defaultLabel = `N
Q822,24
R40,0
S4
D15
ZB

A760,120,1,1,1,1,N,"DPD"
A735,080,1,1,1,1,N,"www.dpd.co.uk"
A706,033,1,1,1,1,N,"Sender"
A690,033,1,1,1,1,N,"ONEFLOW SYSTEMS"
A674,033,1,1,1,1,N,"1 Primrose Street"
A658,033,1,1,1,1,N,""
A642,033,1,1,1,1,N,"LONDON"
A626,033,1,1,1,1,N,""
A610,033,1,1,1,1,N,"EC2A 2EX"
A606,124,1,1,1,1,N,"Phone:0000000000"
A706,158,1,1,1,1,N,"Account:111111"
A588,033,1,1,1,1,N,"Delivery Address"
A003,035,0,4,1,1,N,"DONAUWÖRTH PRINTERS"
A003,060,0,4,1,1,N,"AM STILLFLECKEN 999"
A003,085,0,4,1,1,N,""
A003,110,0,4,1,1,N,"DONAUWÖRTH"
A003,135,0,4,1,1,N,""
A003,160,0,4,1,1,N,"86609"
A183,160,0,4,1,1,N,"Germany"
A480,150,0,4,2,2,N,""
A003,198,0,1,1,1,N,"Contact"
A003,213,0,1,1,1,N,"Phone"
A003,265,0,1,1,1,N,"Consignment"
A003,283,0,1,1,1,N,"Ref"
A003,228,0,1,1,1,N,"Info"
A120,198,0,1,1,1,N,"DONAUWÖRTH PRINTERS"
A120,213,0,1,1,1,N,"0000000000"
A120,228,0,1,1,1,N,""
A120,243,0,1,1,1,N,""
A120,265,0,1,1,1,N,"5992781000"
A120,283,0,1,1,1,N,"SHIPPING-TEST-2018-04-13"
A120,298,0,1,1,1,N,"6AE9F5E7F2E9E16E"
A120,313,0,1,1,1,N,""
A463,195,0,1,1,1,N,"Packages"
A453,245,0,1,1,1,N,"Total Weight"
A463,210,0,4,1,1,N,"1 of 2"
A463,260,0,4,1,1,N,"1.5 kg"
A003,397,0,1,1,1,N,"Track"
A695,390,0,1,1,1,N,"Service"
A003,350,0,4,1,2,N,"1550"
A103,350,0,4,1,1,N,"5992 7810 00N"
A160,525,0,1,1,1,N,"     15/05/18 12:10 Web 1.24.33-api     "
B010,550,0,1,3,6,200,N,"%008660915505992781000325276"
A140,780,0,3,1,1,N,"0086 6091 5505 9927 8100 0325 2763"
A479,342,0,4,1,2,N,"         IE2 VALUE"
A190,490,0,4,1,1,N,"    325-DE - 86609    "
A010,420,0,2,2,2,N,""
A008,475,0,4,2,3,N,"21"
A645,475,0,4,2,3,N,""
A100,390,0,4,3,4,N,"DE-0918-ARE"
LO001,330,765,10
LO001,025,765,1
LO001,192,590,1
LO001,330,765,10
LO765,001,1,330
LO001,001,1,330
LO715,025,1,306
LO592,025,1,306
LO001,001,765,1
LO430,192,1,138
P1
N`

function onLoad() {
	let isDirty = true
	dotsPerInch.value = localStorage.getItem('dotsPerInch') || '203'
	let dpi = dotsPerInch.value
	let stock = labelStock.value
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
	if (!last) last = defaultLabel
	let autoRefreshEnabled = localStorage.getItem('autoRefreshEnabled') || 'on'
	autoRefresh.checked = (autoRefreshEnabled === 'on')
	keyBindings()
	if (last) {
		editor.setValue(last)
		editor.clearSelection()
		setTimeout(() => editor.gotoLine(1), 0)
	}
	setInterval(() => {
		if ((autoRefresh.checked && isDirty) || (dotsPerInch.value !== dpi) || (labelStock.value !== stock)) {
			dpi = dotsPerInch.value
			stock = labelStock.value
			isDirty = false
			refresh()
		}
		save()
	}, 1000)
}
