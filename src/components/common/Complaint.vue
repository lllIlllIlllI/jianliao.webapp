<template>
    <el-dialog v-dialogDrag title="投诉" :visible.sync="show" width="800px">
        <div class="complaint">
            <el-form class="form" :model="formData" :rules="rules" status-icon ref="form" label-width="120px">
                <el-form-item label="投诉对象">
                    <div>{{ formData.targetName }} </div>
                </el-form-item>
                <el-form-item prop="type" label="投诉原因">
                    <el-select v-model="formData.type">
                        <el-option v-for="item in $dict.COMPLAINT_TYPE" :key="item.val" :label="item.name"
                            :value="item.val">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item prop="images" label="图片证据">
                    <div class="images">
                        <div v-for="(img, idx) in formData.images" :key="idx">
                            <div class="image-item" v-loading="img.loading">
                                <img class="image" :src="img.thumbUrl" loading="lazy" />
                                <div class="mask">
                                    <div class="remove">
                                        <i class="icon el-icon-zoom-in" @click="onFullImage(idx)"></i>
                                        <i class="icon el-icon-delete" @click="onRemoveImage(idx)"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <file-upload v-show="formData.images.length < maxUploadSize" :action="'/image/upload'"
                            :maxSize="10 * 1024 * 1024"
                            :fileTypes="['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif']"
                            @before="onUploadBefore" @success="onUploadSuccess" @fail="onUploadFail">
                            <div class="upload-image">
                                <i class="el-icon-plus"></i>
                            </div>
                        </file-upload>
                    </div>
                    <div class="count-tip">您上传了{{ countTip }}张图片</div>
                </el-form-item>
                <el-form-item prop="content" label="投诉内容">
                    <el-input type="textarea" placeholder="请输入投诉内容" v-model="formData.content" :rows="6"
                        maxlength="512" show-word-limit></el-input>
                </el-form-item>
            </el-form>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button @click="close()">取 消</el-button>
            <el-button type="primary" @click="submit()">确 定</el-button>
        </span>
    </el-dialog>
</template>
<script>
import FileUpload from './FileUpload.vue';
export default {
    name: 'complaint',
    components: { FileUpload },
    data() {

        return {
            maxImageId: 1,
            show: false,
            maxUploadSize: 9,
            targetName: '',
            formData: {
                type: null,
                images: [],
                content: ''
            },
            rules: {
                type: [{
                    required: true, message: '请选择投诉原因', trigger: 'blur'
                }],
                content: [{
                    required: true, message: '请输入投诉内容', trigger: 'blur'
                }]
            }
        }
    },
    methods: {
        open(type, id, name) {
            this.show = true;
            this.formData.type = null;
            this.formData.content = '';
            this.formData.images = [];
            this.formData.targetType = type;
            this.formData.targetId = id;
            this.formData.targetName = name;
        },
        close() {
            this.show = false;
        },
        submit() {
            this.$refs.form.validate((valid) => {
                if (valid) {
                    this.$http({
                        url: '/complaint/initiate',
                        method: 'post',
                        data: this.formData
                    }).then(() => {
                        this.$message.success("我们已收到您的投诉，工作人员会在3个工作日内核实并处理")
                        this.close();
                    })
                }
            });
        },
        onUploadBefore(file) {
            if (this.formData.images.length >= this.maxUploadSize) {
                this.$message.error(`最多上传${this.maxUploadSize}张图片`);
                return;
            }
            let id = this.maxImageId++;
            let url = URL.createObjectURL(file);
            let image = {
                id: id,
                originUrl: url,
                thumbUrl: url,
                loading: true
            }
            this.formData.images.push(image);
            file.id = id;
            return true;
        },
        onUploadSuccess(data, file) {
            let image = this.formData.images.find(m => m.id == file.id);
            if (image) {
                image.originUrl = data.originUrl;
                image.thumbUrl = data.thumbUrl;
                image.loading = false;
            }
        },
        onUploadFail(data, file) {
            for (let idx in this.formData.images) {
                let image = this.formData.images[idx];
                if (image.id == file.id) {
                    this.formData.images.splice(idx, 1);
                    break;
                }
            }
        },
        onFullImage(idx) {
            this.$eventBus.$emit("openFullImage", this.formData.images[idx].originUrl);
        },
        onRemoveImage(idx) {
            this.formData.images.splice(idx, 1);
        },
        findImage(id) {
            return this.formData.images.find(m => m.id == id);
        }
    },
    computed: {
        countTip() {
            return `(${this.formData.images.length}/${this.maxUploadSize})`
        }
    }
}
</script>

<style scoped lang="scss">
.complaint {

    .images {
        display: flex;
        flex-wrap: wrap;
        margin-bottom: 10rpx;

        .image-item {
            position: relative;
            margin: 3px;
            width: 120px;
            height: 120px;
            border-radius: 5px;

            .image {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .mask {
                display: none;
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
            }

            &:hover {
                .mask {
                    display: flex;
                    justify-content: center;
                    background: black;
                    opacity: 0.5;
                    color: white;
                    font-size: 22px;

                    .icon {
                        margin: 15px 8px;
                        cursor: pointer;
                    }
                }
            }
        }

        .upload-image {
            margin: 3px;
            width: 120px;
            height: 120px;
            border-radius: 5px;
            background: #f8f8f8;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 30px;
            border: 1px solid #eee;
            color: var(--im-text-color-light);
        }
    }

    .count-tip {
        color: var(--im-text-color-light);
        text-align: left;
    }
}
</style>
