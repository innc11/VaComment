<template>
    <div class="ac-comment-editor">
        <div class="ac-cancel-reply" title="取消回复" 
            v-show="isReplying" 
            v-on:click="$emit('cancel-reply')"
        >
            取消回复
        </div>

        <div class="ac-commenter-info">
            <input name="nick" type="text" class="ac-input"
                v-bind:placeholder="nickPlaceholder" 
                v-model="formData.nick"
            >
            <input name="mail" type="email" class="ac-input" 
                v-bind:placeholder="mailPlaceholder" 
                v-if="mailRequired" 
                v-model="formData.mail"
            >
            <input name="website" type="text" class="ac-input" 
                v-bind:placeholder="websitePlaceholder" 
                v-if="websiteRequired" 
                v-model="formData.website"
            >
        </div>
        
        <div style="position: relative">
            <textarea id="awesome-comment-input" 
                class="ac-input" 
                v-bind:placeholder="editorPlaceholder" 
                v-bind:default-placeholder="editorPlaceholder" 
                v-model="formData.content"
            ></textarea>

            <div class="ac-toolbar">
                <div class="ac-button" title="预览" v-on:click="previewVisible = !previewVisible">
                    <svg style="margin-right: 4px;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="17688" width="22" height="22"><path d="M502.390154 935.384615a29.538462 29.538462 0 1 1 0 59.076923H141.430154C79.911385 994.461538 29.538462 946.254769 29.538462 886.153846V137.846154C29.538462 77.745231 79.950769 29.538462 141.390769 29.538462h741.218462c61.44 0 111.852308 48.206769 111.852307 108.307692v300.268308a29.538462 29.538462 0 1 1-59.076923 0V137.846154c0-26.899692-23.355077-49.230769-52.775384-49.230769H141.390769c-29.420308 0-52.775385 22.331077-52.775384 49.230769v748.307692c0 26.899692 23.355077 49.230769 52.775384 49.230769h360.999385z" p-id="17689"></path><path d="M196.923077 216.615385m29.538461 0l374.153847 0q29.538462 0 29.538461 29.538461l0 0q0 29.538462-29.538461 29.538462l-374.153847 0q-29.538462 0-29.538461-29.538462l0 0q0-29.538462 29.538461-29.538461Z" p-id="17690"></path><path d="M649.846154 846.769231a216.615385 216.615385 0 1 0 0-433.230769 216.615385 216.615385 0 0 0 0 433.230769z m0 59.076923a275.692308 275.692308 0 1 1 0-551.384616 275.692308 275.692308 0 0 1 0 551.384616z" p-id="17691"></path><path d="M807.398383 829.479768m20.886847-20.886846l0 0q20.886846-20.886846 41.773692 0l125.321079 125.321079q20.886846 20.886846 0 41.773693l0 0q-20.886846 20.886846-41.773693 0l-125.321078-125.321079q-20.886846-20.886846 0-41.773693Z" p-id="17692"></path></svg>
                    预览
                </div>
                <div class="ac-button" title="表情" v-if="true" v-on:click="smiliesVisible = !smiliesVisible">
                    <svg style="margin-right: 4px;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="16172" width="22" height="22"><path d="M512 1024a512 512 0 1 1 512-512 512 512 0 0 1-512 512zM512 56.888889a455.111111 455.111111 0 1 0 455.111111 455.111111 455.111111 455.111111 0 0 0-455.111111-455.111111zM312.888889 512A85.333333 85.333333 0 1 1 398.222222 426.666667 85.333333 85.333333 0 0 1 312.888889 512z" p-id="16173"></path><path d="M512 768A142.222222 142.222222 0 0 1 369.777778 625.777778a28.444444 28.444444 0 0 1 56.888889 0 85.333333 85.333333 0 0 0 170.666666 0 28.444444 28.444444 0 0 1 56.888889 0A142.222222 142.222222 0 0 1 512 768z" p-id="16174"></path><path d="M782.222222 391.964444l-113.777778 59.733334a29.013333 29.013333 0 0 1-38.684444-10.808889 28.444444 28.444444 0 0 1 10.24-38.684445l113.777778-56.888888a28.444444 28.444444 0 0 1 38.684444 10.24 28.444444 28.444444 0 0 1-10.24 36.408888z" p-id="16175"></path><path d="M640.568889 451.697778l113.777778 56.888889a27.875556 27.875556 0 0 0 38.684444-10.24 27.875556 27.875556 0 0 0-10.24-38.684445l-113.777778-56.888889a28.444444 28.444444 0 0 0-38.684444 10.808889 28.444444 28.444444 0 0 0 10.24 38.115556z" p-id="16176"></path></svg>
                    表情
                </div>
                <div class="ac-captcha" v-if="captchaRequired">
                    <img title="点击刷新" style="border-radius: 3px;" v-bind:src="captchaUrl" v-on:click="refreshCaptcha"></img>
                    <input type="text" class="ac-input" style="margin-left: 7px;" placeholder="验证码" v-model="formData.captcha">
                </div>
                <div type="button" class="ac-button" v-on:click="onComment">提交</div>
            </div>
        </div>
        
        <div class="ac-panels">

            <div class="ac-preview-panel" v-if="previewVisible">
                <div>预览</div>
                <div class="ac-markdown" v-html="formData.content? parseMarkdown(formData.content):''"></div>
            </div>
            
            <div class="ac-smilies-panel" v-show="smiliesVisible">
                <div>表情</div>
                <div class="">
                    <smilies-comment></smilies-comment>
                </div>
            </div>
        
            
        </div>

        <div class="ac-alert-info" v-show="alertMessage.text!=''">
            <div class="ac-h">
                <div class="ac-text" v-html="alertMessage.text"></div>
                <div>
                    <button type="button" class="ac-button" v-on:click="cbButton1">{{alertMessage.button}}</button>
                    <button type="button" class="ac-button" v-show="alertMessage.button2!=''" v-on:click="cbButton2">{{alertMessage.button2}}</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import smiliesComponet from './SmilieBox.vue'
import marked2 from '../utils/markedLib'
import inserfunc from '../utils/jq-insert.js'
import CommentingModel from '../model/commentingModel'
import AwesomeComment from '..'

export default Vue.extend({
    name: 'comment-editor',
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
                    let el = '<img class="ac-smilie" src="'+url+'" alt="'+sm+'" />';
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

            if (process.env.NODE_ENV === 'production' && this.captchaRequired) {
                if (!this.formData.captcha) {
                    this.showAlert('需要填写验证码哦')
                    return
                }
            }

            if (this.formData.mail && this.mailRequired) {
                let reg = new RegExp('^\\w+([-+.]\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*$', 'g')
                if (!this.formData.mail.match(reg)) {
                    this.showAlert('邮箱请使用xx@xx.xx格式')
                    return
                }
            }

            if (this.formData.website && this.websiteRequired) {
                let reg = new RegExp('^https?://', 'g')
                if (!this.formData.website.match(reg))
                {
                    this.showAlert('网站格式请使用http(s)://开头')
                    return
                }
            }

            this.owner.submit({
                nick: this.formData.nick,
                mail: this.formData.mail,
                website: this.formData.website,
                content: this.formData.content,
                captcha: this.formData.captcha,
            } as CommentingModel)

            this.owner.refresh()
        },
        refreshCaptcha: function (e) {
            this.formData.captcha = ''
            this.captchaUrl = ''
            setTimeout(() => {
                this.captchaUrl = this.owner.getCaptchaAPI()
            }, 10)
        },
        hideAlert: function () {
            this.alertMessage.text = ''
        },
        showAlert: function (message: string, button='OK') {
            this.alertMessage.text = message
        },
        cbButton1: function() {
            if(this.alertMessage.cb_button1)
                this.alertMessage.cb_button1()
            this.hideAlert()
        },
        cbButton2: function() {
            if(this.alertMessage.cb_button2)
                this.alertMessage.cb_button2()
            this.hideAlert()

            this.alertMessage.cb_button2 = null
            this.alertMessage.button2 = ''
        }
    },
    data: () => ({
        smiliesComponet: null,
        formData: {
            nick: '', mail: '',
            website: '', content: '',
            captcha: ''
        },
        alertMessage: {
            text: '',
            button: '好的',
            button2: '',
            cb_button1: null,
            cb_button2: null,
        },
        captchaUrl: '',
        previewVisible: false,
        smiliesVisible: false,
    }),
    watch: {
        smiliesVisible: function(newV, oldV)
        {
            this.previewVisible = newV
        }
    },
    props: {
        owner: {
            type: AwesomeComment,
            required: true
        },
        isReplying: {
            type: Boolean,
            required: true
        },
        mailRequired: {
            type: Boolean,
            required: true
        },
        websiteRequired: {
            type: Boolean,
            required: true
        },
        captchaRequired: {
            type: Boolean,
            required: true
        },
        editorPlaceholder: {
            type: String,
            required: true
        },
        nickPlaceholder: {
            type: String,
            required: true
        },
        mailPlaceholder: {
            type: String,
            required: true
        },
        websitePlaceholder: {
            type: String,
            required: true
        }
    },
    components: {
        'smilies-comment': smiliesComponet,
    }
})
</script>


<style lang="scss">
    @import "../index.scss";

    .ac-comment-editor {
        border-bottom: 1px solid #f0f0f0;
        // border-radius: 4px;
        margin-bottom: 10px;
        overflow: hidden;
        position: relative;
        padding: 10px;

        .ac-input {
            @extend %awesome-comment-text;

            border: none;
            resize: none;
            outline: none;
            padding: 5px 5px;
            max-width: 100%;
            font-size: .875em;
            box-sizing: border-box;
            border-radius: 0px;
        }

        .ac-button {
            @extend %awesome-comment-button;
            padding: 4px 8px; 
            display: inline-flex;
        }

        .ac-cancel-reply {
            @extend %awesome-comment-button;

            width: 100%;
            background-color: #73ff2b2b;
        }

        .ac-commenter-info {
            display: flex;
            flex-wrap: wrap;
            line-height: 1.75;

            input {
                min-width: 160px;
                flex-grow: 1;
                border-radius: 0px;
            }
            input:focus {
                // border-bottom-color: #e97276;
                border-bottom: 1px dashed #e97276;
            }
        }

        .ac-toolbar {
            position: absolute;
            right: 15px;
            bottom: 15px;
            display: flex;
            flex-direction: row;
            justify-content: flex-end;

            &>div:not(:last-child) {
                margin-right: 6px;
            }

            .ac-captcha {
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
                    font-size: 1.2rem;
                    font-family: var(--awesome-comment-font-monospace) !important;
                    width: 80px;
                }
            }
        }

        .ac-tool-panel {
            padding: 0px 8px;
            border: 1px solid #00000059;
            box-sizing: border-box;

            &:first-child {
                margin-top: 10px;
            }

            &:not(:last-child) {
                margin-bottom: 10px;
            }
        }

        .ac-smilies-panel {
            @extend .ac-tool-panel;
        }

        .ac-preview-panel {
            @extend .ac-tool-panel;

            .ac-markdown {
                @extend %awesome-comment-markdown;
            }
        }

        .ac-alert-info {
            @extend %awesome-comment-text;

            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
            display: flex;
            align-items: center;
            flex-direction: column;
            background-color: #4d4d4dc2;

            .ac-h {
                display: flex;
                align-items: center;
                flex-direction: column;
                margin: auto 0px;

                .ac-text {
                    font-size: 1.3rem;
                    margin-bottom: 1rem;
                    text-align: center;
                }
            }

            * {
                color: #ece9e7 !important;
            }
        }
    }

    // 输入框
    #awesome-comment-input {
        width: 100%;
        min-height: 10em;
        font-size: 0.875em;
        margin-top: 0.5rem;
        background: transparent;
        resize: vertical;
        transition: all .25s ease;
        border: 1px solid #50505017;
        word-break: break-all;

        &:focus {
            border: 1px solid #2b805065;
        }
    }

</style>
