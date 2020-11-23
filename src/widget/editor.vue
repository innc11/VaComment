<template>
    <div class="va-editor-widget">
        <div class="va-cancel-reply va-text va-common-button" title="取消回复" 
            v-show="isReplying" 
            v-on:click="$emit('cancel-reply')"
        >取消回复</div>

        <div class="va-nick-mail-website">
            <input name="nick" v-bind:placeholder="nickPlaceholder" type="text" class="va-input-field n-m-w" v-model="formData.nick">
            <input name="mail" v-bind:placeholder="mailPlaceholder" type="email" class="va-input-field n-m-w" v-model="formData.mail">
            <input name="website" v-bind:placeholder="websitePlaceholder" type="text" class="va-input-field n-m-w" v-model="formData.website">
        </div>
        
        <textarea id="va-comment-editor" 
            v-bind:placeholder="editorPlaceholder" 
            v-bind:default-placeholder="editorPlaceholder" 
            class="va-input-field va-text" 
            v-model="formData.content"
        ></textarea>
        
        <div class="va-panel-main">
            <div class="va-status-bar">
                <button type="button" class="va-common-button" v-on:click="previewVisible = !previewVisible">预览</button>
                <button type="button" class="va-common-button" v-if="true" v-on:click="smiliesVisible = !smiliesVisible">表情</button>
            </div>
            <div class="va-tools-bar">
                <div class="va-captcha">
                    <input type="text" class="va-input-field" placeholder="验证码" v-model="formData.captcha">
                    <img v-bind:src="captchaUrl" v-on:click="refreshCaptcha"></img>
                </div>
                <button type="button" class="va-common-button" v-on:click="onComment">提交</button>
            </div>
        </div>

        <div class="va-panel-smilies" v-show="smiliesVisible">
            <div>表情</div>
            <div class="va-panel-extended">
                <smilies-comment></smilies-comment>
            </div>
        </div>
        <div class="va-panel-preview" v-show="previewVisible">
            <div>预览</div>
            <div class="va-panel-extended va-markdown" v-html="formData.content? parseMarkdown(formData.content):''"></div>
        </div>

        <div class="va-alert" v-show="alertMessage.text!=''">
            <div class="va-alert-h">
                <div class="va-alert-text va-text" v-html="alertMessage.text"></div>
                <button type="button" class="va-common-button" v-on:click="hideAlert">{{alertMessage.button}}</button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Valine from '..'
import smiliesComponet from './smilies.vue'
import marked2 from '../markedLib'
import inserfunc from '../utils/jq-insert.js'

export default Vue.extend({
    mounted: function() {
        setTimeout(() => this.captchaUrl = this.owner.getCaptchaAPI(), 10)
        inserfunc()

        this.smiliesComponet = this.$children[0]
    },
    methods: {
        parseMarkdown: function (text) {
            // 解析表情
            for(let k in this.smiliesComponet.smilies)
            {
                let sms = this.smiliesComponet.smilies[k]
                for(let sm in sms)
                {
                    let url = sms[sm]
                    let el = '<img class="smilie" src="'+url+'" alt="'+sm+'" style="max-width:84px !important;max-height: 84px !important;display:inline-block;"/>';
                    text = text.replace(':'+sm+':', el)
                }
            }
            return marked2(text)
        },
        onComment: function () {
            if (!this.formData.content)  {
                this.showAlert('写点儿什么吧')
                return
            }

            if (!this.formData.nick) {
                this.showAlert('如何称呼您呢?')
                return
            }

            if (process.env.NODE_ENV === 'production')
            {
                if (!this.formData.captcha) {
                    this.showAlert('需要填写验证码哦')
                    return
                }
            }

            if (this.formData.mail)
            {
                let reg = new RegExp('^\\w+([-+.]\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*$', 'g')
                if (!this.formData.mail.match(reg))
                {
                    this.showAlert('邮箱请使用xx@xx.xx格式')
                    return
                }
            }

            if (this.formData.website)
            {
                let reg = new RegExp('^https?://([\\w-]+\\.)+[\\w-]+(/[\\w-./?%&=]*)?$', 'g')
                if (!this.formData.website.match(reg))
                {
                    this.showAlert('网站格式请使用http://或者https://开头')
                    return
                }
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

            this.owner.refresh()
        },
        refreshCaptcha: function (e) {
            this.formData.captcha = ''
            let url = this.captchaUrl
            this.captchaUrl = ''
            setTimeout(() => {
                this.captchaUrl = url
            }, 5)
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
            editorPlaceholder: '说点儿什么吧',
            nickPlaceholder: '昵称',
            mailPlaceholder: '邮箱',
            websitePlaceholder: '网站',

            smiliesComponet: null,
            formData: {
                nick: '', mail: '',
                website: '', content: '',
                captcha: ''
            },
            alertMessage: {
                text: '',
                button: '好的'
            },
            captchaUrl: '',
            previewVisible: false,
            smiliesVisible: false,
        }
    },
    watch: {
        smiliesVisible: function(newV, oldV)
        {
            this.previewVisible = newV
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
        }
    },
    components: {
        'smilies-comment': smiliesComponet,
    }
})
</script>


<style lang="scss">
    // 警告面板
    .va-alert {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        display: flex;
        align-items: center;
        flex-direction: column;
        background-color: #4d4d4dc2;

        .va-alert-h {
            display: flex;
            align-items: center;
            flex-direction: column;
            margin: auto 0px;

            .va-alert-text {
                font-size: 1.3rem;
                margin-bottom: 1rem;
                text-align: center;
            }
        }

        * {
            color: #ece9e7 !important;
        }
    }

    .va-nick-mail-website {
        display: flex;
        flex-wrap: wrap;
        line-height: 1.75;

        > input {
            min-width: 160px;
            width: 33.33%;
            border-bottom: 1px dashed #dedede;
            border-radius: 0px;
        }
        > input:focus {
            border-bottom-color: #e97276;
        }
    }

    // 可输入字段
    .va-input-field {
        border: none;
        resize: none;
        outline: none;
        padding: 10px 5px;
        max-width: 100%;
        font-size: .875em;
        box-sizing: border-box;
        border-radius: 0px;
    }

    // 输入框
    #va-comment-editor {
        width: 100%;
        min-height: 8.75em;
        font-size: 0.875em;
        margin-top: 0.5rem;
        background: transparent;
        resize: vertical;
        transition: all .25s ease;
        border: 1px solid #2b805031;
        word-break: break-all;
    }

    // 整个编辑器组件
    .va-editor-widget {
        border: 1px solid #f0f0f0;
        border-radius: 4px;
        margin-bottom: 10px;
        overflow: hidden;
        position: relative;
        padding: 10px;
    }

    // 主面板（预览/验证码/提交按钮等）
    .va-panel-main {
        display: flex;
        flex-wrap: wrap;

        .va-status-bar {
            width: 25%;
            min-width: 160px;
        }

        .va-tools-bar {
            width: 75%;
            display: flex;
            flex-direction: row;
            justify-content: flex-end;
        }
    }

    // 取消回复按钮
    .va-cancel-reply.va-common-button {
        width: 100%;
        background-color: #73ff2b2b;
    }

    // 扩展的面板
    .va-panel-extended {
        padding: 0px 8px;
        border: 1px dashed #00000059;
        box-sizing: border-box;
    }

    // 验证码
    .va-captcha {
        display: inline-flex;
        margin: 0px 8px;

        img {
            cursor: pointer;
        }

        input {
            border-bottom: 1px solid#dedede;
            min-width: unset;
            padding-top: 0px;
            padding-bottom: 0px;
            font-size: 1.3rem;
            font-family: var(--va-monospace);
            width: 80px;
        }
    }

</style>
