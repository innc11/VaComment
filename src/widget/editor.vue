<template>
    <div class="va-edit-panel">
        <div class="va-cancel-reply va-text va-common-button" title="取消回复" 
            v-show="isReplying" 
            v-on:click="$emit('cancel-reply')"
        >取消回复</div>

        <div class="va-nick-mail-website">
            <input name="nick" v-bind:placeholder="nickPlaceholder" type="text" class="va-input n-m-w" v-model="formData.nick">
            <input name="mail" v-bind:placeholder="mailPlaceholder" type="email" class="va-input n-m-w" v-model="formData.mail">
            <input name="website" v-bind:placeholder="websitePlaceholder" type="text" class="va-input n-m-w" v-model="formData.website">
        </div>
        
        <textarea id="va-comment-editor" 
            v-bind:placeholder="editorPlaceholder" 
            v-bind:default-placeholder="editorPlaceholder" 
            class="va-input va-text" 
            v-model="formData.content"
        ></textarea>
        
        <div class="va-action-bar">
            <div class="va-30 va-status-bar">
                <button type="button" class="va-common-button" v-on:click="previewVisible = !previewVisible">预览</button>
                <button type="button" class="va-common-button" v-on:click="smiliesVisible = !smiliesVisible">表情</button>
            </div>
            <div class="va-70 va-tools-bar">
                <div class="va-captcha">
                    <input type="text" class="va-input n-m-w va-captcha-field" v-model="formData.captcha">
                    <img v-bind:src="captchaUrl" v-on:click="refreshCaptcha"></img>
                </div>
                <button type="button" class="va-common-button" v-on:click="onComment">提交</button>
            </div>
        </div>

        <div class="va-smilies" v-show="smiliesVisible">表情面板</div>
        <div class="va-preview" v-show="previewVisible">
            <div class="va-preview-tip">Markdown 预览</div>
            <div class="va-preview-content va-markdown" v-html="formData.content? parseMarkdown(formData.content):''"></div>
        </div>

        <div class="va-alert" v-show="alertMessage.text!=''">
            <div class="va-alert-h">
                <div class="va-alert-text va-text" v-html="alertMessage.text"></div>
                <button type="button" class="va-common-button" v-on:click="hideAlert">{{alertMessage.button}}</button>

                <div class="va-alert-button"></div>
            </div>
        </div>
    </div>
</template>

<style>
    .va-alert {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        display: flex;
        align-items: center;
        flex-direction: column;
        background-color: rgba(77, 77, 77, 0.76);
    }

    .va-alert * {
        color: rgb(236, 233, 231) !important;
    }

    .va-alert-h {
        display: flex;
        align-items: center;
        flex-direction: column;
        margin: auto 0px;
    }

    .va-alert-text.va-text {
        font-size: 1.3rem;
        margin-bottom: 1rem;
        text-align: center;
    }
    .va-30 {
        width: 30%;
        min-width: 160px;
    }

    .va-70 {
        width: 70%;
        min-width: 240px;
    }

    .va-nick-mail-website {
        display: flex;
        flex-wrap: wrap;
        line-height: 1.75;
    }

    .va-input {
        border: none;
        resize: none;
        outline: none;
        padding: 10px 5px;
        max-width: 100%;
        font-size: .875em;
        box-sizing: border-box;
    }

    .n-m-w {
        min-width: 130px;
        width: 33.33%;
        border-bottom: 1px dashed #dedede;
    }
    .n-m-w:focus {
        border-bottom-color: #eb5055;
    }

    #va-comment-editor {
        width: 100%;
        min-height: 8.75em;
        font-size: .875em;
        margin-top: 0.5rem;
        background: transparent;
        resize: vertical;
        transition: all .25s ease;
        border: 1px solid seagreen;
    }

    .va-edit-panel {
        border: 1px solid #f0f0f0;
        border-radius: 4px;
        margin-bottom: 10px;
        overflow: hidden;
        position: relative;
        padding: 10px;
    }

    .va-action-bar {
        display: flex;
        flex-wrap: wrap;
    }

    .va-tools-bar {
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
    }

    .va-cancel-reply.va-common-button {
        width: 100%;
        background-color: #73ff2b2b;
    }

    .va-preview-content {
        border-radius: 5px;
        padding: 5px;
        border: 1px dashed #00000059;
        box-sizing: border-box;
    }

    .va-captcha {
        display: inline-flex;
        margin: 0px 8px;
        width: 190px;
    }

    .va-captcha img {
        cursor: pointer;
    }

    .va-captcha-field {
        border-radius: 5px;
        border: 1px dashed #dedede;
        min-width: unset;
        flex-grow: 1;
        flex-shrink: 1;
        padding-top: 0px;
        padding-bottom: 0px;
        font-size: 1.3rem;
        font-family: var(--va-monospace);
    }

</style>

<script lang="ts">
import Vue from 'vue'
import Valine from '..'
import marked2 from '../markedLib'

export default Vue.extend({
    mounted: function() {
        setTimeout(() => this.captchaUrl = this.owner.getCaptchaAPI(), 10)
    },
    methods: {
        parseMarkdown: function (text) {
            return marked2(text)
        },
        onComment: function () {
            if (!this.formData.content)  {
                this.showAlert('评论内容不能为空')
                return
            }

            if (!this.formData.nick) {
                this.showAlert('昵称不能为空')
                return
            }

            if (!this.formData.captcha) {
                this.showAlert('需要填写验证码')
                return
            }

            this.owner.submit({
                url: location.pathname,
                nick: this.formData.nick,
                mail: this.formData.mail,
                website: this.formData.website,
                content: this.formData.content,
                parent: -1,
                captcha: this.formData.captcha,
            })

            this.$emit('cancel-reply')

            this.owner.refresh()
        },
        refreshCaptcha: function (e) {
            this.formData.captcha = ''
            let url = this.captchaUrl
            this.captchaUrl = ''
            setTimeout(() => {
                this.captchaUrl = url
            }, 300)
        },
        hideAlert: function () {
            this.alertMessage.text = ''
        },
        showAlert: function (message, button='OK') {
            this.alertMessage.text = message
        }
    },
    data: () => {
        return {
            formData: {
                nick: '', mail: '',
                website: '', content: '',
                captcha: ''
            },
            alertMessage: {
                text: '',
                button: 'OK'
            },
            captchaUrl: '',
            previewVisible: false,
            smiliesVisible: false
        }
    },
    props: {
        owner: {
            type: Valine,
            required: true
        },
        isReplying: {
            type: Boolean,
            required: true
        },
        editorPlaceholder: {
            type: String,
            default: '还有什么要补充的嘛？'
        },
        nickPlaceholder: {
            type: String,
            default: '昵称'
        },
        mailPlaceholder: {
            type: String,
            default: '邮箱(会被保密)'
        },
        websitePlaceholder: {
            type: String,
            default: '网站(https://)'
        },
    }
})
</script>

