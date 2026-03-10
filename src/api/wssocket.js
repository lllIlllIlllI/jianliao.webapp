var websock = null;
let rec; //断线重连后，延迟5秒重新创建WebSocket连接  rec用来存储延迟请求的代码
let isConnect = false; //连接标识 避免重复连接
let connectCallBack = null;
let messageCallBack = null;
let closeCallBack = null
let devId = Math.floor(Math.random() * 1000000)

const normalizeWsUrl = (rawUrl) => {
	let urlText = (rawUrl || '').trim();

	// Cloudflare env 配置错误时常见值: .../undefined
	urlText = urlText.replace(/\/undefined\/?$/, '/im');

	if (!urlText) {
		const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
		urlText = `${wsProtocol}//${window.location.host}/im`;
	}

	try {
		const parsedUrl = new URL(urlText);
		if (parsedUrl.protocol !== 'ws:' && parsedUrl.protocol !== 'wss:') {
			const wsProtocol = parsedUrl.protocol === 'https:' ? 'wss:' : 'ws:';
			parsedUrl.protocol = wsProtocol;
		}
		if (!parsedUrl.pathname || parsedUrl.pathname === '/') {
			parsedUrl.pathname = '/im';
		}
		return parsedUrl.toString().replace(/\/$/, '');
	} catch (e) {
		return urlText.replace(/\/$/, '');
	}
}

const buildWsCandidates = (rawUrl) => {
	try {
		const parsedUrl = new URL(normalizeWsUrl(rawUrl));
		const base = `${parsedUrl.protocol}//${parsedUrl.host}`;
		const path = parsedUrl.pathname || '/';
		const candidates = [];
		candidates.push(`${base}${path}`);
		if (path === '/') {
			candidates.push(`${base}/ws`);
			candidates.push(`${base}/websocket`);
			candidates.push(`${base}/im/ws`);
		}
		// 去重，避免重复尝试
		return [...new Set(candidates)];
	} catch (e) {
		return [rawUrl];
	}
}

let connect = (wsurl, accessToken) => {
	try {
		if (isConnect) {
			return;
		}
		const candidates = buildWsCandidates(wsurl);
		console.log("WebSocket候选地址:", candidates);
		const tryConnect = (index) => {
			const targetUrl = candidates[index];
			let opened = false;
			let switched = false;
			console.log("连接WebSocket:", targetUrl);
			websock = new WebSocket(targetUrl);
			websock.onmessage = function (e) {
				let sendInfo = JSON.parse(e.data)
				if (sendInfo.cmd == 0) {
					heartCheck.start()
					// 登录成功才算真正完成连接
					connectCallBack && connectCallBack();
					console.log('WebSocket登录成功')
				} else if (sendInfo.cmd == 1) {
					// 重新开启心跳定时
					heartCheck.reset();
				} else {
					// 其他消息转发出去
					console.log("收到消息:", sendInfo);
					messageCallBack && messageCallBack(sendInfo.cmd, sendInfo.data)
				}
			}
			websock.onclose = function (e) {
				if (!opened && !isConnect && !switched && index < candidates.length - 1) {
					switched = true;
					console.log('WebSocket握手失败，尝试下一个地址');
					tryConnect(index + 1);
					return;
				}
				console.log('WebSocket连接关闭')
				isConnect = false; //断开后修改标识
				closeCallBack && closeCallBack(e);
			}
			websock.onopen = function () {
				opened = true;
				console.log("WebSocket连接成功");
				isConnect = true;
				// 发送登录命令
				let loginInfo = {
					cmd: 0,
					data: {
						accessToken: accessToken,
						devId: devId
					}
				};
				websock.send(JSON.stringify(loginInfo));
			}

			// 连接发生错误的回调方法
			websock.onerror = function (e) {
				if (!opened && !isConnect && !switched && index < candidates.length - 1) {
					switched = true;
					console.log('WebSocket握手失败，尝试下一个地址');
					tryConnect(index + 1);
					return;
				}
				console.log('WebSocket连接发生错误:{}', e)
				close(3000);
				isConnect = false;
				closeCallBack && closeCallBack(e);
			}
		}
		tryConnect(0);
	} catch (e) {
		console.log("尝试创建连接失败");
		reconnect(wsurl, accessToken); //如果无法连接上webSocket 那么重新连接！可能会因为服务器重新部署，或者短暂断网等导致无法创建连接
	}
};

//定义重连函数
let reconnect = (wsurl, accessToken) => {
	console.log("尝试重新连接");
	if (isConnect) {
		//如果已经连上就不在重连了
		return;
	}
	rec && clearTimeout(rec);
	rec = setTimeout(function () { // 延迟5秒重连  避免过多次过频繁请求重连
		connect(wsurl, accessToken);
	}, 15000);
};
//设置关闭连接
let close = (code) => {
	if (!isConnect) {
		return;
	}
	websock && websock.close(code);
};


//心跳设置
let heartCheck = {
	timeout: 20000, //每段时间发送一次心跳包 这里设置为20s
	timeoutObj: null, //延时发送消息对象（启动心跳新建这个对象，收到消息后重置对象）
	start: function () {
		if (isConnect) {
			console.log('发送WebSocket心跳')
			let heartBeat = {
				cmd: 1,
				data: {}
			};
			websock.send(JSON.stringify(heartBeat))
		}
	},

	reset: function () {
		clearTimeout(this.timeoutObj);
		this.timeoutObj = setTimeout(function () {
			heartCheck.start();
		}, this.timeout);

	}
};



// 实际调用的方法
let sendMessage = (agentData) => {
	if (websock.readyState === websock.OPEN) {
		// 若是ws开启状态
		websock.send(JSON.stringify(agentData))
	} else if (websock.readyState === websock.CONNECTING) {
		// 若是 正在开启状态，则等待1s后重新调用
		setTimeout(function () {
			sendMessage(agentData)
		}, 1000)
	} else {
		// 若未开启 ，则等待1s后重新调用
		setTimeout(function () {
			sendMessage(agentData)
		}, 1000)
	}
}

let onConnect = (callback) => {
	connectCallBack = callback;
}

let onMessage = (callback) => {
	messageCallBack = callback;
}


let onClose = (callback) => {
	closeCallBack = callback;
}
// 将方法暴露出去
export {
	connect,
	reconnect,
	close,
	sendMessage,
	onConnect,
	onMessage,
	onClose,
}
