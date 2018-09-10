(function () {
    window.H5lock = function (obj) {
        this.height = obj.height;
        this.width = obj.width;
        this.chooseType = Number(window.localStorage.getItem('chooseType')) || obj.chooseType;
        this.devicePixelRatio = window.devicePixelRatio || 1;
    };

    H5lock.prototype.drawCle = function (x, y) { // 初始化解锁密码面板 小圆圈
        // this.ctx.strokeStyle = '#fff'; //密码的点点默认的颜色
        this.ctx.fillStyle = '#fff'
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.r, 0, Math.PI * 2, true);
        this.ctx.closePath();
        this.ctx.fill();
    }
    H5lock.prototype.drawPoint = function (style) { // 初始化圆心
        for (var i = 0; i < this.lastPoint.length; i++) {
            this.ctx.fillStyle = style;
            this.ctx.beginPath();
            this.ctx.arc(this.lastPoint[i].x, this.lastPoint[i].y, this.r / 2.5, 0, Math.PI * 2, true);
            this.ctx.closePath();
            this.ctx.fill();
        }
    }
    H5lock.prototype.drawStatusPoint = function (type) { // 初始化状态线条
        for (var i = 0; i < this.lastPoint.length; i++) {
            this.ctx.strokeStyle = type;
            this.ctx.beginPath();
            this.ctx.arc(this.lastPoint[i].x, this.lastPoint[i].y, this.r, 0, Math.PI * 2, true);
            this.ctx.closePath();
            this.ctx.stroke();
        }
    }
    H5lock.prototype.drawLine = function (style, po, lastPoint) { //style:颜色 解锁轨迹
        this.ctx.beginPath();
        this.ctx.strokeStyle = style;
        this.ctx.lineWidth = 3;
        this.ctx.moveTo(this.lastPoint[0].x, this.lastPoint[0].y);

        for (var i = 1; i < this.lastPoint.length; i++) {
            this.ctx.lineTo(this.lastPoint[i].x, this.lastPoint[i].y);
        }
        this.ctx.lineTo(po.x, po.y);
        this.ctx.stroke();
        this.ctx.closePath();

    }
    H5lock.prototype.createCircle = function () { // 创建解锁点的坐标，根据canvas的大小来平均分配半径

        // var n = this.chooseType;
        var n = 6;
        var count = 0;
        var obj;
        this.r = this.ctx.canvas.width / (2 + 4 * n); // 公式计算
        console.log(this.checkPass(this.pswObj2.spassword, this.lastPoint))
        console.log(this.lastPoint)
        this.lastPoint = [];
        this.restPoint = [];
        this.arr = [];
        var r = this.r;
        for (var i = 0; i < n; i++) {
            for (var j = 0; j < n / 2; j++) {
                count++;
                var obj = {
                    x: i * 4 * r + 3 * r,
                    y: j * 6 * r + 5 * r,
                    index: count
                };
                this.arr.push(obj);
                this.restPoint.push(obj);
            }
        }
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        for (var i = 0; i < this.arr.length; i++) {
            this.drawCle(this.arr[i].x, this.arr[i].y);
        }
    }
    H5lock.prototype.getPosition = function (e) { // 获取touch点相对于canvas的坐标
        var rect = e.currentTarget.getBoundingClientRect();
        var po = {
            x: (e.touches[0].clientX - rect.left) * this.devicePixelRatio,
            y: (e.touches[0].clientY - rect.top) * this.devicePixelRatio
        };
        return po;
    }
    H5lock.prototype.update = function (po) { // 核心变换方法在touchmove时候调用
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        for (var i = 0; i < this.arr.length; i++) { // 每帧先把面板画出来
            this.drawCle(this.arr[i].x, this.arr[i].y);
        }

        this.drawPoint('#fff'); // 每帧花轨迹
        this.drawStatusPoint('#27AED5'); // 每帧花轨迹

        this.drawLine('#27AED5', po, this.lastPoint); // 每帧画圆心

        for (var i = 0; i < this.restPoint.length; i++) {
            if (Math.abs(po.x - this.restPoint[i].x) < this.r && Math.abs(po.y - this.restPoint[i].y) < this.r) {
                this.drawPoint(this.restPoint[i].x, this.restPoint[i].y);
                this.lastPoint.push(this.restPoint[i]);
                this.restPoint.splice(i, 1);
                break;
            }
        }

    }
    H5lock.prototype.checkPass = function (psw1, psw2) { // 检测密码
        var p1 = '',
            p2 = '';
        for (var i = 0; i < psw1.length; i++) {
            p1 += psw1[i].index + psw1[i].index;
        }
        for (var i = 0; i < psw2.length; i++) {
            p2 += psw2[i].index + psw2[i].index;
        }
        return p1 === p2;
    }
    H5lock.prototype.storePass = function (psw) { // touchend结束之后对密码和状态的处理

        if (this.pswObj.step == 1) {
            if (this.checkPass(this.pswObj.fpassword, psw)) {
                this.pswObj.step = 2;
                this.pswObj.spassword = psw;
                this.drawStatusPoint('#2CFF26');
                this.drawPoint('#2CFF26');
                // window.localStorage.setItem('passwordxx', JSON.stringify(this.pswObj.spassword));
                // window.localStorage.setItem('chooseType', this.chooseType);
            } else {
                this.drawStatusPoint('red');
                this.drawPoint('red');
                delete this.pswObj.step;
            }
        } else if (this.pswObj.step == 2) {
            if (this.checkPass(this.pswObj.spassword, psw) || this.checkPass(this.pswObj2.spassword, psw)) {
                this.drawStatusPoint('#ff8c0b'); //小点点外圈高亮
                this.drawPoint('#ff8c0b');
                this.drawLine('#ff8c0b', this.lastPoint[this.lastPoint.length - 1], this.lastPoint); // 每帧画圆心
                if (this.checkPass(this.pswObj.spassword, psw)) {
                    var hand1 = document.getElementById('hand1');
                    var hand2 = document.getElementById('hand2');
                    var line1 = document.getElementById('line1');
                    hand1.style.display = 'none'
                    hand2.style.display = 'block'
                    line1.className += " " + 'active'
                }
                if (this.checkPass(this.pswObj2.spassword, psw)) {
                    var video = document.getElementById('video');
                    var hand2 = document.getElementById('hand2');
                    var page1 = document.getElementById('page1');
                    var line2 = document.getElementById('line2');
                    line2.className += " " + 'active'
                    hand2.style.display = 'none'
                    setTimeout(function name() {
                        page1.className += " " + 'hide'
                    }, 2000);
                }

            } else if (psw.length < 4) {

                this.drawStatusPoint('red');
                this.drawPoint('red');
                this.drawLine('red', this.lastPoint[this.lastPoint.length - 1], this.lastPoint); // 每帧画圆心

            } else {
                this.drawStatusPoint('red');
                this.drawPoint('red');
                this.drawLine('red', this.lastPoint[this.lastPoint.length - 1], this.lastPoint); // 每帧画圆心
            }
        } else {
            this.pswObj.step = 1;
            this.pswObj.fpassword = psw;
        }

    }
    H5lock.prototype.makeState = function () {
        if (this.pswObj.step == 2) {

        } else if (this.pswObj.step == 1) {} else {}
    }
    H5lock.prototype.setChooseType = function (type) {
        chooseType = type;
        init();
    }
    H5lock.prototype.initDom = function () {
        var wrap = document.createElement('div');
        var canvas = document.createElement('canvas');
        canvas.setAttribute('id', 'canvas');
        canvas.style.cssText = 'display: block;margin: 0 auto;z-index: 9; position: absolute';
        wrap.appendChild(canvas);

        var width = this.width || 320;
        var height = this.height || 320;

        document.getElementById('lock').appendChild(wrap);

        // 高清屏锁放
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
        canvas.height = height * this.devicePixelRatio;
        canvas.width = width * this.devicePixelRatio;


    }
    H5lock.prototype.init = function () {
        this.initDom();
        // this.pswObj = {}
        this.pswObj = {
            step: 2,
            spassword: JSON.parse('[{"x":317.3076923076923,"y":144.23076923076923,"index":7},{"x":201.92307692307693,"y":144.23076923076923,"index":4},{"x":86.53846153846155,"y":144.23076923076923,"index":1},{"x":86.53846153846155,"y":317.3076923076923,"index":2},{"x":201.92307692307693,"y":317.3076923076923,"index":5},{"x":317.3076923076923,"y":317.3076923076923,"index":8},{"x":317.3076923076923,"y":490.3846153846154,"index":9},{"x":201.92307692307693,"y":490.3846153846154,"index":6},{"x":86.53846153846155,"y":490.3846153846154,"index":3}]')
        }
        this.pswObj2 = {
            step: 2,
            spassword: JSON.parse('[{"x":663.4615384615385,"y":144.23076923076923,"index":16},{"x":548.0769230769231,"y":144.23076923076923,"index":13},{"x":432.69230769230774,"y":144.23076923076923,"index":10},{"x":432.69230769230774,"y":317.3076923076923,"index":11},{"x":432.69230769230774,"y":490.3846153846154,"index":12},{"x":548.0769230769231,"y":490.3846153846154,"index":15},{"x":663.4615384615385,"y":490.3846153846154,"index":18},{"x":663.4615384615385,"y":317.3076923076923,"index":17},{"x":548.0769230769231,"y":317.3076923076923,"index":14}]')
        }
        this.lastPoint = [];
        this.makeState();
        this.touchFlag = false;
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.createCircle();
        this.bindEvent();
    }
    H5lock.prototype.reset = function () {
        this.makeState();
        this.createCircle();
    }
    H5lock.prototype.bindEvent = function () {
        var self = this;
        this.canvas.addEventListener("touchstart", function (e) {
            e.preventDefault(); // 某些android 的 touchmove不宜触发 所以增加此行代码
            var po = self.getPosition(e);

            for (var i = 0; i < self.arr.length; i++) {
                if (Math.abs(po.x - self.arr[i].x) < self.r && Math.abs(po.y - self.arr[i].y) < self.r) {

                    self.touchFlag = true;
                    self.drawPoint(self.arr[i].x, self.arr[i].y);
                    self.lastPoint.push(self.arr[i]);
                    self.restPoint.splice(i, 1);
                    break;
                }
            }
        }, false);
        this.canvas.addEventListener("touchmove", function (e) {
            if (self.touchFlag) {
                self.update(self.getPosition(e));
            }
        }, false);
        this.canvas.addEventListener("touchend", function (e) {
            if (self.touchFlag) {
                self.touchFlag = false;
                self.storePass(self.lastPoint);
                setTimeout(function () {
                    self.reset();
                }, 500);
            }


        }, false);
    }
})();