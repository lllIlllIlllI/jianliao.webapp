<template>
	<div ref="item" class="group-member-bar" :class="active ? 'active' : ''" :style="{ 'height': height + 'px' }">
		<head-image :size="headImageSize" :name="member.showNickName" :url="member.headImage" :online="member.online">
		</head-image>
		<div class="name" :style="{ 'line-height': height + 'px' }">
			<div class="name-text" :title="member.showNickName">{{ member.showNickName }}</div>
			<div v-if="member.companyName" class="company-tag-mini" :title="member.companyName">@{{ member.companyName }}</div>
			<el-tag v-if="mine.id == member.userId" type="primary">我</el-tag>
			<el-tag v-if="member.userId == group.ownerId" type="danger">群主</el-tag>
			<el-tag v-if="member.isManager" type="primary">管理员</el-tag>
			<el-tag v-if="member.isMuted" type="warning">禁言中</el-tag>
		</div>
		<slot></slot>
	</div>
</template>
<script>
import HeadImage from "../common/HeadImage.vue";

export default {
	name: "groupMemberBar",
	components: { HeadImage },
	data() {
		return {

		};
	},
	props: {
		group: {
			type: Object,
			required: true
		},
		member: {
			type: Object,
			required: true
		},
		height: {
			type: Number,
			default: 50
		},
		active: {
			type: Boolean,
			default: false
		}
	},
	computed: {
		mine() {
			return this.userStore.userInfo;
		},
		headImageSize() {
			return Math.ceil(this.height * 0.75)
		}
	}
}
</script>


<style lang="scss" scoped>
.group-member-bar {
	display: flex;
	position: relative;
	padding: 0 15px;
	align-items: center;
	white-space: nowrap;
	box-sizing: border-box;
	border-radius: 5px;
	margin: 0 1px;
	cursor: pointer;

	&:hover {
		background-color: var(--im-background-active);
	}

	&.active {
		background-color: var(--im-background-active-dark);
	}

	.name {
		display: flex;
		align-items: center;
		flex: 1;
		height: 100%;
		padding: 10px;
		box-sizing: border-box;
		overflow: hidden;

		.name-text {
			text-align: left;
			font-size: var(--im-font-size);
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}
	}
}
</style>