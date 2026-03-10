
class ImCamera {
	constructor() {
		this.stream = null;
	}
}

ImCamera.prototype.isEnable = function () {
	return !!navigator && !!navigator.mediaDevices && !!navigator.mediaDevices.getUserMedia;
}

ImCamera.prototype.openVideo = function () {
	return new Promise((resolve, reject) => {
		let constraints = {
			video: true,
			audio: {
				echoCancellation: true, //音频开启回音消除
				noiseSuppression: true // 开启降噪
			}
		}
		navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
			console.log("摄像头打开")
			this.stopStream();
			this.stream = stream;
			resolve(stream);
		}).catch((e) => {
			console.log(e)
			console.log("摄像头未能正常打开")
			reject({
				code: 0,
				message: "摄像头未能正常打开"
			})
		})
	})
}


ImCamera.prototype.openAudio = function () {
	return new Promise((resolve, reject) => {
		let constraints = {
			video: false,
			audio: {
				echoCancellation: true, //音频开启回音消除
				noiseSuppression: true // 开启降噪
			}
		}
		navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
			this.stopStream();
			this.stream = stream;
			resolve(stream);
		}).catch(() => {
			console.log("麦克风未能正常打开")
			reject({
				code: 0,
				message: "麦克风未能正常打开"
			})
		})
	})
}


ImCamera.prototype.openScreen = function (withAudio) {
	return new Promise((resolve, reject) => {
		let constraints = {
			video: true
		}
		navigator.mediaDevices.getDisplayMedia(constraints).then(screenStream => {
			this.stopStream();
			// 默认投屏没有声音，这里补充音频流
			if (withAudio) {
				this.openAudio().then(audioStream => {
					this.stream = new MediaStream();
					screenStream.getVideoTracks().forEach(track => this.stream.addTrack(track));
					audioStream.getAudioTracks().forEach(track => this.stream.addTrack(track));
					resolve(this.stream);
				})
			} else {
				this.stream = screenStream;
				resolve(this.stream);
			}
		}).catch((e) => {
			console.log("获取屏幕画面失败:", e)
			reject({
				code: 0,
				message: "获取屏幕画面失败"
			})
		})

	})
}

ImCamera.prototype.stopStream = function () {
	// 停止流
	if (this.stream) {
		this.stream.getTracks().forEach(track => {
			track.stop();
		});
		this.stream = null;
	}
}

ImCamera.prototype.close = function () {
	this.stopStream();
}

export default ImCamera;