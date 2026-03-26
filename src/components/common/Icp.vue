<template>
	<div class="icp" v-if="!configStore.electronMode">
		<a target="_blank" rel="noopener noreferrer" href="https://www.jianliao.net.cn/">官方客服</a>
	</div>
</template>

<script>
</script>

<style lang="scss">
.icp {
	position: fixed;
	text-align: center;
	bottom: 20px;
	margin: 0 auto;
	width: 100%;
	color: #5c6b77;

	a {
		color: #1677ff;
		text-decoration: none;
		font-weight: 700;
		font-size: 14px;
		letter-spacing: 0.5px;
		text-shadow: 0 1px 6px rgba(22, 119, 255, 0.25);
		transition: color 0.2s ease, text-shadow 0.2s ease, transform 0.2s ease;
		display: inline-block;
	}

	a:hover {
		color: #0f5fd1;
		text-shadow: 0 2px 10px rgba(22, 119, 255, 0.35);
		transform: translateY(-1px);
	}

	.icp-icon {
		width: 20px;
		height: 20px;
		vertical-align: bottom;
	}
}
</style>
