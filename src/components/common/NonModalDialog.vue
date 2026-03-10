<template>
    <div v-if="visible">
        <!-- 自定义非模态窗口 -->
        <div v-show="!isMinimized" class="custom-dialog" :class="{ fullscreen: isFullScreen }" :style="windowStyle">
            <!-- 窗口标题栏 -->
            <div class="dialog-header" :class="{ 'no-drag': isFullScreen }" @mousedown="startDrag">
                <div class="dialog-title">{{ title }}</div>
                <div class="dialog-controls">
                    <div v-if="showMinimize" class="control-btn minimize-btn" @click="minimizeWindow" title="最小化">
                        <i class="el-icon-minus"></i>
                    </div>
                    <div v-if="showMaximize" class="control-btn maximize-btn" @click="toggleFullScreen" title="全屏">
                        <i class="el-icon-full-screen"></i>
                    </div>
                    <div v-if="showClose" class="control-btn close-btn" @click="closeDialog" title="关闭">
                        <i class="el-icon-close"></i>
                    </div>
                </div>
            </div>

            <!-- 窗口内容 -->
            <div class="dialog-content">
                <slot></slot>
            </div>
        </div>

        <!-- 最小化后的任务栏图标 -->
        <div v-show="isMinimized" class="taskbar-icon" :style="taskbarStyle" @mousedown="startTaskbarDrag">
            <div class="taskbar-content" @click="handleTaskbarClick">
                <div class="taskbar-avatar">
                    <slot name="taskbar-avatar">
                        <div class="default-avatar">{{ title.charAt(0) }}</div>
                    </slot>
                </div>
                <div class="taskbar-info">
                    <div class="taskbar-name">{{ title }}</div>
                    <div class="taskbar-status">{{ taskbarStatus }}</div>
                </div>
            </div>
            <div class="taskbar-controls">
                <div class="taskbar-btn restore-btn" @click="restoreWindow" title="恢复">
                    <i class="el-icon-plus"></i>
                </div>
                <div class="taskbar-btn close-btn" @click="closeDialog" title="关闭">
                    <i class="el-icon-close"></i>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'NonModalDialog',
    props: {
        // 显示状态
        visible: {
            type: Boolean,
            default: false
        },
        // 窗口标题
        title: {
            type: String,
            default: '对话框'
        },
        // 窗口尺寸
        width: {
            type: [Number, String],
            default: 800
        },
        height: {
            type: [Number, String],
            default: 600
        },
        // 控制按钮显示
        showMinimize: {
            type: Boolean,
            default: true
        },
        showMaximize: {
            type: Boolean,
            default: true
        },
        showClose: {
            type: Boolean,
            default: true
        },
        // 任务栏状态文本
        taskbarStatus: {
            type: String,
            default: '运行中'
        },
        // 是否可拖拽
        draggable: {
            type: Boolean,
            default: true
        },
        // 是否可最小化
        minimizable: {
            type: Boolean,
            default: true
        },
        // 是否可全屏
        resizable: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            // 窗口状态管理
            isMinimized: false,
            isFullScreen: false,
            isDragging: false,
            dragOffset: { x: 0, y: 0 },
            windowPosition: { x: 0, y: 0 }, // 初始位置，会在resetWindowState中计算居中
            windowSize: { width: this.width, height: this.height },
            // 任务栏拖拽状态
            isTaskbarDragging: false,
            taskbarDragOffset: { x: 0, y: 0 },
            taskbarPosition: { x: window.innerWidth - 325, y: window.innerHeight - 78 },
            taskbarDragFrame: null,
            taskbarHasDragged: false // 标记是否发生了拖拽
        }
    },
    watch: {
        visible(newVal) {
            if (newVal) {
                this.resetWindowState();
            }
        },
        width(newVal) {
            this.windowSize.width = newVal;
        },
        height(newVal) {
            this.windowSize.height = newVal;
        }
    },
    methods: {
        // 重置窗口状态
        resetWindowState() {
            this.isMinimized = false;
            this.isFullScreen = false;
            this.windowSize = { width: this.width, height: this.height };

            // 计算屏幕居中位置
            const centerX = (window.innerWidth - this.width) / 2;
            const centerY = (window.innerHeight - this.height) / 2;
            this.windowPosition = {
                x: Math.max(0, centerX),
                y: Math.max(0, centerY)
            };

            this.taskbarPosition = { x: window.innerWidth - 325, y: window.innerHeight - 78 };
        },
        // 关闭对话框
        closeDialog() {
            this.$emit('close');
        },
        // 切换全屏
        toggleFullScreen() {
            if (!this.resizable) return;
            this.isFullScreen = !this.isFullScreen;
            this.$emit('fullscreen-change', this.isFullScreen);
        },
        // 窗口拖拽相关方法
        startDrag(event) {
            if (!this.draggable || event.target.closest('.dialog-controls') || this.isFullScreen) return;
            this.isDragging = true;
            const rect = event.currentTarget.getBoundingClientRect();
            this.dragOffset.x = event.clientX - rect.left;
            this.dragOffset.y = event.clientY - rect.top;
            document.addEventListener('mousemove', this.onDrag);
            document.addEventListener('mouseup', this.endDrag);
            event.preventDefault();
        },
        onDrag(event) {
            if (!this.isDragging) return;
            this.windowPosition.x = event.clientX - this.dragOffset.x;
            this.windowPosition.y = event.clientY - this.dragOffset.y;

            // 限制窗口在视窗内
            const maxX = window.innerWidth - this.windowSize.width;
            const maxY = window.innerHeight - this.windowSize.height;
            this.windowPosition.x = Math.max(0, Math.min(this.windowPosition.x, maxX));
            this.windowPosition.y = Math.max(0, Math.min(this.windowPosition.y, maxY));
        },
        endDrag() {
            this.isDragging = false;
            document.removeEventListener('mousemove', this.onDrag);
            document.removeEventListener('mouseup', this.endDrag);
        },
        // 窗口最小化/恢复
        minimizeWindow() {
            if (!this.minimizable) return;
            this.isMinimized = true;
            this.$emit('minimize');
        },
        restoreWindow() {
            this.isMinimized = false;
            this.$emit('restore');
        },
        handleTaskbarClick() {
            // 如果发生了拖拽，不执行恢复操作
            if (this.taskbarHasDragged) {
                return;
            }
            this.restoreWindow();
        },
        // 任务栏拖拽相关方法
        startTaskbarDrag(event) {
            if (event.target.closest('.taskbar-controls')) return;
            this.isTaskbarDragging = true;
            this.taskbarHasDragged = false; // 重置拖拽标志
            const rect = event.currentTarget.getBoundingClientRect();
            this.taskbarDragOffset.x = event.clientX - rect.left;
            this.taskbarDragOffset.y = event.clientY - rect.top;

            // 使用更高效的事件监听
            document.addEventListener('mousemove', this.onTaskbarDrag, { passive: true });
            document.addEventListener('mouseup', this.endTaskbarDrag, { passive: true });
            document.addEventListener('mouseleave', this.endTaskbarDrag, { passive: true });

            // 禁用文本选择
            document.body.style.userSelect = 'none';
            document.body.style.cursor = 'move';

            event.preventDefault();
        },
        onTaskbarDrag(event) {
            if (!this.isTaskbarDragging) return;

            // 标记发生了拖拽
            this.taskbarHasDragged = true;

            // 使用requestAnimationFrame优化性能，并添加防抖
            if (this.taskbarDragFrame) {
                cancelAnimationFrame(this.taskbarDragFrame);
            }

            this.taskbarDragFrame = requestAnimationFrame(() => {
                // 直接更新位置，减少计算
                const newX = event.clientX - this.taskbarDragOffset.x;
                const newY = event.clientY - this.taskbarDragOffset.y;

                // 限制任务栏在视窗内
                const maxX = window.innerWidth - 325;
                const maxY = window.innerHeight - 78;

                this.taskbarPosition.x = Math.max(0, Math.min(newX, maxX));
                this.taskbarPosition.y = Math.max(0, Math.min(newY, maxY));
            });
        },
        endTaskbarDrag() {
            this.isTaskbarDragging = false;

            // 清理事件监听
            document.removeEventListener('mousemove', this.onTaskbarDrag);
            document.removeEventListener('mouseup', this.endTaskbarDrag);
            document.removeEventListener('mouseleave', this.endTaskbarDrag);

            // 恢复文本选择和光标
            document.body.style.userSelect = '';
            document.body.style.cursor = '';

            // 清理动画帧
            if (this.taskbarDragFrame) {
                cancelAnimationFrame(this.taskbarDragFrame);
                this.taskbarDragFrame = null;
            }
        }
    },
    computed: {
        windowStyle() {
            if (this.isFullScreen) {
                return {
                    position: 'fixed',
                    left: '0px',
                    top: '0px',
                    width: '100vw',
                    height: '100vh',
                    zIndex: 999
                }
            }
            return {
                position: 'fixed',
                left: this.windowPosition.x + 'px',
                top: this.windowPosition.y + 'px',
                width: this.windowSize.width + 'px',
                height: this.windowSize.height + 'px',
                zIndex: 999
            }
        },
        taskbarStyle() {
            return {
                position: 'fixed',
                left: this.taskbarPosition.x + 'px',
                top: this.taskbarPosition.y + 'px',
                zIndex: 10000
            }
        }
    },
    mounted() {
        // 组件挂载时计算初始居中位置
        this.resetWindowState();
    },
    beforeUnmount() {
        // 清理事件监听
        document.removeEventListener('mousemove', this.onDrag);
        document.removeEventListener('mouseup', this.endDrag);
        document.removeEventListener('mousemove', this.onTaskbarDrag);
        document.removeEventListener('mouseup', this.endTaskbarDrag);
        document.removeEventListener('mouseleave', this.endTaskbarDrag);
    }
}
</script>

<style lang="scss" scoped>
// 自定义对话框样式
.custom-dialog {
    background: var(--im-background);
    border-radius: 10px;
    box-shadow: 0 1px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid #d9d9d9;
    overflow: hidden;
    user-select: none;

    &.fullscreen {
        border-radius: 0;
        box-shadow: none;
        border: none;
    }

    .dialog-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 32px;
        background: #fafafa;
        border-bottom: 1px solid #d9d9d9;
        padding: 5px 10px;
        cursor: move;

        &.no-drag {
            cursor: default;
        }

        .dialog-title {
            font-weight: 600;
            font-size: var(--im-font-size);
            flex: 1;
        }

        .dialog-controls {
            display: flex;
            gap: 6px;

            .control-btn {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: var(--im-font-size);
                color: var(--im-text-color);

                &:hover {
                    background: #eee;
                    transform: translateY(-1px);
                }

                &.close-btn:hover {
                    background: var(--im-color-danger);
                    color: white;
                }
            }
        }
    }

    .dialog-content {
        height: calc(100% - 42px);
        overflow: hidden;
    }
}

// 任务栏图标样式
.taskbar-icon {
    width: 300px;
    height: 60px;
    border-radius: 8px;
    background: var(--im-background);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid #d9d9d9;
    cursor: move;
    transition: background-color 0.1s ease;
    z-index: 9999;
    display: flex;
    align-items: center;
    padding: 8px 12px;
    user-select: none;
    position: relative;
    will-change: transform;
    transform: translateZ(0);

    &:hover {
        background: var(--im-background-active);
    }

    .taskbar-content {
        display: flex;
        align-items: center;
        flex: 1;
        cursor: pointer;

        .taskbar-avatar {
            border-radius: 50%;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;

            .default-avatar {
                width: 100%;
                height: 100%;
                background: var(--im-color-primary);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                font-weight: 600;
            }
        }

        .taskbar-info {
            margin-left: 12px;
            flex: 1;

            .taskbar-name {
                font-size: 14px;
                font-weight: 600;
                color: #2c3e50;
                margin-bottom: 2px;
            }

            .taskbar-status {
                font-size: 12px;
                color: #6c757d;
                font-weight: 500;
            }
        }
    }

    .taskbar-controls {
        display: flex;
        gap: 6px;
        margin-left: 12px;

        .taskbar-btn {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: var(--im-font-size);
            color: var(--im-text-color);

            &:hover {
                background: #eee;
                transform: translateY(-1px);
            }

            &.close-btn:hover {
                background: var(--im-color-danger);
                color: white;
            }
        }
    }
}
</style>
