<template>
	<div class="local-video">
		<div class="avatar" :style="{ 'height': height, 'width': width }" v-show="!isShowVideo">
			<img class="background" :src="userInfo.headImage" v-if="userInfo.headImage">
			<head-image class="head-image" :url="userInfo.headImage" :name="userInfo.nickName" :size="160">
			</head-image>
		</div>
		<video v-show="isShowVideo" class="video" :class="userInfo.isShareScreen ? 'contain' : ''" ref="video"></video>
	</div>
</template>

<script>
import HeadImage from '@/components/common/HeadImage'
export default {
	name: "localVideo",
	components: {
		HeadImage
	},
	data() {
		return {
			stream: null,
			isReady: false,
			isFacing: true
		}
	},
	props: {
		userInfo: {
			type: Object
		},
		width: {
			type: Number
		},
		height: {
			type: Number
		},
	},
	methods: {
		open(stream) {
			this.stream = stream;
			// 显示本地视频
			this.$refs.video.srcObject = stream;
			this.$refs.video.muted = true;
			this.$refs.video.play().catch(() => {
				console.log("本地流播放异常")
			});
			this.isReady = !!stream;
		},
		setMicroPhone(isEnable) {
			this.stream.getTracks().forEach((track => {
				if (track.kind === 'audio') {
					track.enabled = isEnable;
				}
			}))
		}
	},
	computed: {
		isShowVideo() {
			return this.userInfo.isCamera || this.userInfo.isShareScreen
		}
	}
}
</script>

<style lang="scss" scoped>
.local-video {
	position: relative;
	width: 100%;
	height: 100%;
	background: var(--im-background);
	cursor: pointer;
	overflow: hidden;
	border: 2px solid #eee;
	box-sizing: border-box;

	.avatar {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	.background {
		width: 100%;
		height: 100%;
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		filter: blur(50px);
		object-fit: cover;
	}

	.video {
		position: relative;
		width: 100%;
		height: 100%;
		object-fit: cover;
		background: var(--im-background);

		&.contain {
			object-fit: contain;
		}
	}
}
</style>
