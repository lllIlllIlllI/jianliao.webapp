<template>
	<div class="mobile-page">
		<div class="device-shell" aria-hidden="true">
			<div class="device-notch"></div>
			<div class="device-screen">
				<iframe
					class="mobile-frame"
					src="https://mobile.jianliao.net"
					title="简聊H5"
					frameborder="0"
				></iframe>
			</div>
		</div>
		<button class="copy-url" type="button" @click="copyUrl">在浏览器中打开</button>
	</div>
</template>

<script>
export default {
	name: "Mobile",
	methods: {
		async copyUrl() {
			const url = "https://mobile.jianliao.net";
			try {
				// 使用现代 Clipboard API
				await navigator.clipboard.writeText(url);
				this.$message && this.$message.success("已复制网址");
				// 复制成功后自动打开链接
				setTimeout(() => {
					window.open(url, '_blank');
				}, 300);
			} catch (e) {
				this.$message && this.$message.error("复制失败，请手动复制");
			}
		}
	}
}
</script>

<style scoped lang="scss">
.mobile-page {
	height: 100%;
	width: 100%;
	background: #fff;
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 24px 12px 56px;
}

.device-shell {
	position: relative;
	width: 390px;
	height: 844px;
	background: #101418;
	border-radius: 36px;
	padding: 12px;
	box-shadow: 0 24px 60px rgba(10, 18, 28, 0.35), 0 6px 18px rgba(10, 18, 28, 0.22);
	border: 1px solid rgba(255, 255, 255, 0.12);
}

.device-notch {
	position: absolute;
	top: 8px;
	left: 50%;
	transform: translateX(-50%);
	width: 120px;
	height: 20px;
	background: #0b0f14;
	border-radius: 0 0 16px 16px;
	z-index: 2;
}

.device-screen {
	position: relative;
	width: 100%;
	height: 100%;
	background: #fff;
	border-radius: 28px;
	overflow: hidden;
}

.mobile-frame {
	width: 100%;
	height: 100%;
	border: 0;
}

.copy-url {
	position: fixed;
	right: 24px;
	top: 24px;
	left: auto;
	transform: none;
	padding: 10px 18px;
	border-radius: 999px;
	border: 0;
	background: var(--im-color-primary);
	color: #fff;
	font-weight: 700;
	cursor: pointer;
	box-shadow: 0 10px 24px rgba(45, 85, 130, 0.22);
	z-index: 5;
}

.copy-url:hover {
	filter: brightness(0.95);
}

@media (max-width: 900px) {
	.mobile-page {
		padding: 0 0 56px;
	}

	.device-shell {
		width: 100%;
		height: 100%;
		border-radius: 0;
		padding: 0;
		box-shadow: none;
		border: 0;
	}

	.device-notch {
		display: none;
	}

	.device-screen {
		border-radius: 0;
	}
}
</style>
